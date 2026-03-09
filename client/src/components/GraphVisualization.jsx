import { useMemo } from "react";

function calculateNodePositions(nodes, width, height) {
  const positions = {};
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Adjust radius based on node count for better spacing
  let radiusFactor = 0.35;
  if (nodes.length > 10) radiusFactor = 0.4;
  if (nodes.length > 7) radiusFactor = 0.38;
  
  const radius = Math.min(width, height) * radiusFactor;

  if (nodes.length === 1) {
    positions[nodes[0]] = { x: centerX, y: centerY };
  } else {
    nodes.forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / nodes.length - Math.PI / 2;
      positions[node] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }

  return positions;
}

export default function GraphVisualization({
  adjacencyList,
  visitedNodes = [],
  queuedNodes = [],
  currentNode = null,
  currentNeighbors = [],
  width = 600,
  height = 500,
  mstEdges = [], // Array of MST edges {from, to, weight}
}) {
  const nodes = useMemo(() => Object.keys(adjacencyList), [adjacencyList]);
  
  // Adjust node size based on count
  const nodeRadius = nodes.length > 10 ? 22 : nodes.length > 7 ? 24 : 25;
  const fontSize = nodes.length > 10 ? 14 : 16;

  const positions = useMemo(
    () => calculateNodePositions(nodes, width, height),
    [nodes, width, height]
  );

  // Build edge list with direction detection
  const edges = useMemo(() => {
    const edgeSet = [];
    const processed = new Set();
    
    Object.entries(adjacencyList).forEach(([from, neighbors]) => {
      neighbors.forEach((neighbor) => {
        // Handle both weighted {node, weight} and unweighted string formats
        const to = typeof neighbor === 'string' ? neighbor : neighbor.node;
        const weight = typeof neighbor === 'object' ? neighbor.weight : null;
        
        const edgeKey = `${from}->${to}`;
        const reverseKey = `${to}->${from}`;
        
        if (processed.has(edgeKey)) return;
        
        // Check if reverse edge exists (bidirectional)
        const reverseNeighbors = adjacencyList[to] || [];
        const isBidirectional = reverseNeighbors.some(n => 
          (typeof n === 'string' ? n : n.node) === from
        );
        
        if (isBidirectional) {
          // For bidirectional, only add once (avoid duplicates)
          if (!processed.has(reverseKey)) {
            edgeSet.push({ from, to, weight, bidirectional: true });
            processed.add(edgeKey);
            processed.add(reverseKey);
          }
        } else {
          // Unidirectional edge
          edgeSet.push({ from, to, weight, bidirectional: false });
          processed.add(edgeKey);
        }
      });
    });
    return edgeSet;
  }, [adjacencyList]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-2">Graph Visualization</h3>
      <svg width={width} height={height} className="bg-muted/30 rounded">
        {/* Define arrow marker for directed edges */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Draw edges */}
        <g>
          {edges.map((edge, idx) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;

            // Check if this edge is being explored (from current node to its neighbors)
            const isActiveEdge =
              (currentNode === edge.from && currentNeighbors.includes(edge.to)) ||
              (currentNode === edge.to && currentNeighbors.includes(edge.from) && edge.bidirectional);

            // Check if this edge is in the MST
            const isMSTEdge = mstEdges.some(
              mstEdge =>
                (mstEdge.from === edge.from && mstEdge.to === edge.to) ||
                (mstEdge.from === edge.to && mstEdge.to === edge.from)
            );

            // Calculate edge endpoints accounting for node radius
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            // Shorten line to account for node radius and arrow
            const offset = nodeRadius + (edge.bidirectional ? 0 : 8);
            const x1 = from.x + unitX * nodeRadius;
            const y1 = from.y + unitY * nodeRadius;
            const x2 = to.x - unitX * offset;
            const y2 = to.y - unitY * offset;

            return (
              <g key={`${edge.from}-${edge.to}-${idx}`}>
                {/* Highlight glow effect for active or MST edges */}
                {(isActiveEdge || isMSTEdge) && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isMSTEdge ? "#a855f7" : "#fbbf24"}
                    strokeWidth={8}
                    strokeOpacity={0.3}
                  />
                )}
                {/* Base edge */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMSTEdge ? "#a855f7" : isActiveEdge ? "#f59e0b" : "#64748b"}
                  strokeWidth={isMSTEdge ? 5 : isActiveEdge ? 4 : 2.5}
                  strokeOpacity={1}
                  markerEnd={edge.bidirectional ? "" : (isActiveEdge ? "url(#arrowhead-active)" : "url(#arrowhead)")}
                />
                {/* Edge weight label */}
                {edge.weight !== null && (
                  <circle
                    cx={(x1 + x2) / 2}
                    cy={(y1 + y2) / 2 - 8}
                    r="12"
                    fill={isMSTEdge ? "#a855f7" : isActiveEdge ? "#f59e0b" : "#3b82f6"}
                    stroke={isMSTEdge ? "#9333ea" : isActiveEdge ? "#ea580c" : "#2563eb"}
                    strokeWidth="2"
                  />
                )}
                {edge.weight !== null && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="700"
                    className="pointer-events-none"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Draw nodes */}
        <g>
          {nodes.map((node) => {
            const pos = positions[node];
            if (!pos) return null;

            const isVisited = visitedNodes.includes(node);
            const isQueued = queuedNodes.includes(node);
            const isCurrent = currentNode === node;
            const isNeighbor = currentNeighbors.includes(node);

            let fill, stroke, textFill;

            if (isCurrent) {
              // Current node being processed - RED
              fill = "#ef4444";
              stroke = "#dc2626";
              textFill = "#ffffff";
            } else if (isNeighbor && !isVisited) {
              // Neighbor being explored - ORANGE
              fill = "#fb923c";
              stroke = "#f97316";
              textFill = "#ffffff";
            } else if (isVisited) {
              // Visited nodes - GREEN
              fill = "#22c55e";
              stroke = "#16a34a";
              textFill = "#ffffff";
            } else if (isQueued) {
              // Queued nodes - BLUE
              fill = "#60a5fa";
              stroke = "#3b82f6";
              textFill = "#ffffff";
            } else {
              // Idle nodes - LIGHT GRAY
              fill = "#f1f5f9";
              stroke = "#94a3b8";
              textFill = "#1e293b";
            }

            return (
              <g key={node}>
                {/* Glow effect for current and neighbor nodes */}
                {(isCurrent || isNeighbor) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 7}
                    fill={isCurrent ? "#ef4444" : "#fb923c"}
                    opacity={0.2}
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isCurrent || isNeighbor ? 3 : 2}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textFill}
                  fontSize={fontSize}
                  fontWeight="700"
                >
                  {node}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-600"></div>
          <span className="font-medium">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-orange-400 border-2 border-orange-500"></div>
          <span className="font-medium">Exploring</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-600"></div>
          <span className="font-medium">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-400 border-2 border-blue-500"></div>
          <span className="font-medium">Queued</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-slate-400"></div>
          <span className="font-medium">Unvisited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-amber-500"></div>
          <span className="font-medium">Active Edge</span>
        </div>
      </div>
    </div>
  );
}
