
export default class BFSExecutor {
  constructor(adjacencyList, startNode) {
    this.adj = adjacencyList;
    this.queue = startNode ? [startNode] : [];
    this.visited = new Set();
    this.log = [];
    this.currentNode = null;
    this.currentNeighbors = [];
    this.done = false;
  }


  step() {
    if (this.done || this.queue.length === 0) {
      this.done = true;
      this.currentNode = null;
      this.currentNeighbors = [];
      return this.getState();
    }

    // Dequeue node
    this.currentNode = this.queue.shift();

    // Skip if already visited
    if (this.visited.has(this.currentNode)) {
      this.log.push(`Skipped ${this.currentNode} (already visited)`);
      return this.step(); // Continue to next
    }

    // Mark as visited
    this.visited.add(this.currentNode);
    this.log.push(`Visited ${this.currentNode}`);

    // Get neighbors for visualization
    const neighbors = this.adj[this.currentNode] || [];
    this.currentNeighbors = neighbors;

    // Enqueue unvisited neighbors
    for (let neighbor of neighbors) {
      if (!this.visited.has(neighbor) && !this.queue.includes(neighbor)) {
        this.queue.push(neighbor);
        this.log.push(`  Enqueued ${neighbor}`);
      }
    }

    return this.getState();
  }

  getState() {
    return {
      queue: [...this.queue],
      visited: Array.from(this.visited),
      currentNode: this.currentNode,
      currentNeighbors: [...this.currentNeighbors],
      log: [...this.log],
      done: this.done,
    };
  }


  reset(startNode) {
    this.queue = startNode ? [startNode] : [];
    this.visited = new Set();
    this.log = [];
    this.currentNode = null;
    this.currentNeighbors = [];
    this.done = false;
  }

  runAll() {
    while (!this.done && this.queue.length > 0) {
      this.step();
    }
    return this.getState();
  }
}
