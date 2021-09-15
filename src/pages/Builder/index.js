import React from "react";
import { Switch, Route, useRouteMatch, useLocation, useHistory } from "react-router-dom";
import { Button, ListGroup, Form } from "react-bootstrap"
import LoadingModal from "../../components/LoadingModal";
import CreateNodeModal from "../../components/CreateNodeModal";
import CreateTrustLineModal from "../../components/CreateTrustLineModal";
import { api, getTrustLines, blackhole } from "../../xrpl"
import { removeNode } from "../../graph"
import DataContext from "../../context/DataContext"
import "./index.css"

function Builder() {
  const history = useHistory();
  const inputRef = React.useRef()
  const { path } = useRouteMatch();
  const { data, setData } = React.useContext(DataContext)
  const [action, setAction] = React.useState("CreateNode")
  const [importType, setImportType] = React.useState()
  const [selectedNode, setSelectedNode] = React.useState(undefined)
  const [showLoadingModal, setShowLoadingModal] = React.useState(false);
  const [showCreateNodeModal, setShowNodeModal] = React.useState(false);
  const [showTrustLineModal, setShowTrustLineModal] = React.useState(false);
  const [accountTrustLines, setAccountTrustLines] = React.useState(undefined)
  const hasAccounts = Object.keys(data.config).length !== 0
  const location = useLocation();

  const handleCloseCreateNodeModal = () => {
    setShowNodeModal(false);
    setData({ ...data, config: JSON.parse(localStorage.getItem("config")) })
  }
  const handleShowCreateNodeModal = () => setShowNodeModal(true);

  const handleCloseTrustLineModal = () => {
    setShowTrustLineModal(false);
    setData({ ...data, config: JSON.parse(localStorage.getItem("config")) })
  }
  const handleShowTrustLineModal = () => setShowTrustLineModal(true);

  const goToValidator = () => {
    history.push(`/validator?account=${selectedNode}`);
  }

  const importGraph = () => {
    setImportType("graph")
    inputRef.current.click()
  }

  const importConfig = () => {
    setImportType("config")
    inputRef.current.click()
  }

  const fileUploadInputChange = (event) => {
    const reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }

  function onReaderLoad(event) {
    const result = JSON.parse(event.target.result);
    localStorage.setItem(importType, JSON.stringify(result))
    if (importType === "config")
      setData({ ...data, config: JSON.parse(localStorage.getItem("config")) })
    if (importType === "graph")
      setData({ ...data, graph: JSON.parse(localStorage.getItem("graph")) })
  }

  const blackholeAccount = async () => {
    setShowLoadingModal(true)
    await blackhole(data.config[selectedNode].account)
    data.config[selectedNode].blackholed = true
    localStorage.setItem("config", JSON.stringify(data.config))
    setData({
      graph: JSON.parse(localStorage.getItem("graph")),
      config: JSON.parse(localStorage.getItem("config"))
    })
    setShowLoadingModal(false)
  }

  const deleteAccount = async () => {
    await removeNode(selectedNode)
    setData({
      config: JSON.parse(localStorage.getItem("config")),
      graph: JSON.parse(localStorage.getItem("graph"))
    })
    setSelectedNode(undefined)
    setAccountTrustLines(undefined)
    history.push("/builder")
  }

  const handleCloseLoadingModal = () => setShowLoadingModal(false)

  /**
   * Fetch node info when selected
   */
  React.useEffect(() => {
    (async () => {
      if (selectedNode && data.config[selectedNode]) {
        await api.connect()
        const trustLines = await getTrustLines(data.config[selectedNode].account.address)
        setAccountTrustLines(trustLines)
        await api.disconnect()
      }
    })()
  }, [selectedNode, data.config])

  /**
   * Check if a node is already selected on page load
   */
  React.useEffect(() => {
    if (location.pathname.match(new RegExp("/builder/*."))) {
      setSelectedNode(location.pathname.split("/")[2])
    }
  }, [location.pathname])

  return (
    <div className="container mt-5">
      <LoadingModal show={showLoadingModal} handleClose={handleCloseLoadingModal} />
      <CreateNodeModal show={showCreateNodeModal} handleClose={handleCloseCreateNodeModal} />
      <CreateTrustLineModal show={showTrustLineModal} handleClose={handleCloseTrustLineModal} selectedNode={selectedNode} />
      <div className="row mb-5">
        <div className="col-md-4 border p-5">
          <h4>Nodes</h4>
          <p className="text-muted">Please select a node from the list below or create a new node.</p>
          <ListGroup as="ul">
            {
              hasAccounts ? (
                Object.keys(data.config).map(id => (
                  <ListGroup.Item as="li" active={location.pathname === `/builder/${id}`} key={id} onClick={() => { setSelectedNode(id); history.push(`/builder/${id}`) }}>
                    {id}
                  </ListGroup.Item>
                ))
              ) : (
                "No nodes created."
              )
            }
          </ListGroup>
          <div className="row mt-5">
            <div className="col-6">
              <h4 className="mb-3">Actions</h4>
            </div>
          </div>
          <div className="row">
            <div className="col-8">
              <Form.Select aria-label="Actions" onChange={(event) => { console.log(event.target.value); setAction(event.target.value) }}>
                <option value="CreateNode">Create Node</option>
                <option value="CreateTrustLine" disabled={!selectedNode}>Create Trust Line</option>
                <option value="SendPayment" disabled={!selectedNode}>Send Payment</option>
                <option value="BlackholeAccount" disabled={!selectedNode}>Blackhole Account</option>
                <option value="DeleteAccount" disabled={!selectedNode}>Delete Account</option>
              </Form.Select>
            </div>
            <div className="col-4">
              <div className="d-grid gap-2">
                <Button variant="primary" className="mb-3" onClick={() => {
                  if (action === "CreateNode") handleShowCreateNodeModal()
                  if (action === "CreateTrustLine") handleShowTrustLineModal()
                  if (action === "SendPayment") goToValidator()
                  if (action === "BlackholeAccount") blackholeAccount()
                  if (action === "DeleteAccount") deleteAccount()
                }}>
                  Go
                </Button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="d-grid gap-1">
                <input type="file" hidden ref={inputRef} onChange={fileUploadInputChange} />
                <Button variant="secondary" className="mt-3" onClick={importGraph}>
                  Import Graph
                </Button>
              </div>
            </div>
            <div className="col-6">
              <div className="d-grid gap-1">
                <input type="file" hidden ref={inputRef} onChange={fileUploadInputChange} />
                <Button variant="secondary" className="mt-3" onClick={importConfig}>
                  Import Config
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-8 bg-light px-5 py-5 border">
          <Switch>
            <Route exact path={path}>
              <div className="d-flex justify-content-center align-items-center h-100">
                Select a node to view info.
              </div>
            </Route>
            <Route path={`${path}/:nodeId`}>
              <h5>Account</h5>
                <pre>
                  {JSON.stringify(data.config[selectedNode], null, 2)}
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
      </div>
    </div>
  );
}

export default Builder;
