import React from "react";
import * as d3 from "d3";
import * as bootstrap from "bootstrap"
import DataContext from "../../context/DataContext"
import './index.css';

function Explorer() {
  const { data } = React.useContext(DataContext);
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // ?
    const label = {
      'nodes': [],
      'links': []
    };

    // ?
    data.graph.nodes.forEach(function(d, i) {
      label.nodes.push({ node: d });
      label.nodes.push({ node: d });
      label.links.push({
        source: i * 2,
        target: i * 2 + 1
      });
    });

    var labelLayout = d3.forceSimulation(label.nodes)
      .force("charge", d3.forceManyBody().strength(-50))
      .force("link", d3.forceLink(label.links).distance(0).strength(2));

    var graphLayout = d3.forceSimulation(data.graph.nodes)
      .force("charge", d3.forceManyBody().strength(-3000))
      .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
      .force("x", d3.forceX(window.innerWidth / 2).strength(1))
      .force("y", d3.forceY(window.innerHeight / 2).strength(1))
      .force("link", d3.forceLink(data.graph.links).id(function(d) { return d.id; }).distance(50).strength(1))
      .on("tick", ticked);

    var adjlist = [];

    data.graph.links.forEach(function(d) {
      adjlist[d.source.index + "-" + d.target.index] = true;
      adjlist[d.target.index + "-" + d.source.index] = true;
    });
    
    /**
     * @function neigh
     * @param {*} a 
     * @param {*} b 
     * @returns 
     */
    function neigh(a, b) {
      return a === b || adjlist[a + "-" + b];
    }
    
    // Create graph container
    var svg = d3.select("svg").attr("width", "100%").attr("height", "100%");
    var container = svg.append("g");

    // Define the arrowhead graphic
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 35 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 15)
      .attr("markerHeight", 15)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#999")
      .style("stroke", "none");
    
    // Define zoom settings
    svg.call(
      d3.zoom()
        .scaleExtent([.1, 4])
        .on("zoom", function(event) { container.attr("transform", event.transform); })
    );
    
    // Create links
    var link = container.append("g").attr("class", "links")
      .selectAll("line")
      .data(data.graph.links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", "1px")
      .attr("id", function(d, i) { return "link-" + i })
      .attr('marker-end', 'url(#arrowhead)');

    // Create nodes
    var node = container.append("g").attr("class", "nodes")
      .selectAll("g")
      .data(data.graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("id", function(d, i) { return "node-" + i })
      .attr("fill", function(d) { return color(d.group); })
    
    // Events
    node.on("mouseover", focus).on("mouseout", unfocus);
    node.on("mouseover", showNodeInfo).on("mouseout", hideNodeInfo);
    link.on("mouseover", showRippleState).on("mouseout", hideRippleState);
    
    node.call(
      d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    // Label the nodes
    var labelNode = container.append("g").attr("class", "labelNodes")
      .selectAll("text")
      .data(label.nodes)
      .enter()
      .append("text")
      .text(function(d, i) { return i % 2 === 0 ? "" : d.node.id; })
      .style("fill", "#555")
      .style("font-family", "Arial")
      .style("font-size", 12)
      .style("pointer-events", "none"); // to prevent mouseover/drag capture
    
    /**
     * @function ticked
     */
    function ticked() {
    
      node.call(updateNode);
      link.call(updateLink);
    
      labelLayout.alphaTarget(0.3).restart();
      labelNode.each(function(d, i) {
        if(i % 2 === 0) {
          d.x = d.node.x;
          d.y = d.node.y;
        } else {
          var b = this.getBBox();
    
          var diffX = d.x - d.node.x;
          var diffY = d.y - d.node.y;

          var dist = Math.sqrt(diffX * diffX + diffY * diffY);

          var shiftX = b.width * (diffX - dist) / (dist * 2);
          shiftX = Math.max(-b.width, Math.min(0, shiftX));
          var shiftY = 16;
          this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
        }
      });
      labelNode.call(updateNode);
    }
    
    /**
     * @function fixna
     * @param {*} x 
     * @returns 
     */
    function fixna(x) {
      if (isFinite(x)) return x;
      return 0;
    }
    
    /**
     * @function focus
     * @param {*} event 
     * @param {*} d 
     */
    function focus(event, d) {
      var index = d3.select(event.target).datum().index;
      node.style("opacity", function(o) {
        return neigh(index, o.index) ? 1 : 0.1;
      });
      labelNode.attr("display", function(o) {
      return neigh(index, o.node.index) ? "block": "none";
      });
      link.style("opacity", function(o) {
        return o.source.index === index || o.target.index === index ? 1 : 0.1;
      });
    }
    
    /**
     * @function unfocus
     */
    function unfocus() {
      labelNode.attr("display", "block");
      node.style("opacity", 1);
      link.style("opacity", 1);
    }

    /**
     * @function showRippleState
     * @param {*} event 
     * @param {*} d 
     */
    function showRippleState(event, d) {
      var link = document.getElementById(event.target.id)
      var popover = new bootstrap.Popover(link, {
        title: "RippleState",
        content: d.source.id + " -> " + d.target.id +  "<br/>Balance: " + d.weight,
        html: true
      })
      popover.show()
    }

    /**
     * @function hideRippleState
     * @param {*} event 
     * @param {*} d 
     */
    function hideRippleState(event, d) {
      var link = document.getElementById(event.target.id)
      var popover = bootstrap.Popover.getInstance(link)
      popover.dispose()
    }

    /**
     * @function showNodeInfo
     * @param {*} event 
     * @param {*} d 
     */
    function showNodeInfo(event, d) {
      var node = document.getElementById(event.target.id)
      var popover = new bootstrap.Popover(node, {
        title: "Info",
        content: JSON.stringify(d, null, 2),
        html: true
      })
      popover.show()
    }

    /**
     * @function hideNodeInfo
     * @param {*} event 
     * @param {*} d 
     */
    function hideNodeInfo(event, d) {
      var node = document.getElementById(event.target.id)
      var popover = bootstrap.Popover.getInstance(node)
      popover.dispose()
    }
    
    /**
     * @function updateLink
     * @param {*} link 
     */
    function updateLink(link) {
      link.attr("x1", function(d) { return fixna(d.source.x); })
        .attr("y1", function(d) { return fixna(d.source.y); })
        .attr("x2", function(d) { return fixna(d.target.x); })
        .attr("y2", function(d) { return fixna(d.target.y); });
    }
    
    /**
     * @function updateNode
     * @param {*} node 
     */
    function updateNode(node) {
      node.attr("transform", function(d) {
        return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
      });
    }
    
    /**
     * @function dragstarted
     * @param {*} event 
     * @param {*} d 
     */
    function dragstarted(event, d) {
      event.sourceEvent.stopPropagation();
      if (!event.active) graphLayout.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    /**
     * @function dragged
     * @param {*} event 
     * @param {*} d 
     */
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    /**
     * @function dragended
     * @param {*} event 
     * @param {*} d 
     */
    function dragended(event, d) {
      if (!event.active) graphLayout.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => { d3.selectAll("svg > *").remove(); }
  }, [data.graph.links, data.graph.nodes])

  return (
    <svg ref={svgRef} width="100vw" height="100vh" className="Graph" />
  );
}

export default Explorer;
