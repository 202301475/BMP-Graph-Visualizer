function normalizeUndirectedAdjacency(adjacencyList) {
  const undirected = {};

  Object.entries(adjacencyList || {}).forEach(([node, neighbors]) => {
    if (!undirected[node]) undirected[node] = new Set();
    (neighbors || []).forEach((neighbor) => {
      if (!neighbor || neighbor === node) return;
      if (!undirected[neighbor]) undirected[neighbor] = new Set();
      undirected[node].add(neighbor);
      undirected[neighbor].add(node);
    });
  });

  Object.keys(undirected).forEach((node) => {
    if (!undirected[node]) undirected[node] = new Set();
  });

  const displayAdj = {};
  Object.entries(undirected).forEach(([node, neighbors]) => {
    displayAdj[node] = Array.from(neighbors);
  });

  return {
    nodes: Object.keys(displayAdj),
    undirected,
    displayAdj,
  };
}

export function normalizeTwoConnectedInput(graphInput) {
  if (
    graphInput &&
    Array.isArray(graphInput.nodes) &&
    graphInput.undirected &&
    graphInput.displayAdj
  ) {
    return graphInput;
  }

  return normalizeUndirectedAdjacency(graphInput || {});
}

export function isGraphConnected(nodes, undirected) {
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

export function findArticulationPoints(nodes, undirected) {
  const disc = {};
  const low = {};
  const parent = {};
  const visited = new Set();
  const points = new Set();
  let time = 0;

  function dfs(u) {
    visited.add(u);
    time += 1;
    disc[u] = time;
    low[u] = time;

    let childCount = 0;

    for (const v of undirected[u] || []) {
      if (!visited.has(v)) {
        parent[v] = u;
        childCount += 1;
        dfs(v);
        low[u] = Math.min(low[u], low[v]);

        if (parent[u] == null && childCount > 1) {
          points.add(u);
        }
        if (parent[u] != null && low[v] >= disc[u]) {
          points.add(u);
        }
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  nodes.forEach((node) => {
    if (!visited.has(node)) {
      parent[node] = null;
      dfs(node);
    }
  });

  return Array.from(points);
}

function bfsPath(undirected, source, sink, blocked, blockedEdges) {
  const queue = [source];
  const parent = {};
  parent[source] = source;

  while (queue.length) {
    const current = queue.shift();
    if (current === sink) break;

    for (const neighbor of undirected[current] || []) {
      if (blocked && blocked.has(neighbor)) continue;
      if (blockedEdges && blockedEdges.has(`${current}::${neighbor}`)) continue;
      if (blockedEdges && blockedEdges.has(`${neighbor}::${current}`)) continue;
      if (parent[neighbor] != null) continue;
      parent[neighbor] = current;
      queue.push(neighbor);
    }
  }

  if (parent[sink] == null) return null;

  const path = [];
  let node = sink;
  while (node !== source) {
    path.push(node);
    node = parent[node];
  }
  path.push(source);
  path.reverse();
  return path;
}

function buildBlockedEdgesForPath(path, edgeIndex) {
  if (!path || path.length < 2) return new Set();
  const from = path[edgeIndex];
  const to = path[edgeIndex + 1];
  if (!from || !to) return new Set();
  return new Set([`${from}::${to}`, `${to}::${from}`]);
}

export function findTwoDisjointPaths(normalized, source, sink) {
  if (!normalized || !source || !sink || source === sink) {
    return { paths: [], maxFlow: 0 };
  }

  const normalizedInput = normalizeTwoConnectedInput(normalized);
  const nodes = normalizedInput.nodes || Object.keys(normalizedInput.displayAdj || {});
  if (!nodes.includes(source) || !nodes.includes(sink)) {
    return { paths: [], maxFlow: 0 };
  }

  const path1 = bfsPath(normalizedInput.undirected, source, sink);
  if (!path1) return { paths: [], maxFlow: 0 };

  const blocked = new Set(path1.slice(1, -1));
  blocked.delete(source);
  blocked.delete(sink);

  let path2 = bfsPath(normalizedInput.undirected, source, sink, blocked);
  if (path2 && path2.join("::") !== path1.join("::")) {
    return { paths: [path1, path2], maxFlow: 2 };
  }

  for (let i = 0; i < path1.length - 1; i += 1) {
    const blockedEdges = buildBlockedEdgesForPath(path1, i);
    path2 = bfsPath(normalizedInput.undirected, source, sink, blocked, blockedEdges);
    if (path2 && path2.join("::") !== path1.join("::")) {
      return { paths: [path1, path2], maxFlow: 2 };
    }
  }

  return { paths: [], maxFlow: 1 };
}
