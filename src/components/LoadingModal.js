import React from "react";
import { Button, Form, Modal } from "react-bootstrap"

function LoadingModal({ show, handleClose }) {
  const [loading, setLoading] = React.useState(false)

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>In Progress</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-center align-items-center">
          Confirming, please wait...
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default LoadingModal;
