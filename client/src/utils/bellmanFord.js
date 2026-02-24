
export default class BellmanFordExecutor {
  constructor(adjacencyList, startNode) {
    this.adj = adjacencyList;
    this.nodes = Object.keys(adjacencyList);
    this.startNode = startNode;
    
    // Build edge list
    this.edges = [];
    Object.entries(adjacencyList).forEach(([from, neighbors]) => {
      neighbors.forEach(({ node: to, weight }) => {
        this.edges.push({ from, to, weight });
      });
    });
    
    // Initialize distances
    this.distance = {};
    this.nodes.forEach(node => {
      this.distance[node] = node === startNode ? 0 : Infinity;
    });
    
    this.currentIteration = 0;
    this.maxIterations = this.nodes.length - 1;
    this.currentEdgeIndex = 0;
    this.currentEdge = null;
    this.log = [];
    this.done = false;
    this.hasNegativeCycle = false;
    this.relaxationOccurred = false;
    
    this.log.push(`Starting Bellman-Ford Algorithm from node ${startNode}`);
    this.log.push(`Total nodes: ${this.nodes.length}, Edges: ${this.edges.length}`);
    this.log.push(`Will perform ${this.maxIterations} iterations`);
    this.log.push(`Initial distances: ${this.formatDistances()}`);
  }

  formatDistances() {
    return Object.entries(this.distance)
      .map(([node, dist]) => `${node}:${dist === Infinity ? 'INF' : dist}`)
      .join(', ');
  }

  step() {
    if (this.done) {
      return this.getState();
    }

    // Check if we've completed all iterations
    if (this.currentIteration >= this.maxIterations) {
      // One more iteration to check for negative cycles
      if (this.currentEdgeIndex < this.edges.length) {
        const edge = this.edges[this.currentEdgeIndex];
        this.currentEdge = edge;
        
        if (this.distance[edge.from] !== Infinity) {
          const newDist = this.distance[edge.from] + edge.weight;
          if (newDist < this.distance[edge.to]) {
            this.hasNegativeCycle = true;
            this.log.push(`\nNegative cycle detected !!!`);
            this.log.push(`Edge ${edge.from}->${edge.to} can still be relaxed`);
            this.done = true;
            this.currentEdge = null;
            return this.getState();
          }
        }
        
        this.currentEdgeIndex++;
        return this.step();
      }
      
      this.done = true;
      this.currentEdge = null;
      this.log.push(`\nAlgorithm Complete! No negative cycles detected.`);
      this.log.push(`Final distances: ${this.formatDistances()}`);
      return this.getState();
    }

    // Start new iteration
    if (this.currentEdgeIndex === 0) {
      this.currentIteration++;
      this.relaxationOccurred = false;
      this.log.push(`\nIteration ${this.currentIteration}/${this.maxIterations}`);
    }

    // Process current edge
    if (this.currentEdgeIndex < this.edges.length) {
      const edge = this.edges[this.currentEdgeIndex];
      this.currentEdge = edge;
      
      this.log.push(`Processing edge ${edge.from}->${edge.to} (weight: ${edge.weight})`);
      
      // Try to relax the edge
      if (this.distance[edge.from] !== Infinity) {
        const newDist = this.distance[edge.from] + edge.weight;
        if (newDist < this.distance[edge.to]) {
          const oldDist = this.distance[edge.to];
          this.distance[edge.to] = newDist;
          this.relaxationOccurred = true;
          this.log.push(`  RELAXED: ${edge.to} distance ${oldDist === Infinity ? 'INF' : oldDist} -> ${newDist}`);
          this.log.push(`  Updated distances: ${this.formatDistances()}`);
        } else {
          this.log.push(`  No relaxation: current ${this.distance[edge.to]} <= new ${newDist}`);
        }
      } else {
        this.log.push(`  Skipped: ${edge.from} is unreachable (distance = INF)`);
      }
      
      this.currentEdgeIndex++;
      return this.getState();
    }

    // End of iteration
    if (!this.relaxationOccurred) {
      this.log.push(`No changes in iteration ${this.currentIteration}. Early termination.`);
      this.done = true;
      this.currentEdge = null;
      this.log.push(`\nAlgorithm Complete!`);
      this.log.push(`Final distances: ${this.formatDistances()}`);
      return this.getState();
    }
    
    // Move to next iteration
    this.currentEdgeIndex = 0;
    this.currentEdge = null;
    return this.step();
  }

  getState() {
    return {
      distance: { ...this.distance },
      currentIteration: this.currentIteration,
      maxIterations: this.maxIterations,
      currentEdge: this.currentEdge ? { ...this.currentEdge } : null,
      log: [...this.log],
      done: this.done,
      hasNegativeCycle: this.hasNegativeCycle,
      edges: this.edges.map(e => ({ ...e })),
    };
  }

  reset(startNode) {
    const newExecutor = new BellmanFordExecutor(this.adj, startNode);
    Object.assign(this, newExecutor);
  }

  runAll() {
    while (!this.done) {
      this.step();
    }
    return this.getState();
  }
}
