import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import GraphVisualization from "../components/GraphVisualization";
import FloydWarshallExecutor from "../utils/floydWarshall";
import parseWeightedAdjList from "../utils/parseWeightedAdjList";

const MAX_NODES = 12;
const SIMULATION_DELAY = 400; // milliseconds between steps

export default function FloydWarshallSimulation() {
  const [input, setInput] = useState("A: B(4) C(2)\nB: A(4) C(1) D(5)\nC: A(2) B(1) D(8) E(10)\nD: B(5) C(8) E(2)\nE: C(10) D(2)");
  const adj = useMemo(() => parseWeightedAdjList(input), [input]);
  const nodes = useMemo(() => Object.keys(adj), [adj]);
  const [error, setError] = useState("");

  const [floydWarshallState, setFloydWarshallState] = useState({
    dist: [],
    k: -1,
    i: 0,
    j: 0,
    currentUpdate: null,
    currentK: null,
    currentI: null,
    currentJ: null,
    log: [],
    done: false,
    nodes: [],
    nodeIndex: {},
    indexNode: {},
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const executorRef = useRef(null);
  const simulationIntervalRef = useRef(null);

  // Initialize executor when graph changes
  useMemo(() => {
    if (nodes.length > MAX_NODES) {
      setError(`Too many nodes! Maximum allowed: ${MAX_NODES}`);
      return;
    }
    setError("");
    stopSimulation();
    executorRef.current = new FloydWarshallExecutor(adj);
    setFloydWarshallState(executorRef.current.getState());
  }, [input]);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => stopSimulation();
  }, []);

  function stopSimulation() {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
  }

  function reset() {
    stopSimulation();
    executorRef.current = new FloydWarshallExecutor(adj);
    setFloydWarshallState(executorRef.current.getState());
  }

  function step() {
    if (!executorRef.current) {
      executorRef.current = new FloydWarshallExecutor(adj);
    }
    const state = executorRef.current.step();
    setFloydWarshallState(state);
    if (state.done) {
      stopSimulation();
    }
  }

  function startSimulation() {
    if (isSimulating) {
      stopSimulation();
      return;
    }

    executorRef.current = new FloydWarshallExecutor(adj);
    setFloydWarshallState(executorRef.current.getState());
    setIsSimulating(true);

    simulationIntervalRef.current = setInterval(() => {
      if (!executorRef.current) return;
      
      const state = executorRef.current.step();
      setFloydWarshallState(state);

      if (state.done) {
        stopSimulation();
      }
    }, SIMULATION_DELAY);
  }

  const formatDistance = (dist) => {
    return dist === Infinity ? 'INF' : dist;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Floyd-Warshall Algorithm</h1>
            <p className="text-muted-foreground mt-2">
              Find all-pairs shortest paths using dynamic programming
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Panel - Controls */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  Weighted Graph Input (Adjacency List)
                </label>
                <textarea
                  className="w-full min-h-32 max-h-80 p-3 rounded-md bg-background border border-border text-foreground font-mono text-sm resize-none overflow-auto"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="A: B(4) C(2)&#10;B: A(4) D(5)&#10;C: A(2) D(8)"
                  rows={Math.min(Math.max(4, input.split('\n').length + 1), 20)}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Format: Node: Neighbor(Weight) ...
                  </p>
                  <p className={`text-xs font-medium ${error ? 'text-red-500' : nodes.length > MAX_NODES * 0.8 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    {nodes.length}/{MAX_NODES} nodes
                  </p>
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex gap-3">
                  <Button onClick={reset} variant="outline" className="flex-1" disabled={isSimulating}>
                    Reset
                  </Button>
                  <Button onClick={step} variant="outline" className="flex-1" disabled={isSimulating || floydWarshallState.done}>
                    Step
                  </Button>
                  <Button 
                    onClick={startSimulation} 
                    className="flex-1"
                    variant={isSimulating ? "destructive" : "default"}
                    disabled={!!error}
                  >
                    {isSimulating ? "Stop" : "Start Simulation"}
                  </Button>
                </div>
              </div>

              {/* Current State */}
              <div className="bg-card border border-border rounded-lg p-6 text-green-800 font-extrabold">
                <h4 className="text-sm font-medium opacity-90 mb-1">Intermediate Vertex (k)</h4>
                <p className="text-xl font-bold">
                  {floydWarshallState.currentK || 'Initializing'}
                </p>
                {floydWarshallState.currentI && (
                  <p className="text-sm mt-2 opacity-90">
                    Processing row: i = {floydWarshallState.currentI}
                  </p>
                )}
              </div>

              {/* Distance Matrix */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Distance Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-mono">
                    <thead>
                      <tr>
                        <th className="p-1 border border-border bg-muted"></th>
                        {floydWarshallState.nodes.map(node => (
                          <th key={node} className="p-1 border border-border bg-muted font-bold">
                            {node}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {floydWarshallState.nodes.map((rowNode, i) => (
                        <tr key={rowNode}>
                          <th className="p-1 border border-border bg-muted font-bold">
                            {rowNode}
                          </th>
                          {floydWarshallState.nodes.map((colNode, j) => {
                            const dist = floydWarshallState.dist[i]?.[j];
                            const isUpdated = floydWarshallState.currentUpdate && 
                                            floydWarshallState.currentUpdate.from === rowNode &&
                                            floydWarshallState.currentUpdate.to === colNode;
                            return (
                              <td 
                                key={colNode} 
                                className={`p-1 border border-border text-center ${
                                  isUpdated ? 'bg-green-200 font-bold' : 
                                  i === j ? 'bg-blue-50' :
                                  dist === Infinity ? 'text-red-500' : ''
                                }`}
                              >
                                {formatDistance(dist)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Execution Log */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Execution Log</h4>
                <div className="max-h-96 overflow-auto text-xs font-mono">
                  {floydWarshallState.log.length ? (
                    floydWarshallState.log.map((entry, i) => (
                      <div
                        key={i}
                        className={`py-0.5 ${
                          entry.includes('===') || entry.includes('Complete')
                            ? "text-foreground font-bold"
                          : entry.startsWith('Updated ')
                            ? "text-green-600 font-semibold"
                          : entry.startsWith('  ')
                            ? "text-muted-foreground pl-4"
                          : entry.includes('Initial') || entry.includes('Current') || entry.includes('Final')
                            ? "text-blue-600 font-semibold"
                          : "text-foreground"
                        }`}
                      >
                        {entry}
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground">(no steps yet)</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Visualization */}
            <div>
              <GraphVisualization
                adjacencyList={adj}
                visitedNodes={floydWarshallState.currentK ? [floydWarshallState.currentK] : []}
                queuedNodes={floydWarshallState.currentI && floydWarshallState.currentJ ? [floydWarshallState.currentI, floydWarshallState.currentJ] : (floydWarshallState.currentI ? [floydWarshallState.currentI] : [])}
                currentNode={floydWarshallState.currentK}
                currentNeighbors={floydWarshallState.currentI && floydWarshallState.currentJ ? [floydWarshallState.currentI, floydWarshallState.currentJ] : []}
                width={600}
                height={500}
              />
              
              {/* Node Legend */}
              {floydWarshallState.currentK && (
                <div className="mt-4 bg-card border border-border rounded-lg p-3">
                  <h4 className="font-semibold mb-2 text-sm">Current Nodes:</h4>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></div>
                      <span><strong>k = {floydWarshallState.currentK}</strong> (intermediate)</span>
                    </div>
                    {floydWarshallState.currentI && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-blue-500"></div>
                        <span><strong>i = {floydWarshallState.currentI}</strong> (from)</span>
                      </div>
                    )}
                    {floydWarshallState.currentJ && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-400 border-2 border-orange-500"></div>
                        <span><strong>j = {floydWarshallState.currentJ}</strong> (to)</span>
                      </div>
                    )}
                  </div>
                  {floydWarshallState.currentI && floydWarshallState.currentJ && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Checking: dist[{floydWarshallState.currentI}][{floydWarshallState.currentJ}] via {floydWarshallState.currentK}
                    </p>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
