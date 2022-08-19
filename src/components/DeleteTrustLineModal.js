import React from "react";
import { Button, Form, Modal, FloatingLabel, InputGroup, FormControl } from "react-bootstrap"
import { deleteEdge } from "../graph"
import DataContext from "../context/DataContext"

function DeleteTrustLineModal({ show, handleClose, selectedNode }) {
  const config = JSON.parse(localStorage.getItem("config")) || {}
  const { setData } = React.useContext(DataContext);
  const [loading, setLoading] = React.useState(false)
  const [target, setTarget] = React.useState()
  const [currency, setCurrency] = React.useState("")

  const onChangeTarget = (event) => {
    event.target.value = event.target.value.toUpperCase().replace(" ", "_").replace(/[\W]+/g, "");
    setTarget(event.target.value)
  }

  const onChangeCurrency = (event) => {
    setCurrency(event.target.value)
  }

  const handleSave = async () => {
    setLoading(true)
    await deleteEdge(selectedNode, target, currency)
    setLoading(false)
    handleClose()
    setData({
      config: JSON.parse(localStorage.getItem("config")),
      graph: JSON.parse(localStorage.getItem("graph"))
    })
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Delete Trust Line</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Source Node</Form.Label>
            <Form.Control type="text" name="source" value={selectedNode} disabled={true} />
          </Form.Group>
          <Form.Group className="mb-3">
            <FloatingLabel controlId="floatingSelect" label="Target Node">
              <Form.Control as="select" aria-label="Target Node" onChange={onChangeTarget}>
                <option>Select a target node</option>
                {
                  (() => {
                    return Object.keys(config).map(account => (
                      <option key={account} value={account}>{account}</option>
                    ))
                  })()
                }
              </Form.Control>
            </FloatingLabel>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Currency</Form.Label>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="USD"
                type="text"
                onChange={onChangeCurrency}
                value={currency}
              />
            </InputGroup>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          { loading ? <i className="fas fa-spin fa-spinner"></i> : "Save" }
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteTrustLineModal;
