import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import GraphVisualization from "../components/GraphVisualization";
import { Button } from "../components/ui/button";
import parseAdjList from "../utils/parseAdjList";
import computeWhitneyConnectivity, { buildUndirectedAdjacencyList } from "../utils/whitneyConnectivity";

const MAX_NODES = 12;

export default function WhitneyTheoremSimulation() {
  const [input, setInput] = useState("A: B C\nB: A C D\nC: A B D\nD: B C E\nE: D");
  const parsedAdj = useMemo(() => parseAdjList(input), [input]);
  const normalized = useMemo(() => buildUndirectedAdjacencyList(parsedAdj), [parsedAdj]);
  const nodes = normalized.nodes;

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (nodes.length > MAX_NODES) {
      setError(`Too many nodes! Maximum allowed: ${MAX_NODES}`);
      setResult(null);
      return;
    }

    if (nodes.length === 0) {
      setError("Please enter a valid graph.");
      setResult(null);
      return;
    }

    setError("");
  }, [nodes]);

  function reset() {
    setResult(null);
  }

  function findConnectivityValues() {
    if (error) return;

    const metrics = computeWhitneyConnectivity(normalized);
    setResult(metrics);
  }

  const displayAdj = result?.displayAdj || normalized.displayAdj;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Whitney&apos;s Theorem (Connectivity)</h1>
            <p className="text-muted-foreground mt-2">
              Compute vertex connectivity κ(G), edge connectivity λ(G), and minimum degree δ(G)
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
                  placeholder="A: B C&#10;B: A C&#10;C: A B"
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
                  <Button onClick={reset} variant="outline" className="flex-1">
                    Reset Result
                  </Button>
                  <Button onClick={findConnectivityValues} className="flex-1" disabled={!!error}>
                    Find κ(G), λ(G), δ(G)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg p-5 bg-card border border-border text-foreground">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">δ(G)</h4>
                  <p className="text-3xl font-bold">{result ? result.delta : "-"}</p>
                  <p className="text-xs mt-2 text-muted-foreground">Minimum degree</p>
                </div>

                <div className="rounded-lg p-5 bg-card border border-border text-foreground">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">λ(G)</h4>
                  <p className="text-3xl font-bold">{result ? result.lambda : "-"}</p>
                  <p className="text-xs mt-2 text-muted-foreground">Edge connectivity</p>
                </div>

                <div className="rounded-lg p-5 bg-card border border-border text-foreground">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">κ(G)</h4>
                  <p className="text-3xl font-bold">{result ? result.kappa : "-"}</p>
                  <p className="text-xs mt-2 text-muted-foreground">Vertex connectivity</p>
                </div>
              </div>

              <div
                className={`rounded-lg p-4 border ${
                  !result
                    ? "bg-card border-border"
                    : result.inequalityHolds
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <h4 className="font-semibold mb-1">Whitney Inequality Check</h4>
                <p className="font-mono text-sm">
                  {result
                    ? `κ(G) = ${result.kappa} <= λ(G) = ${result.lambda} <= δ(G) = ${result.delta}`
                    : "Run the algorithm to verify κ(G) <= λ(G) <= δ(G)."}
                </p>
                {result && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {result.inequalityHolds
                      ? "Verified on this graph."
                      : "Inequality failed, which usually indicates invalid graph parsing."}
                  </p>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Minimum Edge Cut (for best pair)</h4>
                {result ? (
                  <>
                    <p className="text-sm mb-2 text-muted-foreground">
                      Pair: {result.edgeResult.pair ? `${result.edgeResult.pair[0]} , ${result.edgeResult.pair[1]}` : "-"}
                    </p>
                    <div className="min-h-10 flex items-center gap-2 flex-wrap">
                      {result.edgeResult.cutEdges.length ? (
                        result.edgeResult.cutEdges.map((edge) => (
                          <div
                            key={`${edge.u}-${edge.v}`}
                            className="px-3 py-1 rounded bg-blue-500 text-white text-sm font-medium"
                          >
                            {edge.u} - {edge.v}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">(no edge cut needed, graph already disconnected)</div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">(not computed yet)</p>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Minimum Vertex Cut (for best pair)</h4>
                {result ? (
                  <>
                    <p className="text-sm mb-2 text-muted-foreground">
                      Pair: {result.vertexResult.pair ? `${result.vertexResult.pair[0]} , ${result.vertexResult.pair[1]}` : "-"}
                    </p>
                    <div className="min-h-10 flex items-center gap-2 flex-wrap">
                      {result.vertexResult.cutVertices.length ? (
                        result.vertexResult.cutVertices.map((node) => (
                          <div key={node} className="px-3 py-1 rounded bg-orange-500 text-white text-sm font-medium">
                            {node}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">(no vertex cut needed, graph already disconnected)</div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">(not computed yet)</p>
                )}
              </div>
            </div>

            <div>
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Edge Cut View (Remove These Edges)</h4>
                  <GraphVisualization
                    adjacencyList={displayAdj}
                    visitedNodes={[]}
                    queuedNodes={[]}
                    currentNode={null}
                    currentNeighbors={[]}
                    highlightedEdges={(result?.edgeResult?.cutEdges || []).map((edge) => ({
                      from: edge.u,
                      to: edge.v,
                    }))}
                    highlightedEdgeLabel="Edges to Remove"
                    width={560}
                    height={360}
                  />
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Vertex Cut View (Remove These Vertices)</h4>
                  <GraphVisualization
                    adjacencyList={displayAdj}
                    visitedNodes={result?.vertexResult?.cutVertices || []}
                    queuedNodes={[]}
                    currentNode={null}
                    currentNeighbors={[]}
                    width={560}
                    height={360}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
