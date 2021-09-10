import React from "react";
import { NavLink } from "react-router-dom"
import { Badge } from "react-bootstrap"
import DataContext from "../context/DataContext"

function Navbar() {
  const { data } = React.useContext(DataContext)

  const download = () => {
    const exportData = []
    if (data.graph) exportData.push("graph")
    if (data.config) exportData.push("config")
    exportData.forEach(type => {
      const jsonData = JSON.stringify(data[type])
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", type + ".json");
      document.body.appendChild(downloadAnchorNode); // Required for Firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    })
  }

  return (
    <div className="Navbar">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            RippleGraph <Badge bg="primary" pill>BETA</Badge>
          </a>
          <>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <NavLink className="nav-link" activeClassName="active" aria-current="page" to="/explorer">Explorer</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" activeClassName="active" aria-current="page" to="/builder">Builder</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" activeClassName="active" aria-current="page" to="/validator">Validator</NavLink>
                </li>
              </ul>
              <button className="btn btn-outline-success my-2 my-sm-0" id="downloadAnchorElem" onClick={download} disabled={Object.keys(data.config).length === 0 && Object.keys(data.graph).length === 0}>Download</button>
            </div>
          </>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
