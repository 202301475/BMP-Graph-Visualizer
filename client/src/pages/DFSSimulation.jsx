import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import GraphVisualization from "../components/GraphVisualization";
import DFSExecutor  from "../utils/dfs";
import ComponentsExecutor from "../utils/components";
import CycleDetectionExecutor from "../utils/cycleDetection";
import BipartiteExecutor from "../utils/bipartite";
import TopologicalSortExecutor from "../utils/topologicalSort";
import parseAdjList from "../utils/parseAdjList";

const MAX_NODES = 15;
const SIMULATION_DELAY = 1000; // milliseconds between steps

export default function DFSSimulation() {
  const [input, setInput] = useState("A: B C\nB: A D\nC: A D\nD: B C");
  const adj = useMemo(() => parseAdjList(input), [input]);
  const nodes = useMemo(() => Object.keys(adj), [adj]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizInputs, setQuizInputs] = useState({
    components: "",
    hasCycle: "",
    isBipartite: "",
    topoPossible: "",
  });
  const [quizResult, setQuizResult] = useState(null);

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

  const derivedProperties = useMemo(() => {
    if (!nodes.length) {
      return {
        componentCount: 0,
        hasCycle: false,
        isBipartite: false,
        hasTopoOrder: false,
        topoOrder: [],
      };
    }

    try {
      const componentsExecutor = new ComponentsExecutor(adj);
      const componentsState = componentsExecutor.runAll();

      const cycleExecutor = new CycleDetectionExecutor(adj, nodes[0]);
      const cycleState = cycleExecutor.runAll();

      const bipartiteExecutor = new BipartiteExecutor(adj, nodes[0]);
      const bipartiteState = bipartiteExecutor.runAll();

      const topoExecutor = new TopologicalSortExecutor(adj);
      const topoState = topoExecutor.runAll();

      const hasTopoOrder = !topoState.hasCycle && topoState.result.length === nodes.length;

      return {
        componentCount: componentsState.componentCount,
        hasCycle: cycleState.hasCycle,
        isBipartite: bipartiteState.isBipartite,
        hasTopoOrder,
        topoOrder: topoState.result,
      };
    } catch (e) {
      return {
        componentCount: 0,
        hasCycle: false,
        isBipartite: false,
        hasTopoOrder: false,
        topoOrder: [],
      };
    }
  }, [adj, nodes]);

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

  function normalizeYesNo(value) {
    const v = value.trim().toLowerCase();
    if (!v) return null;
    if (["yes", "y", "true", "1"].includes(v)) return true;
    if (["no", "n", "false", "0"].includes(v)) return false;
    return null;
  }

  function handleQuizChange(field, value) {
    setQuizInputs((prev) => ({ ...prev, [field]: value }));
  }

  function handleQuizSubmit(e) {
    e.preventDefault();

    const { componentCount, hasCycle, isBipartite, hasTopoOrder } = derivedProperties;

    const userComponents = parseInt(quizInputs.components, 10);
    const userHasCycle = normalizeYesNo(quizInputs.hasCycle);
    const userIsBipartite = normalizeYesNo(quizInputs.isBipartite);
    const userTopoPossible = normalizeYesNo(quizInputs.topoPossible);

    setQuizResult({
      components: {
        isCorrect: !Number.isNaN(userComponents) && userComponents === componentCount,
        expected: componentCount,
      },
      cycle: {
        isCorrect: userHasCycle !== null && userHasCycle === hasCycle,
        expected: hasCycle,
      },
      bipartite: {
        isCorrect: userIsBipartite !== null && userIsBipartite === isBipartite,
        expected: isBipartite,
      },
      topoPossible: {
        isCorrect: userTopoPossible !== null && userTopoPossible === hasTopoOrder,
        expected: hasTopoOrder,
      },
    });
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
                <Button
                  type="button"
                  onClick={() => setShowQuiz((prev) => !prev)}
                  className="w-full mt-3"
                  variant="secondary"
                  disabled={!!error || !nodes.length}
                >
                  Let's Apply
                </Button>
              </div>

              {showQuiz && (
                <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold mb-1">Let's Apply DFS</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Answer these questions using the current graph, then see how DFS-based algorithms help.
                  </p>
                  <form className="space-y-3" onSubmit={handleQuizSubmit}>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium">
                        1. How many connected components does this graph have?
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 rounded bg-background border border-border text-sm"
                        value={quizInputs.components}
                        onChange={(e) => handleQuizChange("components", e.target.value)}
                      />
                      {quizResult && (
                        <p className={`text-xs mt-1 ${quizResult.components.isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {quizResult.components.isCorrect
                            ? "Correct! DFS from every unvisited node lets us count each connected component."
                            : `Not quite. This graph has ${derivedProperties.componentCount} component(s).`}
                        </p>
                      )}
                      {quizResult && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate("/components")}
                        >
                          View Components Simulation
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium">
                        2. Does this graph contain a cycle? (yes / no)
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 rounded bg-background border border-border text-sm"
                        value={quizInputs.hasCycle}
                        onChange={(e) => handleQuizChange("hasCycle", e.target.value)}
                      />
                      {quizResult && (
                        <p className={`text-xs mt-1 ${quizResult.cycle.isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {quizResult.cycle.isCorrect
                            ? "Correct! DFS can detect a back edge to an ancestor, which indicates a cycle."
                            : derivedProperties.hasCycle
                              ? "This graph DOES contain a cycle (DFS finds an edge to a previously visited non-parent vertex)."
                              : "This graph is acyclic (DFS never finds such a back edge)."}
                        </p>
                      )}
                      {quizResult && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate("/cycle-detection")}
                        >
                          View Cycle Detection Simulation
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium">
                        3. Is this graph bipartite? (yes / no)
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 rounded bg-background border border-border text-sm"
                        value={quizInputs.isBipartite}
                        onChange={(e) => handleQuizChange("isBipartite", e.target.value)}
                      />
                      {quizResult && (
                        <p className={`text-xs mt-1 ${quizResult.bipartite.isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {quizResult.bipartite.isCorrect
                            ? "Correct! DFS (or BFS) can 2-color the graph and check for any same-color edge."
                            : derivedProperties.isBipartite
                              ? "This graph IS bipartite (it can be colored with two colors without conflict)."
                              : "This graph is NOT bipartite (any 2-coloring leads to a conflicting edge)."}
                        </p>
                      )}
                      {quizResult && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate("/bipartite")}
                        >
                          View Bipartite Simulation
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium">
                        4. Is a valid topological ordering possible for this graph? (yes / no)
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 rounded bg-background border border-border text-sm"
                        value={quizInputs.topoPossible}
                        onChange={(e) => handleQuizChange("topoPossible", e.target.value)}
                      />
                      {quizResult && (
                        <p className={`text-xs mt-1 ${quizResult.topoPossible.isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {quizResult.topoPossible.isCorrect
                            ? derivedProperties.hasTopoOrder
                              ? `Correct! A topological order exists; one possible order is [${derivedProperties.topoOrder.join(", ")}].`
                              : "Correct! Because the directed graph has a cycle, no topological ordering is possible."
                            : derivedProperties.hasTopoOrder
                              ? `A topological order IS possible; for example: [${derivedProperties.topoOrder.join(", ")}].`
                              : "No topological ordering exists here because the directed graph contains a cycle."}
                        </p>
                      )}
                      {quizResult && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate("/topological-sort")}
                        >
                          View Topological Sort Simulation
                        </Button>
                      )}
                    </div>

                    <Button type="submit" className="w-full mt-2">
                      Check Answers
                    </Button>
                  </form>
                </div>
              )}

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
                          entry.startsWith("  →")
                            ? "text-muted-foreground pl-4"
                            : entry.startsWith("⬅")
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
