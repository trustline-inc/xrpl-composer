import React from "react";
import { useHistory } from "react-router";
import logo from "../../assets/logo.png"

function Explorer() {
  const history = useHistory()

  const navigate = (path) => {
    history.push(path)
  }

  return (
    <div className="container py-4">
      <div className="p-5 mb-4 bg-light rounded-3 mt-5">
        <div className="container-fluid py-5">
          <div className="row">
            <div className="col-md-8">
              <h1 className="display-5 fw-bold">Introducing RippleGraph</h1>
              <p className="fs-4">RippleGraph is an open-source XRP Ledger graph composer. It lets you easily build topologies of interconnected accounts and send payments between them.</p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/builder")}>Start Building</button>
            </div>
            <div className="col-md-4 d-flex justify-content-center align-items-center">
              <img src={logo} alt="Logo" />
            </div>
          </div>
        </div>
      </div>
      <div className="row align-items-md-stretch">
        <div className="col-md-6">
          <div className="h-100 p-5 text-white bg-dark rounded-3">
            <h2>View the Graph</h2>
            <p>Visualize a network graph with the graph explorer.</p>
            <button className="btn btn-outline-light" type="button" onClick={() => navigate("/explorer")}>Explore</button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="h-100 p-5 bg-light rounded-3">
            <h2>Validate Paths</h2>
            <p>Check for valid paths and execute payments against them.</p>
            <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/validator")}>Validate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explorer;
