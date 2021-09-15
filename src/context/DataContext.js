import React from "react"

const DataContext = React.createContext({ config: {}, graph: { nodes: [], links: [] } });

export default DataContext