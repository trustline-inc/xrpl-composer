import React from "react";
import { Button, Form, Modal } from "react-bootstrap"

function LoadingModal({ show, handleClose }) {
  const [loading, setLoading] = React.useState(false)

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>In Progress...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <span className="fa fa-spin fa-spinner fa-3x" />
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default LoadingModal;
