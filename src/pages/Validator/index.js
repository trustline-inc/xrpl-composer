import React from "react";
import { useLocation } from "react-router-dom";
import { Button, Form, Row, Col } from "react-bootstrap"
import { updateEdges } from "../../graph"
import { api } from "../../xrpl";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Validator() {
  const query = useQuery();
  const [loading, setLoading] = React.useState(false)
  const [account, setAccount] = React.useState(query.get("account"))
  const [destinationCurrency, setDestinationCurrency] = React.useState("AUR")
  const [destinationValue, setDestinationValue] = React.useState(1)
  const [destinationIssuer, setDestinationIssuer] = React.useState("")
  const [sendMaxCurrency, setSendMaxCurrency] = React.useState("AUR")
  const [sendMaxValue, setSendMaxValue] = React.useState(1)
  const [sendMaxIssuer, setSendMaxIssuer] = React.useState("")
  const [destination, setDestination] = React.useState("")
  const accounts = JSON.parse(localStorage.getItem("accounts"))
  const [paths, setPaths] = React.useState()

  React.useEffect(() => {
    const WEBSOCKET_SERVER = "wss://s.altnet.rippletest.net:51233/"
    const ws = new WebSocket(WEBSOCKET_SERVER)

    ws.onopen = () => {
      if (account && destination && destinationIssuer && sendMaxIssuer)
      ws.send(JSON.stringify({
        command: "path_find",
        destination_account: accounts[destination].account.address,
        destination_amount: {
          value: destinationValue,
          currency: destinationCurrency,
          issuer: accounts[destinationIssuer].account.address
        },
        currency: "AUR",
        issuer: accounts[destinationIssuer].account.address,
        value: "1",
        id: 8,
        source_account: accounts[account].account.address,
        subcommand: "create"
      }))
    }

    ws.onmessage = event => {
      const message = JSON.parse(event.data)
      setPaths(message)
    }

    ws.onclose = () => {
      console.log(`Disconnected from ${WEBSOCKET_SERVER}`)
    }

    return () => {
      ws.close()
    }
  }, [account, destination, destinationIssuer, sendMaxIssuer, accounts, destinationCurrency, destinationValue])

  const submit = async () => {
    setLoading(true)
    const amount = {
      currency: destinationCurrency,
      issuer: accounts[destinationIssuer].account.address,
      value: destinationValue.toString()
    }
    await api.connect()
    const response = await updateEdges(
      accounts[account].account,
      accounts[destination].account.address,
      amount
    )
    alert(JSON.stringify(response))
    await api.disconnect()
    setLoading(false)
  }

  const onChangeAccount = async (event) => {
    const value = event.target.value
    setAccount(value)
  }

  const onChangeDestination = async (event) => {
    const value = event.target.value
    setDestination(value)
  }

  const onChangeDestinationAmount = async (event) => {
    const value = event.target.value
    setDestinationValue(value)
  }

  const onChangeDestinationCurrency = async (event) => {
    const value = event.target.value
    setDestinationCurrency(value)
  }

  const onChangeDestinationIssuer = async (event) => {
    const value = event.target.value
    setDestinationIssuer(value)
  }

  const onChangeSendMaxValue = async (event) => {
    const value = event.target.value
    setSendMaxValue(value)
  }

  const onChangeSendMaxCurrency = async (event) => {
    const value = event.target.value
    setSendMaxCurrency(value)
  }

  const onChangeSendMaxIssuer = async (event) => {
    const value = event.target.value
    setSendMaxIssuer(value)
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-6">
          <h4>Payment Form</h4>
          <p className="text-muted border rounded p-3">
            <span className="fa fa-info-circle" /> Use node IDs instead of account addresses.
          </p>
          <Form>
            <h4>Source</h4>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Source Account</Form.Label>
                <Form.Control type="text" onChange={onChangeAccount} defaultValue={account} />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Max Amount</Form.Label>
                <Form.Control type="number" onChange={onChangeSendMaxValue} defaultValue={sendMaxValue} />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Currency</Form.Label>
                <Form.Control type="text" onChange={onChangeSendMaxCurrency} defaultValue={sendMaxCurrency} />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Issuer</Form.Label>
                <Form.Control type="text" onChange={onChangeSendMaxIssuer} defaultValue={sendMaxIssuer} />
              </Form.Group>
            </Row>
            <h4>Destination</h4>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Destination Account</Form.Label>
                <Form.Control type="text" onChange={onChangeDestination} defaultValue={destination} />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Destination Amount</Form.Label>
                <Form.Control type="number" onChange={onChangeDestinationAmount} defaultValue={destinationValue} />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Destination Currency</Form.Label>
                <Form.Control type="text" onChange={onChangeDestinationCurrency} defaultValue={destinationCurrency} />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Destination Issuer</Form.Label>
                <Form.Control type="text" onChange={onChangeDestinationIssuer} defaultValue={destinationIssuer} />
              </Form.Group>
            </Row>
          </Form>
          <Button variant="primary" onClick={submit} disabled={loading}>
            { loading ? <i className="fas fa-spin fa-spinner" /> : "Submit" }
          </Button>
        </div>
        <div className="col-6">
          <h4>Valid Paths</h4>
          <pre className="bg-light p-5">
            {JSON.stringify(paths, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Validator;
