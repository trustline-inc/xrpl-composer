import Graph from "graph-data-structure";
import { createAccount, hasTrustLine, createTrustLine, enableRippling } from "./xrpl"

const saved = window.localStorage.getItem("graph")
const graph = Graph(JSON.parse(saved));

export async function createAccountNode(data) {
  const { id, noRipple } = data;
  let accounts = window.localStorage.getItem("accounts")

  if (!accounts) {
    accounts = {}
  } else {
    accounts = JSON.parse(accounts)
  }

  if (!accounts[id]) {
    const account = await createAccount()
    if (!noRipple) await enableRippling(account)
    accounts[id] = { account, noRipple }
    const newAccounts = JSON.stringify(accounts, null, 2);
    window.localStorage.setItem("accounts", newAccounts)
    console.log(`${id}:`, account.address)
  } else {
    throw Error("An account with this ID already exists.")
  }
  graph.addNode(id);
  window.localStorage.setItem("graph", JSON.stringify(graph.serialize()))
}

export async function createTrustLineEdge(source, target, limit) {
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

export default graph