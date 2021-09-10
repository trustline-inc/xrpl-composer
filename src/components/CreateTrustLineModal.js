import React from "react";
import { Button, Form, Modal, FloatingLabel, InputGroup, FormControl } from "react-bootstrap"
import { createEdge } from "../graph"

function CreateTrustLineModal({ show, handleClose, selectedNode }) {
  const [loading, setLoading] = React.useState(false)
  const [target, setTarget] = React.useState()
  const [limit, setLimit] = React.useState(0)

  const onChangeTarget = (event) => {
    event.target.value = event.target.value.toUpperCase().replace(" ", "_").replace(/[\W]+/g, "");
    setTarget(event.target.value)
  }

  const onChangeLimit = (event) => {
    setLimit(event.target.value)
  }

  const handleSave = async () => {
    setLoading(true)
    await createEdge(selectedNode, target, limit)
    setLoading(false)
    handleClose()
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Create Trust Line</Modal.Title>
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
                    const accounts = JSON.parse(localStorage.getItem("accounts"))
                    return Object.keys(accounts).map(account => (
                      <option key={account} value={account}>{account}</option>
                    ))
                  })()
                }
              </Form.Control>
            </FloatingLabel>
          </Form.Group>
          <InputGroup className="mb-3">
            <FormControl
              type="number"
              onChange={onChangeLimit}
              value={limit}
            />
            <Button variant="outline-secondary" onClick={() => setLimit(999999999)}>
              Max
            </Button>
          </InputGroup>
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

export default CreateTrustLineModal;
