import FordFulkersonExecutor from "./fordFulkerson";

const INF = 1_000_000;

function toNeighborName(neighbor) {
  return typeof neighbor === "string" ? neighbor : neighbor?.node;
}

export function buildUndirectedAdjacencyList(adjacencyList) {
  const undirected = {};

  for (const node of Object.keys(adjacencyList)) {
    if (!undirected[node]) undirected[node] = new Set();

    for (const neighborRaw of adjacencyList[node] || []) {
      const neighbor = toNeighborName(neighborRaw);
      if (!neighbor || neighbor === node) continue;

      if (!undirected[neighbor]) undirected[neighbor] = new Set();
      undirected[node].add(neighbor);
      undirected[neighbor].add(node);
    }
  }

  for (const node of Object.keys(undirected)) {
    for (const neighbor of undirected[node]) {
      if (!undirected[neighbor]) undirected[neighbor] = new Set();
    }
  }

  const displayAdj = {};
  for (const [node, neighbors] of Object.entries(undirected)) {
    displayAdj[node] = Array.from(neighbors);
  }

  const edges = [];
  for (const [u, neighbors] of Object.entries(undirected)) {
    for (const v of neighbors) {
      if (u < v) edges.push({ u, v });
    }
  }

  return {
    nodes: Object.keys(displayAdj),
    undirected,
    displayAdj,
    edges,
  };
}

function normalizeWhitneyInput(graphInput) {
  if (
    graphInput &&
    Array.isArray(graphInput.nodes) &&
    graphInput.undirected &&
    graphInput.displayAdj &&
    Array.isArray(graphInput.edges)
  ) {
    return graphInput;
  }

  return buildUndirectedAdjacencyList(graphInput || {});
}

function unitCapacityDirectedGraph(nodes, undirected) {
  const directed = {};
  for (const node of nodes) directed[node] = [];

  for (const [node, neighbors] of Object.entries(undirected)) {
    for (const neighbor of neighbors) {
      directed[node].push({ node: neighbor, weight: 1 });
    }
  }

  return directed;
}

function residualReachableSet(residualCapacity, source) {
  const visited = new Set();
  const queue = [source];
  visited.add(source);

  while (queue.length) {
    const current = queue.shift();
    const row = residualCapacity[current] || {};

    for (const [next, cap] of Object.entries(row)) {
      if (cap > 0 && !visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return visited;
}

function runPairMinCut(directedAdj, s, t, undirectedEdges) {
  const executor = new FordFulkersonExecutor(directedAdj, s, t);
  const state = executor.runAll();
  const reachable = residualReachableSet(state.residualCapacity, s);

  const cutEdges = undirectedEdges.filter(({ u, v }) => {
    const uIn = reachable.has(u);
    const vIn = reachable.has(v);
    return uIn !== vIn;
  });

  return {
    value: state.maxFlow,
    cutEdges,
    reachable,
  };
}

function buildVertexSplitGraph(nodes, undirectedEdges, source, sink) {
  const transformed = {};

  for (const node of nodes) {
    transformed[`${node}__in`] = [];
    transformed[`${node}__out`] = [];
  }

  for (const node of nodes) {
    transformed[`${node}__in`].push({
      node: `${node}__out`,
      weight: node === source || node === sink ? INF : 1,
    });
  }

  for (const { u, v } of undirectedEdges) {
    transformed[`${u}__out`].push({ node: `${v}__in`, weight: INF });
    transformed[`${v}__out`].push({ node: `${u}__in`, weight: INF });
  }

  return {
    transformed,
    source: `${source}__out`,
    sink: `${sink}__in`,
  };
}

function isConnected(nodes, undirected) {
  if (nodes.length <= 1) return true;

  const visited = new Set();
  const queue = [nodes[0]];
  visited.add(nodes[0]);

  while (queue.length) {
    const current = queue.shift();
    for (const neighbor of undirected[current] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return visited.size === nodes.length;
}

function areAdjacent(undirected, u, v) {
  return (undirected[u] || new Set()).has(v);
}

export default function computeWhitneyConnectivity(graphInput) {
  const { nodes, undirected, displayAdj, edges } = normalizeWhitneyInput(graphInput);

  if (nodes.length <= 1) {
    return {
      nodes,
      displayAdj,
      isConnected: true,
      delta: 0,
      lambda: 0,
      kappa: 0,
      edgeResult: { pair: null, cutEdges: [], cutSize: 0 },
      vertexResult: { pair: null, cutVertices: [], cutSize: 0 },
      inequalityHolds: true,
    };
  }

  const delta = nodes.reduce((best, node) => {
    const degree = (undirected[node] || new Set()).size;
    return Math.min(best, degree);
  }, Infinity);

  const directedForEdgeCut = unitCapacityDirectedGraph(nodes, undirected);

  let bestEdgeCut = {
    value: Infinity,
    pair: null,
    cutEdges: [],
  };

  let bestVertexCut = {
    value: Infinity,
    pair: null,
    cutVertices: [],
  };

  let hasNonAdjacentPair = false;

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const s = nodes[i];
      const t = nodes[j];

      const edgeCut = runPairMinCut(directedForEdgeCut, s, t, edges);
      if (edgeCut.value < bestEdgeCut.value) {
        bestEdgeCut = {
          value: edgeCut.value,
          pair: [s, t],
          cutEdges: edgeCut.cutEdges,
        };
      }

      if (!areAdjacent(undirected, s, t)) {
        hasNonAdjacentPair = true;

        const split = buildVertexSplitGraph(nodes, edges, s, t);
        const vertexExecutor = new FordFulkersonExecutor(split.transformed, split.source, split.sink);
        const vertexState = vertexExecutor.runAll();
        const reachable = residualReachableSet(vertexState.residualCapacity, split.source);

        const cutVertices = nodes.filter((node) => {
          if (node === s || node === t) return false;
          return reachable.has(`${node}__in`) && !reachable.has(`${node}__out`);
        });

        if (cutVertices.length < bestVertexCut.value) {
          bestVertexCut = {
            value: cutVertices.length,
            pair: [s, t],
            cutVertices,
          };
        }
      }
    }
  }

  const lambda = bestEdgeCut.value === Infinity ? 0 : bestEdgeCut.value;
  if (!hasNonAdjacentPair) {
    bestVertexCut = {
      value: nodes.length - 1,
      pair: null,
      cutVertices: nodes.slice(0, Math.max(0, nodes.length - 1)),
    };
  }

  const kappa = bestVertexCut.value === Infinity ? 0 : bestVertexCut.value;

  return {
    nodes,
    displayAdj,
    isConnected: isConnected(nodes, undirected),
    delta: Number.isFinite(delta) ? delta : 0,
    lambda,
    kappa,
    edgeResult: {
      pair: bestEdgeCut.pair,
      cutEdges: bestEdgeCut.cutEdges,
      cutSize: lambda,
    },
    vertexResult: {
      pair: bestVertexCut.pair,
      cutVertices: bestVertexCut.cutVertices,
      cutSize: kappa,
    },
    inequalityHolds: kappa <= lambda && lambda <= delta,
  };
}
