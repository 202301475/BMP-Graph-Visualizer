import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import GraphVisualization from "../components/GraphVisualization";
import CycleDetectionExecutor from "../utils/cycleDetection";
import parseAdjList from "../utils/parseAdjList";

const MAX_NODES = 15;
const SIMULATION_DELAY = 1200; // milliseconds between steps

export default function CycleDetectionSimulation() {
  const [input, setInput] = useState("A: B\nB: A C\nC: B D\nD: C");
  const adj = useMemo(() => parseAdjList(input), [input]);
  const nodes = useMemo(() => Object.keys(adj), [adj]);
  const [error, setError] = useState("");

  const [start, setStart] = useState(nodes[0] || "");
  const [cycleState, setCycleState] = useState({
    queue: [],
    visited: [],
    parent: {},
    currentNode: null,
    currentNeighbors: [],
    log: [],
    done: false,
    hasCycle: false,
    cycleEdge: null,
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
    executorRef.current = new CycleDetectionExecutor(adj, start);
    setCycleState(executorRef.current.getState());
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
    executorRef.current = new CycleDetectionExecutor(adj, start);
    setCycleState(executorRef.current.getState());
  }

  function step() {
    if (!executorRef.current) {
      executorRef.current = new CycleDetectionExecutor(adj, start);
    }
    const state = executorRef.current.step();
    setCycleState(state);
    if (state.done) {
      stopSimulation();
    }
  }

  function startSimulation() {
    if (isSimulating) {
      stopSimulation();
      return;
    }

    executorRef.current = new CycleDetectionExecutor(adj, start);
    setCycleState(executorRef.current.getState());
    setIsSimulating(true);

    simulationIntervalRef.current = setInterval(() => {
      if (!executorRef.current) return;
      
      const state = executorRef.current.step();
      setCycleState(state);

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
            <h1 className="text-4xl font-bold text-foreground">Cycle Detection</h1>
            <p className="text-muted-foreground mt-2">
              Detect cycles in undirected graph using BFS
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
                  placeholder="A: B&#10;B: A C&#10;C: B D&#10;D: C"
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
                  <Button onClick={step} variant="outline" className="flex-1" disabled={isSimulating || cycleState.done}>
                    Step
                  </Button>
                  <Button 
                    onClick={startSimulation} 
                    className="flex-1"
                    variant={isSimulating ? "destructive" : "default"}
                    disabled={!!error}
                  >
                    {isSimulating ? "Stop" : "Start"}
                  </Button>
                </div>
              </div>

              {/* Result Display */}
              <div className={`border-2 rounded-lg p-4 ${
                cycleState.done 
                  ? cycleState.hasCycle 
                    ? "bg-red-50 border-red-500" 
                    : "bg-green-50 border-green-500"
                  : "bg-card border-border"
              }`}>
                <h4 className="font-semibold mb-2">Result</h4>
                <p className={`text-lg font-bold ${
                  cycleState.done
                    ? cycleState.hasCycle
                      ? "text-red-700"
                      : "text-green-700"
                    : "text-muted-foreground"
                }`}>
                  {cycleState.done
                    ? cycleState.hasCycle
                      ? "CYCLE DETECTED"
                      : "NO CYCLE (Acyclic)"
                    : "Processing..."}
                </p>
                {cycleState.done && cycleState.hasCycle && cycleState.cycleEdge && (
                  <p className="text-sm text-red-600 mt-2">
                    Cycle edge: {cycleState.cycleEdge.from} {'<->'} {cycleState.cycleEdge.to}
                  </p>
                )}
              </div>

              {/* Queue Display */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Queue</h4>
                <div className="min-h-10 flex items-center gap-2 flex-wrap">
                  {cycleState.queue.length ? (
                    cycleState.queue.map((q, i) => (
                      <div
                        key={`${q}-${i}`}
                        className="px-3 py-1 rounded bg-muted text-sm font-medium"
                      >
                        {q}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">(empty)</div>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Execution Log</h4>
                <div className="max-h-60 overflow-auto text-sm font-mono">
                  {cycleState.log.length ? (
                    cycleState.log.map((entry, i) => (
                      <div
                        key={i}
                        className={`py-1 ${
                          entry.startsWith("  ")
                            ? "text-muted-foreground pl-4"
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
                visitedNodes={cycleState.visited}
                queuedNodes={cycleState.queue}
                currentNode={cycleState.currentNode}
                currentNeighbors={cycleState.currentNeighbors}
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
