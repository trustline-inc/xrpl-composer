import React from "react";
import { NavLink, Switch, Route, useRouteMatch, useLocation } from "react-router-dom";
import CreateNodeModal from "../../components/CreateNodeModal";
import CreateTrustLineModal from "../../components/CreateTrustLineModal";
import { api, getSettings, getTrustLines } from "../../xrpl"

function Builder() {
  const { path, url } = useRouteMatch();
  const [selectedNode, setSelectedNode] = React.useState(undefined)
  const [showCreateNodeModal, setShowNodeModal] = React.useState(false);
  const [showTrustLineModal, setShowTrustLineModal] = React.useState(false);
  const [accountTrustLines, setAccountTrustLines] = React.useState(undefined)
  const [accountSettings, setAccountSettings] = React.useState(undefined)
  const accounts = React.useMemo(() => {
    return JSON.parse(window.localStorage.getItem("accounts")) || {};
  }, []);
  const hasAccounts = Object.keys(accounts).length !== 0
  const location = useLocation();

  const handleCloseCreateNodeModal = () => setShowNodeModal(false);
  const handleShowNodeModal = () => setShowNodeModal(true);

  const handleCloseTrustLineModal = () => setShowTrustLineModal(false);
  const handleShowTrustLineModal = () => setShowTrustLineModal(true);

  /**
   * Fetch node info when selected
   */
  React.useEffect(() => {
    (async () => {
      if (selectedNode) {
        await api.connect()
        const settings = await getSettings(accounts[selectedNode].account.address)
        const trustLines = await getTrustLines(accounts[selectedNode].account.address)
        setAccountSettings(settings)
        setAccountTrustLines(trustLines)
        await api.disconnect()
      }
    })()
  }, [selectedNode, accounts])

  /**
   * Check if a node is already selected on page load
   */
  React.useEffect(() => {
    if (location.pathname.match(new RegExp("/builder/*."))) {
      setSelectedNode(location.pathname.split("/")[2])
    }
  }, [location.pathname])

  return (
    <div className="container-fluid mt-5">
      <CreateNodeModal show={showCreateNodeModal} handleClose={handleCloseCreateNodeModal} />
      <CreateTrustLineModal show={showTrustLineModal} handleClose={handleCloseTrustLineModal} />
      <div className="row">
        <div className="col-3">
          <h4>Nodes</h4>
          <p className="text-muted">Please select a node from the list below or create a new node.</p>
          <div className="list-group">
            {
              hasAccounts ? (
                Object.keys(accounts).map(id => (
                  <NavLink key={id} to={`${url}/${id}`} onClick={() => setSelectedNode(id)} activeClassName="active" className="list-group-item list-group-item-action">
                    {id}
                  </NavLink>
                ))
              ) : (
                "No nodes created."
              )
            }
          </div>
          <button type="button" className="btn btn-primary btn-block mt-5 mb-3" onClick={handleShowNodeModal}>
            Create Node
          </button>
          <button type="button" className="btn btn-primary btn-block" onClick={handleShowTrustLineModal}>
            Create Trust Line
          </button>
        </div>
        <div className="col-9">
          <Switch>
            <Route path={`${path}/:nodeId`}>
              <h5>Account</h5>
              {
                accountSettings ? (
                  <pre>
                    {JSON.stringify(accountSettings, null, 2)}
                  </pre>
                ) : (
                  "No account selected."
                )
              }
              <h5 className="mt-5">Trust Lines</h5>
              {
                accountTrustLines ? (
                  <pre>
                    {JSON.stringify(accountTrustLines, null, 2)}
                  </pre>
                ) : (
                  "No account selected."
                )
              }
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default Builder;