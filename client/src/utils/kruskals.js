
export default class KruskalsExecutor {
  constructor(adjacencyList) {
    this.adj = adjacencyList;
    this.nodes = Object.keys(adjacencyList);
    
    // Initialize Union-Find data structure
    this.parent = {};
    this.rank = {};
    this.nodes.forEach(node => {
      this.parent[node] = node; // Each node is its own parent initially
      this.rank[node] = 0;
    });
    
    // Build edge list from adjacency list (avoiding duplicates)
    this.edges = [];
    const processedEdges = new Set();
    
    Object.entries(adjacencyList).forEach(([from, neighbors]) => {
      neighbors.forEach(({ node: to, weight }) => {
        // Create a unique edge identifier (sorted to avoid duplicates)
        const edgeKey = [from, to].sort().join('-');
        
        if (!processedEdges.has(edgeKey)) {
          this.edges.push({ from, to, weight });
          processedEdges.add(edgeKey);
        }
      });
    });
    
    // Sort edges by weight
    this.edges.sort((a, b) => a.weight - b.weight);
    this.sortedEdges = [...this.edges]; // Keep original sorted list for display
    
    this.mstEdges = []; // Edges in the MST
    this.totalWeight = 0;
    this.currentEdge = null;
    this.currentEdgeIndex = 0;
    this.log = [];
    this.done = false;
    
    this.log.push(`Starting Kruskal's Algorithm`);
    this.log.push(`Total edges in graph: ${this.edges.length}`);
    this.log.push(`Sorted edges by weight: ${this.edges.map(e => `${e.from}-${e.to}(${e.weight})`).join(', ')}`);
    this.log.push(`\nInitialized Union-Find structure`);
    this.log.push(`Each node is in its own set initially`);
  }

  // Find with path compression
  find(node) {
    if (this.parent[node] !== node) {
      this.parent[node] = this.find(this.parent[node]); // Path compression
    }
    return this.parent[node];
  }

  // Union by rank
  union(node1, node2) {
    const root1 = this.find(node1);
    const root2 = this.find(node2);
    
    if (root1 === root2) {
      return false; // Already in same set
    }
    
    // Union by rank
    if (this.rank[root1] < this.rank[root2]) {
      this.parent[root1] = root2;
    } else if (this.rank[root1] > this.rank[root2]) {
      this.parent[root2] = root1;
    } else {
      this.parent[root2] = root1;
      this.rank[root1]++;
    }
    
    return true;
  }

  formatParentArray() {
    return Object.entries(this.parent)
      .map(([node, parent]) => `${node}:${parent}`)
      .join(', ');
  }

  formatSets() {
    const sets = {};
    this.nodes.forEach(node => {
      const root = this.find(node);
      if (!sets[root]) sets[root] = [];
      sets[root].push(node);
    });
    return Object.values(sets)
      .map(set => `{${set.join(',')}}`)
      .join(' ');
  }

  step() {
    if (this.done || this.currentEdgeIndex >= this.edges.length) {
      if (!this.done) {
        this.done = true;
        this.currentEdge = null;
        this.log.push(`\nAlgorithm Complete!`);
        this.log.push(`MST Total Weight: ${this.totalWeight}`);
        this.log.push(`MST has ${this.mstEdges.length} edges`);
        this.log.push(`Expected edges in MST: ${this.nodes.length - 1}`);
        
        if (this.mstEdges.length < this.nodes.length - 1) {
          this.log.push(`Warning: Graph is disconnected! MST is incomplete.`);
        }
      }
      return this.getState();
    }

    // Get next edge
    const edge = this.edges[this.currentEdgeIndex];
    this.currentEdge = edge;
    this.currentEdgeIndex++;
    
    this.log.push(`\nConsidering edge ${edge.from}-${edge.to} (weight: ${edge.weight})`);
    
    // Find roots of both nodes
    const root1 = this.find(edge.from);
    const root2 = this.find(edge.to);
    
    this.log.push(`  Find(${edge.from}) = ${root1}`);
    this.log.push(`  Find(${edge.to}) = ${root2}`);
    
    // Check if adding this edge creates a cycle
    if (root1 === root2) {
      this.log.push(`  Rejected: Both nodes in same set (would create cycle)`);
      this.log.push(`  Current sets: ${this.formatSets()}`);
      this.currentEdge = null;
      return this.getState();
    }
    
    // Add edge to MST
    this.mstEdges.push(edge);
    this.totalWeight += edge.weight;
    
    // Union the two sets
    this.union(edge.from, edge.to);
    
    this.log.push(`  Accepted: Added to MST`);
    this.log.push(`  Union(${edge.from}, ${edge.to}) performed`);
    this.log.push(`  MST Edges: ${this.mstEdges.length}, Total Weight: ${this.totalWeight}`);
    this.log.push(`  Parent Array: [${this.formatParentArray()}]`);
    this.log.push(`  Current sets: ${this.formatSets()}`);
    
    // Check if MST is complete
    if (this.mstEdges.length === this.nodes.length - 1) {
      this.done = true;
      this.currentEdge = null;
      this.log.push(`\nMST Complete! All nodes connected.`);
      this.log.push(`MST Total Weight: ${this.totalWeight}`);
    }
    
    return this.getState();
  }

  getState() {
    return {
      sortedEdges: this.sortedEdges.map(e => ({ ...e })),
      mstEdges: this.mstEdges.map(e => ({ ...e })),
      totalWeight: this.totalWeight,
      currentEdge: this.currentEdge ? { ...this.currentEdge } : null,
      currentEdgeIndex: this.currentEdgeIndex,
      parent: { ...this.parent },
      rank: { ...this.rank },
      log: [...this.log],
      done: this.done,
    };
  }

  reset() {
    const newExecutor = new KruskalsExecutor(this.adj);
    Object.assign(this, newExecutor);
  }

  runAll() {
    while (!this.done && this.currentEdgeIndex < this.edges.length) {
      this.step();
    }
    return this.getState();
  }
}
