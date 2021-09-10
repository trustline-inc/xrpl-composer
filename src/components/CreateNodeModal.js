import React from "react";
import { Button, Form, Modal } from "react-bootstrap"
import { createNode } from "../graph"
import { api } from "../xrpl"
import DataContext from "../context/DataContext"

function CreateNodeModal({ show, handleClose }) {
  const { data, setData } = React.useContext(DataContext);
  const [loading, setLoading] = React.useState(false)
  const [config, setConfig] = React.useState({
    id: "",
    defaultRipple: false,
    blackholed: false
  })

  const onChangeInput = (event) => {
    event.target.value = event.target.value.toUpperCase().replace(" ", "_").replace(/[\W]+/g, "");
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
    await api.connect()
    await createNode(config)
    await api.disconnect()
    setLoading(false)
    handleClose()
    setData({ ...data, config: localStorage.getItem("config") })
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