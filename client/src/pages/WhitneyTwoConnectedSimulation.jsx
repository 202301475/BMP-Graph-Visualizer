import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import GraphVisualization from "../components/GraphVisualization";
import { Button } from "../components/ui/button";
import parseAdjList from "../utils/parseAdjList";
import {
  findArticulationPoints,
  findTwoDisjointPaths,
  isGraphConnected,
  normalizeTwoConnectedInput,
} from "../utils/whitneyTwoConnected";

const MAX_NODES = 12;

function toPathEdges(path) {
  const edges = [];
  for (let i = 0; i < path.length - 1; i += 1) {
    edges.push({ from: path[i], to: path[i + 1] });
  }
  return edges;
}

export default function WhitneyTwoConnectedSimulation() {
  const [input, setInput] = useState("A: B C\nB: A C D\nC: A B D\nD: B C E\nE: D");
  const parsedAdj = useMemo(() => parseAdjList(input), [input]);
  const normalized = useMemo(() => normalizeTwoConnectedInput(parsedAdj), [parsedAdj]);
  const nodes = normalized.nodes;

  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [paths, setPaths] = useState([]);
  const [pathError, setPathError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (nodes.length > MAX_NODES) {
      setError(`Too many nodes! Maximum allowed: ${MAX_NODES}`);
      setPaths([]);
      return;
    }

    if (nodes.length === 0) {
      setError("Please enter a valid graph.");
      setPaths([]);
      return;
    }

    setError("");
  }, [nodes]);

  useEffect(() => {
    setPaths([]);
    setPathError("");
    setAnalysis(null);
  }, [input]);

  useEffect(() => {
    if (!nodes.length) {
      setSource("");
      setTarget("");
      return;
    }

    if (!nodes.includes(source)) {
      setSource(nodes[0]);
    }

    if (!nodes.includes(target)) {
      setTarget(nodes[1] || nodes[0]);
    }
  }, [nodes, source, target]);

  function resetPaths() {
    setPaths([]);
    setPathError("");
  }

  function handleFindPaths() {
    if (error) return;

    if (!source || !target) {
      setPathError("Select two nodes.");
      setPaths([]);
      return;
    }

    if (source === target) {
      setPathError("Select two different nodes.");
      setPaths([]);
      return;
    }

    const result = findTwoDisjointPaths(normalized, source, target);
    if (!result.paths.length) {
      setPathError("Could not find two internally vertex-disjoint paths.");
      setPaths([]);
      return;
    }

    setPathError("");
    setPaths(result.paths);
  }

  function handleCheckTwoConnected() {
    if (error) return;
    const articulationPoints = findArticulationPoints(nodes, normalized.undirected);
    const connected = isGraphConnected(nodes, normalized.undirected);
    const isTwoConnected = connected && nodes.length > 1 && articulationPoints.length === 0;
    setAnalysis({ articulationPoints, connected, isTwoConnected });
  }

  const pathEdgeGroups = useMemo(() => {
    if (!paths.length) return [];
    const colors = ["#22c55e", "#3b82f6"];
    return paths.slice(0, 2).map((path, index) => ({
      label: `Path ${index + 1}`,
      color: colors[index] || "#a855f7",
      edges: toPathEdges(path),
    }));
  }, [paths]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Whitney's Theorem (2-Connected)</h1>
            <p className="text-muted-foreground mt-2">
              Check articulation points and show two internally vertex-disjoint paths for a chosen pair.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">Graph Input (Undirected Adjacency List)</label>
                <textarea
                  className="w-full min-h-32 max-h-80 p-3 rounded-md bg-background border border-border text-foreground font-mono text-sm resize-none overflow-auto"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="A: B C\nB: A C\nC: A B"
                  rows={Math.min(Math.max(4, input.split("\n").length + 1), 20)}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">Format: Node: Neighbor1 Neighbor2 ...</p>
                  <p
                    className={`text-xs font-medium ${
                      error
                        ? "text-red-500"
                        : nodes.length > MAX_NODES * 0.8
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {nodes.length}/{MAX_NODES} nodes
                  </p>
                </div>
                {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex gap-3">
                  <Button onClick={handleCheckTwoConnected} className="flex-1" disabled={!!error}>
                    Check 2-Connected
                  </Button>
                </div>
              </div>

              {analysis && (
                <>
                  <div className={`rounded-lg p-4 border ${
                    analysis.isTwoConnected
                      ? "bg-green-50 border-green-400"
                      : "bg-red-50 border-red-400"
                  }`}>
                    <h4 className="font-semibold mb-1">2-Connected Status</h4>
                    <p className="text-sm font-medium">
                      {analysis.isTwoConnected ? "2-Connected" : "Not 2-Connected"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analysis.connected
                        ? "Graph is connected. Articulation points decide 2-connectedness."
                        : "Graph is disconnected, so it cannot be 2-connected."}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Articulation Points</h4>
                    <div className="min-h-10 flex items-center gap-2 flex-wrap">
                      {analysis.articulationPoints.length ? (
                        analysis.articulationPoints.map((node) => (
                          <div key={node} className="px-3 py-1 rounded bg-purple-500 text-white text-sm font-medium">
                            {node}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">(none)</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Pick u, v and show 2 paths</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">u</label>
                    <select
                      className="w-full p-2 rounded bg-background border border-border"
                      value={source}
                      onChange={(e) => {
                        setSource(e.target.value);
                        resetPaths();
                      }}
                    >
                      {nodes.map((node) => (
                        <option key={node} value={node}>
                          {node}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">v</label>
                    <select
                      className="w-full p-2 rounded bg-background border border-border"
                      value={target}
                      onChange={(e) => {
                        setTarget(e.target.value);
                        resetPaths();
                      }}
                    >
                      {nodes.map((node) => (
                        <option key={node} value={node}>
                          {node}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={resetPaths} variant="outline" className="flex-1">
                    Reset Paths
                  </Button>
                  <Button onClick={handleFindPaths} className="flex-1" disabled={!!error}>
                    Find 2 Paths
                  </Button>
                </div>

                {pathError && <p className="text-xs text-red-500 font-medium">{pathError}</p>}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Paths</h4>
                {paths.length ? (
                  <div className="space-y-2 text-sm font-mono">
                    {paths.map((path, index) => (
                      <div key={`${index}-${path.join("-")}`} className="text-muted-foreground">
                        Path {index + 1}: {path.join(" -> ")}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">(no paths yet)</div>
                )}
              </div>
            </div>

            <div>
              <GraphVisualization
                adjacencyList={normalized.displayAdj}
                visitedNodes={[]}
                queuedNodes={[]}
                currentNode={null}
                currentNeighbors={[]}
                highlightedEdgeGroups={pathEdgeGroups}
                highlightedNodes={analysis?.articulationPoints || []}
                highlightedNodeLabel="Articulation"
                highlightedNodeColor={{ fill: "#a855f7", stroke: "#7e22ce", text: "#ffffff" }}
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
