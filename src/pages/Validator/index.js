import React from "react";
import { useLocation } from "react-router-dom";
import { Button, Form } from "react-bootstrap"
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

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-4 offset-4">
          <h4>Validator</h4>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Account</Form.Label>
              <Form.Control
                type="text"
                onChange={onChangeAccount}
                defaultValue={account}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination</Form.Label>
              <Form.Control
                type="text"
                onChange={onChangeDestination}
                defaultValue={destination}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination Amount</Form.Label>
              <Form.Control
                type="number"
                onChange={onChangeDestinationAmount}
                defaultValue={destinationValue}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination Currency</Form.Label>
              <Form.Control
                type="text"
                onChange={onChangeDestinationCurrency}
                defaultValue={destinationCurrency}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination Issuer</Form.Label>
              <Form.Control
                type="text"
                onChange={onChangeDestinationIssuer}
                defaultValue={destinationIssuer}
              />
            </Form.Group>
          </Form>
          <Button variant="primary" onClick={submit} disabled={loading}>
            { loading ? <i className="fas fa-spin fa-spinner" /> : "Submit" }
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Validator;
