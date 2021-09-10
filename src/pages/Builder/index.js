import React from "react";
import { Switch, Route, useRouteMatch, useLocation, useHistory } from "react-router-dom";
import { Button, ListGroup } from "react-bootstrap"
import CreateNodeModal from "../../components/CreateNodeModal";
import CreateTrustLineModal from "../../components/CreateTrustLineModal";
import { api, getTrustLines } from "../../xrpl"
import { removeNode } from "../../graph"
import "./index.css"

function Builder() {
  const history = useHistory();
  const { path } = useRouteMatch();
  const [selectedNode, setSelectedNode] = React.useState(undefined)
  const [showCreateNodeModal, setShowNodeModal] = React.useState(false);
  const [showTrustLineModal, setShowTrustLineModal] = React.useState(false);
  const [accountTrustLines, setAccountTrustLines] = React.useState(undefined)
  const [accounts, setAccounts] = React.useState(JSON.parse(window.localStorage.getItem("accounts")) || {});
  const hasAccounts = Object.keys(accounts).length !== 0
  const location = useLocation();

  const handleCloseCreateNodeModal = () => {
    setShowNodeModal(false);
    setAccounts(JSON.parse(window.localStorage.getItem("accounts")))
  }
  const handleShowNodeModal = () => setShowNodeModal(true);

  const handleCloseTrustLineModal = () => {
    setShowTrustLineModal(false);
    setAccounts(JSON.parse(window.localStorage.getItem("accounts")))
  }
  const handleShowTrustLineModal = () => setShowTrustLineModal(true);

  const goToValidator = () => {
    history.push(`/validator?account=${selectedNode && accounts[selectedNode].account.address}`);
  }

  /**
   * Fetch node info when selected
   */
  React.useEffect(() => {
    (async () => {
      if (selectedNode) {
        await api.connect()
        const trustLines = await getTrustLines(accounts[selectedNode].account.address)
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
      <CreateTrustLineModal show={showTrustLineModal} handleClose={handleCloseTrustLineModal} selectedNode={selectedNode} />
      <div className="row">
        <div className="col-3">
          <h4>Nodes</h4>
          <p className="text-muted">Please select a node from the list below or create a new node.</p>
          <ListGroup as="ul">
            {
              hasAccounts ? (
                Object.keys(accounts).map(id => (
                  <ListGroup.Item as="li" active={window.location.pathname === `/builder/${id}`} key={id} onClick={() => { setSelectedNode(id); history.push(`/builder/${id}`) }}>
                    {id}
                  </ListGroup.Item>
                ))
              ) : (
                "No nodes created."
              )
            }
          </ListGroup>
          <div className="d-grid gap-2">
            <Button variant="secondary" className="mt-5" onClick={handleShowNodeModal}>
              Create Node
            </Button>
          </div>
        </div>
        <div className="col-6 bg-light px-5 py-5">
          <Switch>
            <Route path={`${path}/:nodeId`}>
              <h5>Account</h5>
                <pre>
                  {JSON.stringify(accounts[selectedNode], null, 2)}
                </pre>
              <h5 className="mt-5">Trust Lines</h5>
              {
                accountTrustLines ? (
                  <pre>
                    {JSON.stringify(accountTrustLines, null, 2)}
                  </pre>
                ) : (
                  "No account trust lines."
                )
              }
            </Route>
          </Switch>
        </div>
        <div className="col-3">
          <h4 className="mb-3">Actions</h4>
          <div className="d-grid gap-2">
            <Button variant="primary" className="mb-3" disabled={!selectedNode} onClick={handleShowTrustLineModal}>
              Create Trust Line
            </Button>
          </div>
          <div className="d-grid gap-2">
            <Button variant="primary" className="mb-3" disabled={!selectedNode} onClick={goToValidator}>
            Send Payment
            </Button>
          </div>
          <div className="d-grid gap-2">
            <Button variant="primary" className="mb-3" disabled={!selectedNode} onClick={() => { removeNode(selectedNode) }}>
            Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Builder;
