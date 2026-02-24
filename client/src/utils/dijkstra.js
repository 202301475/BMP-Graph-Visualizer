
export default class DijkstraExecutor {
  constructor(adjacencyList, startNode) {
    this.adj = adjacencyList;
    this.nodes = Object.keys(adjacencyList);
    this.startNode = startNode;
    
    // Initialize data structures
    this.distance = {};
    this.visited = new Set();
    this.priorityQueue = []; // Array of {node, dist} sorted by dist
    this.parent = {}; // For path reconstruction
    
    // Initialize distances
    this.nodes.forEach(node => {
      this.distance[node] = node === startNode ? 0 : Infinity;
      this.parent[node] = null;
    });
    
    if (startNode) {
      this.priorityQueue.push({ node: startNode, dist: 0 });
    }
    
    this.currentNode = null;
    this.currentNeighbors = [];
    this.log = [];
    this.done = false;
    
    this.log.push(`Starting Dijkstra's Algorithm from node ${startNode}`);
    this.log.push(`Initial distances: ${this.formatDistances()}`);
  }

  formatDistances() {
    return Object.entries(this.distance)
      .map(([node, dist]) => `${node}:${dist === Infinity ? 'INF' : dist}`)
      .join(', ');
  }

  formatPriorityQueue() {
    return this.priorityQueue
      .map(item => `${item.node}(${item.dist})`)
      .join(', ');
  }

  step() {
    if (this.done || this.priorityQueue.length === 0) {
      if (!this.done) {
        this.done = true;
        this.currentNode = null;
        this.currentNeighbors = [];
        this.log.push(`Algorithm Complete!`);
        this.log.push(`Final distances: ${this.formatDistances()}`);
      }
      return this.getState();
    }

    // Sort priority queue by distance (min-heap behavior)
    this.priorityQueue.sort((a, b) => a.dist - b.dist);
    
    // Extract minimum
    const { node: u, dist: pqDist } = this.priorityQueue.shift();
    this.currentNode = u;
    
    this.log.push(`\nDequeued ${u} with PQ distance ${pqDist}`);
    this.log.push(`Priority Queue: [${this.formatPriorityQueue() || 'empty'}]`);
    
    // Skip if already visited
    if (this.visited.has(u)) {
      this.log.push(`  Skipped ${u} (already visited)`);
      this.currentNeighbors = [];
      return this.step();
    }
    
    // Skip if this is a stale entry (distance has been improved since adding to PQ)
    if (pqDist > this.distance[u]) {
      this.log.push(`  Skipped ${u} (stale PQ entry: ${pqDist} > current ${this.distance[u]})`);
      this.currentNeighbors = [];
      return this.step();
    }
    
    // Mark as visited
    this.visited.add(u);
    this.log.push(`  Visited: [${Array.from(this.visited).join(', ')}]`);
    this.log.push(`  Current distance to ${u}: ${this.distance[u]}`);
    
    // Get neighbors
    const neighbors = this.adj[u] || [];
    this.currentNeighbors = neighbors.map(edge => edge.node);
    
    if (neighbors.length === 0) {
      this.log.push(`  No neighbors to explore`);
    } else {
      this.log.push(`  Exploring neighbors: [${this.currentNeighbors.join(', ')}]`);
    }
    
    // Relax edges - ALWAYS use this.distance[u] from the distance array
    for (const { node: v, weight } of neighbors) {
      if (!this.visited.has(v)) {
        const newDist = this.distance[u] + weight;
        
        if (newDist < this.distance[v]) {
          this.log.push(`    Relaxing ${u}->${v}: ${this.distance[v] === Infinity ? 'INF' : this.distance[v]} -> ${newDist}`);
          this.log.push(`      Calculation: dist[${u}](${this.distance[u]}) + weight(${weight}) = ${newDist}`);
          this.distance[v] = newDist;
          this.parent[v] = u;
          
          // Add to priority queue (don't remove duplicates - we'll skip stale entries)
          this.priorityQueue.push({ node: v, dist: newDist });
        } else {
          this.log.push(`    No update for ${v}: current ${this.distance[v]} <= new ${newDist}`);
        }
      }
    }
    
    this.log.push(`  Updated distances: ${this.formatDistances()}`);
    
    return this.getState();
  }

  getState() {
    return {
      priorityQueue: this.priorityQueue.map(item => ({ ...item })),
      visited: Array.from(this.visited),
      distance: { ...this.distance },
      currentNode: this.currentNode,
      currentNeighbors: [...this.currentNeighbors],
      log: [...this.log],
      done: this.done,
      parent: { ...this.parent },
    };
  }

  reset(startNode) {
    const newExecutor = new DijkstraExecutor(this.adj, startNode);
    Object.assign(this, newExecutor);
  }

  runAll() {
    while (!this.done && this.priorityQueue.length > 0) {
      this.step();
    }
    return this.getState();
  }
}
