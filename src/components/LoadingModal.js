import React from "react";
import { Modal } from "react-bootstrap"

function LoadingModal({ show, handleClose }) {
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
