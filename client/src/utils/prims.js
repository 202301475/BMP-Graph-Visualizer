
export default class PrimsExecutor {
  constructor(adjacencyList, startNode) {
    this.adj = adjacencyList;
    this.nodes = Object.keys(adjacencyList);
    this.startNode = startNode;
    
    // Initialize data structures
    this.visited = new Set();
    this.priorityQueue = []; // Array of {from, to, weight} sorted by weight
    this.mstEdges = []; // Edges in the MST
    this.totalWeight = 0;
    
    this.currentEdge = null; // Current edge being processed
    this.currentNode = null; // Current node being added to MST
    this.log = [];
    this.done = false;
    
    if (startNode) {
      this.visited.add(startNode);
      this.currentNode = startNode;
      this.log.push(`Starting Prim's Algorithm from node ${startNode}`);
      this.log.push(`Added ${startNode} to MST`);
      
      // Add all edges from start node to priority queue
      const neighbors = adjacencyList[startNode] || [];
      for (const { node: neighbor, weight } of neighbors) {
        if (!this.visited.has(neighbor)) {
          this.priorityQueue.push({ from: startNode, to: neighbor, weight });
          this.log.push(`  Added edge ${startNode}-${neighbor} (weight: ${weight}) to PQ`);
        }
      }
    }
  }

  formatPriorityQueue() {
    return this.priorityQueue
      .sort((a, b) => a.weight - b.weight)
      .map(e => `${e.from}-${e.to}(${e.weight})`)
      .join(', ');
  }

  step() {
    if (this.done || this.priorityQueue.length === 0) {
      if (!this.done) {
        this.done = true;
        this.currentEdge = null;
        this.currentNode = null;
        this.log.push(`\nAlgorithm Complete!`);
        this.log.push(`MST Total Weight: ${this.totalWeight}`);
        this.log.push(`MST has ${this.mstEdges.length} edges`);
        
        if (this.visited.size < this.nodes.length) {
          this.log.push(`Warning: Graph is disconnected. MST contains ${this.visited.size}/${this.nodes.length} nodes`);
        }
      }
      return this.getState();
    }

    // Sort priority queue by weight (min-heap behavior)
    this.priorityQueue.sort((a, b) => a.weight - b.weight);
    
    // Extract minimum weight edge
    const edge = this.priorityQueue.shift();
    this.currentEdge = edge;
    
    this.log.push(`\nDequeued edge ${edge.from}-${edge.to} (weight: ${edge.weight})`);
    this.log.push(`Priority Queue: [${this.formatPriorityQueue() || 'empty'}]`);
    
    // Check if 'to' node is already visited (skip if it creates a cycle)
    if (this.visited.has(edge.to)) {
      this.log.push(`  Skipped: ${edge.to} already in MST (would create cycle)`);
      this.currentEdge = null;
      return this.step(); // Continue to next edge
    }
    
    // Add edge to MST
    this.mstEdges.push(edge);
    this.totalWeight += edge.weight;
    this.visited.add(edge.to);
    this.currentNode = edge.to;
    
    this.log.push(`  Added edge ${edge.from}-${edge.to} to MST`);
    this.log.push(`  Added node ${edge.to} to MST`);
    this.log.push(`  MST Edges: ${this.mstEdges.length}, Total Weight: ${this.totalWeight}`);
    this.log.push(`  Visited: [${Array.from(this.visited).join(', ')}]`);
    
    // Add all edges from newly added node to priority queue
    const neighbors = this.adj[edge.to] || [];
    let addedEdges = 0;
    
    for (const { node: neighbor, weight } of neighbors) {
      if (!this.visited.has(neighbor)) {
        this.priorityQueue.push({ from: edge.to, to: neighbor, weight });
        this.log.push(`  Added edge ${edge.to}-${neighbor} (weight: ${weight}) to PQ`);
        addedEdges++;
      }
    }
    
    if (addedEdges === 0) {
      this.log.push(`  No new edges added (all neighbors already in MST)`);
    }
    
    return this.getState();
  }

  getState() {
    return {
      priorityQueue: this.priorityQueue.map(e => ({ ...e })),
      visited: Array.from(this.visited),
      mstEdges: this.mstEdges.map(e => ({ ...e })),
      totalWeight: this.totalWeight,
      currentEdge: this.currentEdge ? { ...this.currentEdge } : null,
      currentNode: this.currentNode,
      log: [...this.log],
      done: this.done,
    };
  }

  reset(startNode) {
    const newExecutor = new PrimsExecutor(this.adj, startNode);
    Object.assign(this, newExecutor);
  }

  runAll() {
    while (!this.done && this.priorityQueue.length > 0) {
      this.step();
    }
    return this.getState();
  }
}
