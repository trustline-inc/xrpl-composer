import React from "react";
import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom"
import Home from "./pages/Home"
import Explorer from "./pages/Explorer"
import Builder from "./pages/Builder"
import Validator from "./pages/Validator"
import DataContext from "./context/DataContext"
import Navbar from "./components/Navbar"
import './App.css';

function App() {
  const [data, setData] = React.useState({
    config: JSON.parse(localStorage.getItem("config")) || {},
    graph: JSON.parse(localStorage.getItem("graph")) || {}
  });
  const value = React.useMemo(
    () => ({ data, setData }),
    [data]
  );
  return (
    <div className="App">
      <DataContext.Provider value={value}>
        <Router>
          <Navbar data={data} />
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
      </DataContext.Provider>
    </div>
  );
}

export default App;
