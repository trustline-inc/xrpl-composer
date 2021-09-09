import { RippleAPI } from "ripple-lib"
import axios from "axios"
import { sleep } from "./util"

let LAST_VALIDATED_LEDGER;

export const api = new RippleAPI({
  server: 'wss://s.altnet.rippletest.net:51233'
});

api.on("ledger", async (ledger) => {
  LAST_VALIDATED_LEDGER = ledger.ledgerVersion
  console.log("Ledger version", ledger.ledgerVersion, "was validated.")
})

export async function createAccount() {
  const address = api.generateAddress({ test: true })
  await axios("https://faucet.altnet.rippletest.net/accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      destination: address.classicAddress,
      xrpAmount: "100"
    }
  })
  await sleep(10000)
  return address
}

export async function hasTrustLine(address, counterparty) {
  const trustlines = await api.getTrustlines(address)
  return trustlines.some(trustline => trustline.specification.counterparty === counterparty)
}

export async function createTrustLine(account, counterparty) {
  console.log(`Creating trust line from ${account.address} to ${counterparty}`)
  const tx = {
    currency: "AUR",
    counterparty: counterparty,
    limit: "999999999",
    qualityIn: 1,
    qualityOut: 1,
    ripplingDisabled: false,
    frozen: false,
    memos: [
      {
        type: "test",
        format: "text/plain",
        data: "Apex Dev Summit"
      }
    ]
  }
  const preparedTx = await api.prepareTrustline(account.address, tx)
  const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
  const response = api.sign(preparedTx.txJSON, account.secret)
  const txID = response.id
  console.log("Identifying hash:", txID)
  const txBlob = response.signedTransaction
  console.log("Signed blob:", txBlob)
  const result = await api.submit(txBlob)
  console.log("Tentative result code:", result.resultCode)
  console.log("Tentative result message:", result.resultMessage)
  const latestLedgerVersion = await api.getLedgerVersion()
  const earliestLedgerVersion = latestLedgerVersion + 1
  await validateTransaction(
    txID,
    earliestLedgerVersion,
    maxLedgerVersion
  )
}

export async function validateTransaction(
  txID,
  earliestLedgerVersion,
  maxLedgerVersion
) {
  return new Promise((resolve) => {
    const checkTransaction = setInterval(async () => {
      try {
        const tx = await api.getTransaction(txID, {
          minLedgerVersion: earliestLedgerVersion
        })
        clearInterval(checkTransaction)
        if (tx.outcome.result !== "tesSUCCESS") resolve(false)
        resolve(true)
      } catch (error) {
        const message =
          "Transaction has not been validated yet; try again later"
        if (error.message === message) return
      }

      if (LAST_VALIDATED_LEDGER > maxLedgerVersion) {
        clearInterval(checkTransaction)
        resolve(false)
      }
    }, 1000)
  })
}

export async function getSettings(address) {
  return await api.getSettings(address)
}

/**
 * @function getTrustLines
 */
 export async function getTrustLines(address) {
  return await api.getTrustlines(address)
}