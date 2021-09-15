import React from "react";
import { useHistory } from "react-router";
import logo from "../../assets/logo.png"

function Explorer() {
  const history = useHistory()

  const navigate = (path) => {
    history.push(path)
  }

  return (
    <div className="container">
      <div className="row mt-3">
        <div className="col-12">
          <div className="mt-5 d-none d-sm-block" />
          <div className="bg-light rounded-3 border">
            <div className="container-fluid p-5">
              <div className="row">
                <div className="col-md-8">
                  <h1 className="display-5 fw-bold">Introducing XRPL Graph</h1>
                  <p className="fs-4">XRPL Graph is an open-source XRP Ledger graph composer. It lets you easily build topologies of interconnected accounts and send payments between them.</p>
                  <button className="btn btn-primary btn-lg" onClick={() => navigate("/builder")}>Start Building</button>
                </div>
                <div className="col-md-4 d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
                  <img src={logo} alt="Mesh Sphere by Paul Krizsan from the Noun Project" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-3" />       
      <div className="row align-items-md-stretch">
        <div className="col-md-6 mb-3">
          <div className="h-100 p-5 text-white bg-dark rounded-3">
            <h2>View the Graph</h2>
            <p>Visualize a network graph with the graph explorer.</p>
            <button className="btn btn-outline-light" type="button" onClick={() => navigate("/explorer")}>Explore</button>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="h-100 p-5 bg-light rounded-3 border">
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
