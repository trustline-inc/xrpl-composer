import React from "react";
import { Button, Form, Modal } from "react-bootstrap"
import { createNode } from "../graph"
import DataContext from "../context/DataContext"

function CreateNodeModal({ show, handleClose }) {
  const { setData } = React.useContext(DataContext);
  const [loading, setLoading] = React.useState(false)
  const [config, setConfig] = React.useState({
    id: "",
    address: null,
    defaultRipple: false,
    blackholed: false
  })

  const onChangeIdentifier = (event) => {
    event.target.value = event.target.value.toUpperCase().replace(" ", "_").replace(/[\W]+/g, "");
    setConfig({
      ...config,
      [event.target.name]: event.target.value
    })
  }

  const onChangeAddress = (event) => {
    setConfig({
      ...config,
      [event.target.name]: event.target.value
    })
  }

  const onChangeCheckbox = (event) => {
    setConfig({
      ...config,
      [event.target.name]: event.target.checked
    })
  }

  const handleSave = async () => {
    setLoading(true)
    await createNode(config)
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
        <Modal.Title>Create Node</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="node.Id">
            <Form.Label>Identifier</Form.Label>
            <Form.Control type="text" onChange={onChangeIdentifier} name="id" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              name="defaultRipple"
              type="checkbox"
              label={"Enable Default Ripple"}
              onChange={onChangeCheckbox}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="node.address">
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" onChange={onChangeAddress} name="address" />
            <Form.Text>Use an existing account (read-only)</Form.Text>
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
