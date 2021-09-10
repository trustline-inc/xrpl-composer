import React from "react";
import { Button, Form, Modal } from "react-bootstrap"
import { createEdge } from "../graph"

function CreateTrustLineModal({ show, handleClose, selectedNode }) {
  const [loading, setLoading] = React.useState(false)
  const [target, setTarget] = React.useState()
  const [limit, setLimit] = React.useState()

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
          <Form.Group className="mb-3" controlId="node.Id">
            <Form.Label>Source Node</Form.Label>
            <Form.Control type="text" name="source" value={selectedNode} disabled={true} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="node.Id">
            <Form.Label>Target Node</Form.Label>
            <Form.Control type="text" onChange={onChangeTarget} name="target" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="node.Limit">
            <Form.Label>Limit</Form.Label>
            <Form.Control type="number" onChange={onChangeLimit} name="limit" />
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

export default CreateTrustLineModal;
