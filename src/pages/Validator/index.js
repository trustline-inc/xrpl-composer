import React from "react";
import { useLocation } from "react-router-dom";
import { Button, Form, Row, Col } from "react-bootstrap"
import { updateEdges } from "../../graph"
import { api } from "../../xrpl";
import DataContext from "../../context/DataContext"

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Validator() {
  const query = useQuery();
  const [loading, setLoading] = React.useState(false)
  const [source, setSource] = React.useState(query.get("account"))
  const [destinationCurrency, setDestinationCurrency] = React.useState("AUR")
  const [destinationValue, setDestinationValue] = React.useState(1)
  const [destinationIssuer, setDestinationIssuer] = React.useState("")
  const [sourceCurrency, setSourceCurrency] = React.useState("AUR")
  const [sourceValue, setSourceValue] = React.useState(1)
  const [sourceIssuer, setSourceIssuer] = React.useState("")
  const [destination, setDestination] = React.useState("")
  const config = React.useMemo(() => {
    return JSON.parse(localStorage.getItem("config")) || {}
  }, [])
  const { data, setData } = React.useContext(DataContext);
  const [paths, setPaths] = React.useState()
  const [path, setPath] = React.useState()
  const ws = React.useRef(null);

  /**
   * Manage WebSocket lifecycle
   */
  React.useEffect(() => {
    if (source && destination && destinationIssuer && sourceIssuer) {
      const WEBSOCKET_SERVER = "wss://s.altnet.rippletest.net:51233/"
      ws.current = new WebSocket(WEBSOCKET_SERVER);
      ws.current.onopen = () => {
        ws.current.send(JSON.stringify({
          command: "path_find",
          destination_account: config[destination].account.address,
          destination_amount: {
            value: destinationValue,
            currency: destinationCurrency,
            issuer: config[destinationIssuer].account.address
          },
          currency: sourceCurrency,
          issuer: config[sourceIssuer].account.address,
          value: sourceValue,
          id: 8,
          source_account: config[source].account.address,
          subcommand: "create"
        }))
      }
      ws.current.onclose = () => {
        console.log(`Disconnected from ${WEBSOCKET_SERVER}`)
      }
      ws.current.onmessage = event => {
        const message = JSON.parse(event.data)
        setPaths(message)
        ws.current.close();
      };
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [
    source,
    sourceValue,
    sourceIssuer,
    sourceCurrency,
    destination,
    destinationIssuer,
    destinationValue,
    destinationCurrency,
    config
  ])

  const submit = async () => {
    try {
      setLoading(true)
      const amount = {
        currency: destinationCurrency,
        issuer: config[destinationIssuer].account.address,
        value: destinationValue.toString()
      }
      await api.connect()
      // todo: fix
      const response = await updateEdges(source, destination, amount, path)
      setData({ ...data, graph: JSON.parse(localStorage.getItem("graph")) })
      alert(JSON.stringify(response, null, 2))
      await api.disconnect()
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const onChangeSource = async (event) => {
    const value = event.target.value
    setSource(value)
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

  const onChangeSourceValue = async (event) => {
    const value = event.target.value
    setSourceValue(value)
  }

  const onChangeSourceCurrency = async (event) => {
    const value = event.target.value
    setSourceCurrency(value)
  }

  const onChangeSourceIssuer = async (event) => {
    const value = event.target.value
    setSourceIssuer(value)
  }

  const onChangePaths = async (event) => {
    const value = event.target.value
    console.log(value)
    setPath(value)
  }

  return (
    <div className="container mt-5">
      <div className="row mb-5">
        <div className="col-md-6 border p-5">
          <h4>Payment Form</h4>
          <Form>
            <h5>Source</h5>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Source Account</Form.Label>
                <Form.Select aria-label="Source Account" onChange={onChangeSource} defaultValue={source}>
                  <option>Select...</option>
                  {
                    (() => {
                      return Object.keys(config).map(account => (
                        <option key={account} value={account}>{account}</option>
                      ))
                    })()
                  }
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Source Amount (Max)</Form.Label>
                <Form.Control type="number" onChange={onChangeSourceValue} defaultValue={sourceValue} />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Source Currency</Form.Label>
                <Form.Control type="text" onChange={onChangeSourceCurrency} defaultValue={sourceCurrency} />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Source Issuer</Form.Label>
                <Form.Select aria-label="Issuer" onChange={onChangeSourceIssuer} defaultValue={sourceIssuer}>
                  <option>Select...</option>
                  {
                    (() => {
                      return Object.keys(config).map(account => (
                        <option key={account} value={account}>{account}</option>
                      ))
                    })()
                  }
                </Form.Select>
              </Form.Group>
            </Row>
            <h5>Destination</h5>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Destination Account</Form.Label>
                <Form.Select aria-label="Destination Account" onChange={onChangeDestination} defaultValue={destination}>
                  <option>Select...</option>
                  {
                    (() => {
                      return Object.keys(config).map(account => (
                        <option key={account} value={account}>{account}</option>
                      ))
                    })()
                  }
                </Form.Select>
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
                <Form.Select aria-label="Destination Issuer" onChange={onChangeDestinationIssuer} defaultValue={destinationIssuer}>
                  <option>Select...</option>
                  {
                    (() => {
                      return Object.keys(config).map(account => (
                        <option key={account} value={account}>{account}</option>
                      ))
                    })()
                  }
                </Form.Select>
              </Form.Group>
            </Row>
            <h5>Paths <span className="text-muted">(Optional)</span></h5>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Control as="textarea" rows={4} onChange={onChangePaths} />
              </Form.Group>
            </Row>
          </Form>
          <Button variant="primary" onClick={submit} disabled={loading}>
            { loading ? <i className="fas fa-spin fa-spinner" /> : "Submit" }
          </Button>
        </div>
        <div className="col-md-6 p-5 border">
          <h4>Suggested Paths (<code>rippled</code>)</h4>
          {
            paths ? (
              <pre className="bg-light p-4 h-100 border rounded">
                {JSON.stringify(paths, null, 2)}
              </pre>
            ) : (
              <div className="bg-light p-5 d-flex justify-content-center align-items-center border rounded" style={{ height: "calc(100% - 35px)"}}>
                Paths will populate here
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default Validator;
