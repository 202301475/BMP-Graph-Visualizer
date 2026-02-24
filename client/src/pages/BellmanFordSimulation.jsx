import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import GraphVisualization from "../components/GraphVisualization";
import BellmanFordExecutor from "../utils/bellmanFord";
import parseWeightedAdjList from "../utils/parseWeightedAdjList";

const MAX_NODES = 15;
const SIMULATION_DELAY = 1200;

export default function BellmanFordSimulation() {
  const [input, setInput] = useState("A: B(4) C(2)\nB: A(4) C(1) D(5)\nC: A(2) B(1) D(8) E(10)\nD: B(5) C(8) E(2)\nE: C(10) D(2)");
  const adj = useMemo(() => parseWeightedAdjList(input), [input]);
  const nodes = useMemo(() => Object.keys(adj), [adj]);
  const [error, setError] = useState("");

  const [start, setStart] = useState(nodes[0] || "");
  const [bellmanFordState, setBellmanFordState] = useState({
    distance: {},
    currentIteration: 0,
    maxIterations: 0,
    currentEdge: null,
    log: [],
    done: false,
    hasNegativeCycle: false,
    edges: [],
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
    executorRef.current = new BellmanFordExecutor(adj, start);
    setBellmanFordState(executorRef.current.getState());
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
    executorRef.current = new BellmanFordExecutor(adj, start);
    setBellmanFordState(executorRef.current.getState());
  }

  function step() {
    if (!executorRef.current) {
      executorRef.current = new BellmanFordExecutor(adj, start);
    }
    const state = executorRef.current.step();
    setBellmanFordState(state);
    if (state.done) {
      stopSimulation();
    }
  }

  function startSimulation() {
    if (isSimulating) {
      stopSimulation();
      return;
    }

    executorRef.current = new BellmanFordExecutor(adj, start);
    setBellmanFordState(executorRef.current.getState());
    setIsSimulating(true);

    simulationIntervalRef.current = setInterval(() => {
      if (!executorRef.current) return;
      
      const state = executorRef.current.step();
      setBellmanFordState(state);

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
            <h1 className="text-4xl font-bold text-foreground">Bellman-Ford Algorithm</h1>
            <p className="text-muted-foreground mt-2">
              Find shortest paths with negative edge weights and detect negative cycles
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
                  <Button onClick={step} variant="outline" className="flex-1" disabled={isSimulating || bellmanFordState.done}>
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

              {/* Iteration Progress */}
              <div className={`rounded-lg p-6 text-white ${bellmanFordState.hasNegativeCycle ? 'bg-red-500' : 'bg-blue-500'}`}>
                <h4 className="text-sm font-medium opacity-90 mb-1">
                  {bellmanFordState.hasNegativeCycle ? 'Negative Cycle Detected!' : 'Iteration Progress'}
                </h4>
                <p className="text-3xl font-bold">
                  {bellmanFordState.currentIteration}/{bellmanFordState.maxIterations}
                </p>
                {bellmanFordState.currentEdge && (
                  <p className="text-sm mt-2 opacity-90">
                    Processing: {bellmanFordState.currentEdge.from} to {bellmanFordState.currentEdge.to}
                  </p>
                )}
              </div>

              {/* Distance Array */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Distance Array</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(bellmanFordState.distance).map(([node, dist]) => (
                    <div
                      key={node}
                      className="px-3 py-2 rounded bg-muted text-sm font-mono flex justify-between items-center"
                    >
                      <span className="font-bold">{node}:</span>
                      <span className={dist === Infinity ? 'text-red-500' : 'text-foreground'}>
                        {dist === Infinity ? 'INF' : dist}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Log */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Execution Log</h4>
                <div className="max-h-80 overflow-auto text-sm font-mono">
                  {bellmanFordState.log.length ? (
                    bellmanFordState.log.map((entry, i) => (
                      <div
                        key={i}
                        className={`py-1 ${
                          entry.includes('===') || entry.startsWith('Starting') || entry.includes('Complete')
                            ? "text-foreground font-bold"
                            : entry.startsWith("  RELAXED")
                            ? "text-green-600 pl-4 font-semibold"
                            : entry.startsWith("  ")
                            ? "text-muted-foreground pl-4"
                            : entry.includes('Negative cycle')
                            ? "text-red-500 font-bold"
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
                visitedNodes={[]}
                queuedNodes={[]}
                currentNode={bellmanFordState.currentEdge?.from || null}
                currentNeighbors={bellmanFordState.currentEdge ? [bellmanFordState.currentEdge.to] : []}
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
