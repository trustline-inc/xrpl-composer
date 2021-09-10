import Graph from "graph-data-structure";
import {
  createAccount,
  hasTrustLine,
  createTrustLine,
  enableRippling,
  deleteAccount,
  makePayment
} from "./xrpl"

const saved = localStorage.getItem("graph")
const graph = Graph(JSON.parse(saved));

/**
 * @function createNode
 * @param {*} data 
 */
export async function createNode(data) {
  const { id, defaultRipple } = data;
  let config = localStorage.getItem("config")

  if (!config) {
    config = {}
  } else {
    config = JSON.parse(config)
  }

  if (!config[id]) {
    const account = await createAccount()
    if (!defaultRipple) await enableRippling(account)
    config[id] = { account, ...data }
    const newConfig = JSON.stringify(config, null, 2);
    localStorage.setItem("config", newConfig)
    console.log(`${id}:`, account.address)
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
export async function createEdge(source, target, limit) {
  let config = localStorage.getItem("config")

  if (!config) {
    config = {}
  } else {
    config = JSON.parse(config)
  }

  if (!await hasTrustLine(config[source].account.address, config[target].account.address)) {
    await createTrustLine(config[source].account, config[target].account.address)
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
  await deleteAccount(config[id].account)
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
export async function updateEdges(source, destination, amount) {
  const tx = await makePayment(source, destination, amount)
  // Update edges based on the result
  console.log(tx)
  return tx
}

export default graph