import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import GraphVisualization from "../components/GraphVisualization";
import DFSExecutor  from "../utils/dfs";
import parseAdjList from "../utils/parseAdjList";

const MAX_NODES = 15;
const SIMULATION_DELAY = 1000; // milliseconds between steps

export default function DFSSimulation() {
  const [input, setInput] = useState("A: B C\nB: A D\nC: A D\nD: B C");
  const adj = useMemo(() => parseAdjList(input), [input]);
  const nodes = useMemo(() => Object.keys(adj), [adj]);
  const [error, setError] = useState("");

  const [start, setStart] = useState(nodes[0] || "");
  const [dfsState, setDfsState] = useState({
    recursionStack: [],
    visited: [],
    currentNode: null,
    currentNeighbors: [],
    log: [],
    done: false,
    backtracking: false,
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const executorRef = useRef(null);
  const simulationIntervalRef = useRef(null);

  // Initialize executor when graph or start changes
  useMemo(() => {
    if (nodes.length > MAX_NODES) {
      setError(`Too many nodes! Maximum allowed: ${MAX_NODES}`);
      return;
    }
    setError("");
    if (nodes.length && !nodes.includes(start)) setStart(nodes[0]);
    stopSimulation();
    executorRef.current = new DFSExecutor(adj, start);
    setDfsState(executorRef.current.getState());
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
    executorRef.current = new DFSExecutor(adj, start);
    setDfsState(executorRef.current.getState());
  }

  function step() {
    if (!executorRef.current) {
      executorRef.current = new DFSExecutor(adj, start);
    }
    const state = executorRef.current.step();
    setDfsState(state);
    if (state.done) {
      stopSimulation();
    }
  }

  function startSimulation() {
    if (isSimulating) {
      stopSimulation();
      return;
    }

    executorRef.current = new DFSExecutor(adj, start);
    setDfsState(executorRef.current.getState());
    setIsSimulating(true);

    simulationIntervalRef.current = setInterval(() => {
      if (!executorRef.current) return;
      
      const state = executorRef.current.step();
      setDfsState(state);

      if (state.done) {
        stopSimulation();
      }
    }, SIMULATION_DELAY);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">DFS Simulator</h1>
            <p className="text-muted-foreground mt-2">
              Visualize Depth-First Search algorithm step-by-step
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Panel - Controls */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  Graph Input (Adjacency List)
                </label>
                <textarea
                  className="w-full min-h-32 max-h-80 p-3 rounded-md bg-background border border-border text-foreground font-mono text-sm resize-none overflow-auto"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="A: B C&#10;B: A D&#10;C: A D&#10;D: B C"
                  rows={Math.min(Math.max(4, input.split('\n').length + 1), 20)}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Format: NodeName: Neighbor1 Neighbor2 ...
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
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm font-medium">Start Node:</label>
                  <select
                    className="flex-1 p-2 rounded bg-background border border-border"
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                      reset();
                    }}
                  >
                    {nodes.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <Button onClick={reset} variant="outline" className="flex-1" disabled={isSimulating}>
                    Reset
                  </Button>
                  <Button onClick={step} variant="outline" className="flex-1" disabled={isSimulating || dfsState.done}>
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

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Recursion Stack</h4>
                <div className="min-h-10 flex flex-col-reverse gap-2">
                  {dfsState.recursionStack.length ? (
                    dfsState.recursionStack.map((node, i) => (
                      <div
                        key={`${node}-${i}`}
                        className={`px-3 py-1 rounded text-sm font-medium text-center ${
                          i === dfsState.recursionStack.length - 1
                            ? "bg-purple-500 text-white border-2 border-purple-600"
                            : "bg-muted"
                        }`}
                      >
                        {node} {i === dfsState.recursionStack.length - 1 && "(top)"}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-2">(empty)</div>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Execution Log</h4>
                <div className="max-h-60 overflow-auto text-sm font-mono">
                  {dfsState.log.length ? (
                    dfsState.log.map((entry, i) => (
                      <div
                        key={i}
                        className={`py-1 ${
                          entry.startsWith("  Exploring")
                            ? "text-muted-foreground pl-4"
                            : entry.startsWith("Backtracking")
                            ? "text-amber-600 font-semibold"
                            : "text-foreground font-semibold"
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
                visitedNodes={dfsState.visited}
                queuedNodes={dfsState.recursionStack}
                currentNode={dfsState.currentNode}
                currentNeighbors={dfsState.currentNeighbors}
                width={600}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
