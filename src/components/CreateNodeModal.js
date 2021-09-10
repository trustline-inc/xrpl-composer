import React from "react";
import { Button, Form, Modal } from "react-bootstrap"
import { createNode } from "../graph"
import { api } from "../xrpl"

function CreateNodeModal({ show, handleClose }) {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState({
    id: "",
    defaultRipple: false,
    blackholed: false,
    weight: 0
  })

  const onChangeInput = (event) => {
    event.target.value = event.target.value.toUpperCase().replace(" ", "_").replace(/[\W]+/g, "");
    setData({
      ...data,
      [event.target.name]: event.target.value
    })
  }

  const onChangeCheckbox = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.checked
    })
  }

  const handleSave = async () => {
    setLoading(true)
    await api.connect()
    await createNode(data)
    await api.disconnect()
    setLoading(false)
    handleClose()
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Create Node</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="node.Id">
            <Form.Label>Identifier</Form.Label>
            <Form.Control type="text" onChange={onChangeInput} name="id" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="node.defaultRipple">
            <Form.Check
              name="defaultRipple"
              type="checkbox"
              label={"No Ripple"}
              onChange={onChangeCheckbox}
            />
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

export default CreateNodeModal;
