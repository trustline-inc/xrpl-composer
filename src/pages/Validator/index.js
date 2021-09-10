import React from "react";
import { useLocation } from "react-router-dom";
import { Button, Form, InputGroup, FormControl } from "react-bootstrap"
import { updateEdges } from "../../graph"

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

  const onClick = async () => {
    setLoading(true)
    await updateEdges()
    setLoading(false)
  }

  const onChange = async (event) => {
    
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-4 offset-4">
          <h4>Validator</h4>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Source</Form.Label>
              <Form.Control
                type="text"
                onChange={onChange}
                defaultValue={account}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination</Form.Label>
              <Form.Control
                type="text"
                onChange={onChange}
                defaultValue={destination}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination Amount</Form.Label>
              <Form.Control
                type="number"
                onChange={onChange}
                defaultValue={destinationValue}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination Currency</Form.Label>
              <Form.Control
                type="text"
                onChange={onChange}
                defaultValue={destinationCurrency}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination Issuer</Form.Label>
              <Form.Control
                type="text"
                onChange={onChange}
                defaultValue={destinationIssuer}
              />
            </Form.Group>
          </Form>
          <Button variant="primary" onClick={onClick} disabled={loading}>
            { loading ? <i className="fas fa-spin fa-spinner" /> : "Submit" }
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Validator;
