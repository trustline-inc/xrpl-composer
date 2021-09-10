import Graph from "graph-data-structure";
import {
  createAccount,
  hasTrustLine,
  createTrustLine,
  enableRippling,
  deleteAccount,
  makePayment
} from "./xrpl"

const saved = window.localStorage.getItem("graph")
const graph = Graph(JSON.parse(saved));

export async function createNode(data) {
  const { id, defaultRipple } = data;
  let accounts = window.localStorage.getItem("accounts")

  if (!accounts) {
    accounts = {}
  } else {
    accounts = JSON.parse(accounts)
  }

  if (!accounts[id]) {
    const account = await createAccount()
    if (!defaultRipple) await enableRippling(account)
    accounts[id] = { account, defaultRipple }
    const newAccounts = JSON.stringify(accounts, null, 2);
    window.localStorage.setItem("accounts", newAccounts)
    console.log(`${id}:`, account.address)
  } else {
    throw Error("An account with this ID already exists.")
  }
  graph.addNode(id);
  window.localStorage.setItem("graph", JSON.stringify(graph.serialize()))
}

export async function createEdge(source, target, limit) {
  let accounts = window.localStorage.getItem("accounts")

  if (!accounts) {
    accounts = {}
  } else {
    accounts = JSON.parse(accounts)
  }

  if (!await hasTrustLine(accounts[source].account.address, accounts[target].account.address)) {
    await createTrustLine(accounts[source].account, accounts[target].account.address)
  }
  graph.addEdge(source, target);
  graph.setEdgeWeight(source, target, 0)
  window.localStorage.setItem("graph", JSON.stringify(graph.serialize()))
}

export async function removeNode(id) {
  let accounts = JSON.parse(window.localStorage.getItem("accounts"))
  await deleteAccount(accounts[id].account)
  const edges = graph.adjacent(id)
  edges.forEach(edge => {
    graph.removeEdge(id, edge)
  })
  graph.removeNode(id)
  window.localStorage.setItem("graph", JSON.stringify(graph.serialize()))
  delete accounts[id]
  window.localStorage.setItem("accounts", JSON.stringify(accounts))
}

export async function updateEdges(source, destination, amount) {
  return await makePayment(source, destination, amount)
}

export default graph