import { RippleAPI } from "ripple-lib"
import axios from "axios"
import { sleep } from "./util"

let LAST_VALIDATED_LEDGER;
const SERVER = "wss://s.altnet.rippletest.net:51233"

export const api = new RippleAPI({
  server: SERVER
});

api.on("ledger", async (ledger) => {
  LAST_VALIDATED_LEDGER = ledger.ledgerVersion
  console.log("Ledger version", ledger.ledgerVersion, "was validated.")
})

api.on("connected", () => {
  console.log(`RippleAPI connected to ${SERVER}.`);
});

api.on("disconnected", () => {
  console.log("RippleAPI disconnected.");
});

export async function blackhole(account) {
  const ACCOUNT_ONE = "rrrrrrrrrrrrrrrrrrrrBZbvji";
  const preparedTx = await api.prepareSettings(account.xAddress, {
    regularKey: ACCOUNT_ONE,
    disableMasterKey: true,
    defaultRipple: true
  });
  const latestLedgerVersion = await api.getLedgerVersion();
  const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion;
  const response = api.sign(preparedTx.txJSON, account.seed);
  const txID = response.id;
  const txBlob = response.signedTransaction;
  const result = await api.submit(txBlob);
  console.log(result)
  const earliestLedgerVersion = latestLedgerVersion + 1;
  return await validateTransaction(
    txID,
    earliestLedgerVersion,
    maxLedgerVersion
  );
}

export async function hasTrustLine(classicAddress, counterparty, currency) {
  const trustlines = await api.getTrustlines(classicAddress)
  return trustlines.some(trustline => (trustline.specification.counterparty === counterparty && trustline.specification.currency === currency))
}

export async function createTrustLine(account, counterparty, currency, limit) {
  console.log(`Creating trust line from ${account.classicAddress} to ${counterparty}`)
  const tx = {
    currency,
    counterparty,
    limit,
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
  const preparedTx = await api.prepareTrustline(account.classicAddress, tx)
  const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
  const response = api.sign(preparedTx.txJSON, account.seed)
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

export async function deleteTrustLine(account, counterparty, currency) {
  console.log(`Deleting trust line from ${account.classicAddress} to ${counterparty}`)
  const tx = {
    currency,
    counterparty,
    limit: "0",
    qualityIn: 1,
    qualityOut: 1,
    ripplingDisabled: true,
    frozen: false,
    memos: [
      {
        type: "test",
        format: "text/plain",
        data: "Apex Dev Summit"
      }
    ]
  }
  const preparedTx = await api.prepareTrustline(account.classicAddress, tx)
  const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
  const response = api.sign(preparedTx.txJSON, account.seed)
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

export async function enableRippling(account) {
  console.log(`Enabling rippling for ${account.classicAddress}`)
  const prepared = await api.prepareSettings(account.classicAddress, { defaultRipple: true })
  const maxLedgerVersion = prepared.instructions.maxLedgerVersion
  const response = api.sign(prepared.txJSON, account.seed)
  const txID = response.id
  const txBlob = response.signedTransaction
  const result = await api.submit(txBlob)
  console.log(result.resultCode, result.resultMessage)
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
        resolve(tx)
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

export async function getSettings(classicAddress) {
  return await api.getSettings(classicAddress)
}

/**
 * @function getTrustLines
 */
 export async function getTrustLines(classicAddress) {
  return await api.getTrustlines(classicAddress)
}

export async function deleteAccount(account) {
  const preparedTx = await api.prepareTransaction({
    TransactionType: "AccountDelete",
    Account: account.classicAddress
  })
  const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
  console.log("preparedTx:", preparedTx)
  console.log("Transaction cost:", preparedTx.instructions.fee, "XRP")
  console.log("Transaction expires after ledger:", maxLedgerVersion)
  const response = api.sign(preparedTx.txJSON, account.seed)
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

export async function makePayment(
  sender,
  receiver,
  amount,
  path
) {
  let latestLedgerVersion = await api.getLedgerVersion()
  const tx = {
    TransactionType: "Payment",
    Account: sender.classicAddress,
    Amount: amount,
    Destination: receiver.classicAddress,
    LastLedgerSequence: latestLedgerVersion + 15,
  }
  if (path) tx.Paths = [JSON.parse(path)]
  const preparedTx = await api.prepareTransaction(tx)
  const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
  console.log("preparedTx:", preparedTx)
  console.log("Transaction cost:", preparedTx.instructions.fee, "XRP")
  console.log("Transaction expires after ledger:", maxLedgerVersion)
  const response = api.sign(preparedTx.txJSON, sender.seed)
  const txID = response.id
  console.log("Identifying hash:", txID)
  const txBlob = response.signedTransaction
  console.log("Signed blob:", txBlob)
  latestLedgerVersion = await api.getLedgerVersion()
  try {
    const result = await api.submit(txBlob)
    if (result.resultCode !== "tesSUCCESS") return result
    console.log("Tentative result code:", result.resultCode)
    console.log("Tentative result message:", result.resultMessage)
    const earliestLedgerVersion = latestLedgerVersion + 1
    return await validateTransaction(
      txID,
      earliestLedgerVersion,
      maxLedgerVersion
    )
  } catch (err) {
    console.log("err...")
    console.log(err)
  }
}