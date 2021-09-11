import React from "react";
import { NavLink } from "react-router-dom"
import { Badge, Container, Nav, Navbar as Navigation } from "react-bootstrap"
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
      <Navigation bg="light" expand="lg">
        <Container fluid>
          <Navigation.Brand href="/">RippleGraph <Badge bg="primary" pill>BETA</Badge></Navigation.Brand>
          <Navigation.Toggle aria-controls="menu" />
          <Navigation.Collapse id="menu">
            <Nav className="me-auto">
              <NavLink className="nav-link" activeClassName="active" aria-current="page" to="/explorer">Explorer</NavLink>
              <NavLink className="nav-link" activeClassName="active" aria-current="page" to="/builder">Builder</NavLink>
              <NavLink className="nav-link" activeClassName="active" aria-current="page" to="/validator">Validator</NavLink>
            </Nav>
            <Nav>
              <button className="ml-auto btn btn-outline-success my-2 my-sm-0" id="downloadAnchorElem" onClick={download} disabled={Object.keys(data.config).length === 0 && Object.keys(data.graph).length === 0}>Download</button>
            </Nav>
          </Navigation.Collapse>
        </Container>
      </Navigation>
    </div>
  );
}

export default Navbar;
