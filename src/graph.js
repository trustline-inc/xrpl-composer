import Graph from "graph-data-structure";
import { Client, Wallet } from "xrpl"
import {
  hasTrustLine,
  createTrustLine,
  enableRippling,
  makePayment
} from "./xrpl"

const saved = localStorage.getItem("graph")
const graph = Graph(JSON.parse(saved));

/**
 * @function createNode
 * @param {*} data 
 */
export async function createNode(data) {
  const { id, defaultRipple, seed } = data;
  let config = localStorage.getItem("config")

  if (!config) {
    config = {}
  } else {
    config = JSON.parse(config)
  }

  if (!config[id]) {
    const wallet = Wallet.fromSecret(seed)
    const api = new Client("wss://s.altnet.rippletest.net:51233")
    await api.connect()
    const { wallet: _wallet } = await api.fundWallet(wallet)
    const account = {
      xAddress: _wallet.xAddress,
      secret: _wallet.seed,
      classicAddress: _wallet.classicAddress,
      address: _wallet.address
    }
    config[id] = { account }

    console.log(`${id}:`, account.address)
    if (defaultRipple) await enableRippling(account)
    config[id] = { account, ...data }

    const newConfig = JSON.stringify(config, null, 2);
    localStorage.setItem("config", newConfig)
  } else {
    throw Error("An account with this ID already exists.")
  }
  graph.addNode(id);
  localStorage.setItem("graph", JSON.stringify(graph.serialize()))
}

/**
 * @function createEdge
 * @param {*} source 
 * @param {*} target 
 * @param {*} limit 
 */
export async function createEdge(source, target, currency, limit) {
  let config = localStorage.getItem("config")

  if (!config) {
    config = {}
  } else {
    config = JSON.parse(config)
  }

  if (!await hasTrustLine(config[source].account.seed, config[target].account.seed, currency)) {
    await createTrustLine(config[source].account, config[target].account.seed, currency, limit)
  }
  graph.addEdge(source, target);
  graph.setEdgeWeight(source, target, 0)
  localStorage.setItem("graph", JSON.stringify(graph.serialize()))
}

/**
 * @function removeNode
 * @param {*} id 
 */
export async function removeNode(id) {
  let config = JSON.parse(localStorage.getItem("config"))
  // @todo: #2 Fix error `Rippled: Submit Failed`
  // await deleteAccount(config[id].account)
  const edges = graph.adjacent(id)
  edges.forEach(edge => {
    graph.removeEdge(id, edge)
  })
  graph.removeNode(id)
  localStorage.setItem("graph", JSON.stringify(graph.serialize()))
  delete config[id]
  localStorage.setItem("config", JSON.stringify(config))
}

/**
 * @function updateEdges
 * @param {*} source 
 * @param {*} destination 
 * @param {*} amount 
 * @returns 
 */
export async function updateEdges(source, destination, amount, path) {
  const config = JSON.parse(localStorage.getItem("config"))
  const tx = await makePayment(config[source].account, config[destination].account.seed, amount, path)
  console.log(tx)
  if (tx.resultCode === "tecPATH_PARTIAL") {
  } else if (tx.resultCode === "tecPATH_DRY") {
  } else {
    const value = Number(tx.outcome.deliveredAmount.value)
    const oldWeight = graph.getEdgeWeight(source, destination)
    const newWeight = oldWeight + value
    console.log("Old weight:", oldWeight)
    console.log("New weight:", newWeight)
    graph.setEdgeWeight(source, destination, newWeight)
    console.log(graph.getEdgeWeight(destination, source))
    console.log(graph.serialize())
    localStorage.setItem("graph", JSON.stringify(graph.serialize()))
  }

  return tx
}

export default graph