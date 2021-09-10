import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom"
import { Badge } from "react-bootstrap"
import Home from "./pages/Home"
import Explorer from "./pages/Explorer"
import Builder from "./pages/Builder"
import Validator from "./pages/Validator"
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
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
              </div>
            </>
          </div>
        </nav>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/explorer">
            <Explorer />
          </Route>
          <Route path="/builder">
            <Builder />
          </Route>
          <Route path="/validator">
            <Validator />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
