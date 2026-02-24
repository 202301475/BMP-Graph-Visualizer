
export default class FloydWarshallExecutor {
  constructor(adjacencyList) {
    this.adj = adjacencyList;
    this.nodes = Object.keys(adjacencyList);
    this.n = this.nodes.length;
    
    // Create node index mapping
    this.nodeIndex = {};
    this.indexNode = {};
    this.nodes.forEach((node, idx) => {
      this.nodeIndex[node] = idx;
      this.indexNode[idx] = node;
    });
    
    // Initialize distance matrix
    this.dist = Array(this.n).fill(null).map(() => Array(this.n).fill(Infinity));
    
    // Set distance from node to itself as 0
    for (let i = 0; i < this.n; i++) {
      this.dist[i][i] = 0;
    }
    
    // Fill initial distances from adjacency list
    Object.entries(adjacencyList).forEach(([from, neighbors]) => {
      const i = this.nodeIndex[from];
      neighbors.forEach(({ node: to, weight }) => {
        const j = this.nodeIndex[to];
        this.dist[i][j] = weight;
      });
    });
    
    // Algorithm state
    this.k = -1; // Intermediate vertex
    this.i = 0;  // Source vertex
    this.j = 0;  // Destination vertex
    this.log = [];
    this.done = false;
    this.currentUpdate = null;
    this.currentI = null; // Current i node name
    this.currentJ = null; // Current j node name
    this.currentK = null; // Current k node name
    
    this.log.push(`Starting Floyd-Warshall Algorithm`);
    this.log.push(`Graph with ${this.n} nodes`);
    this.log.push(`Initial distance matrix:`);
    this.logMatrix();
  }

  formatDistance(dist) {
    return dist === Infinity ? 'INF' : String(dist);
  }

  logMatrix() {
    // Header row
    const header = '    ' + this.nodes.map(n => `${n}`.padStart(4)).join('');
    this.log.push(header);
    
    // Distance rows
    for (let i = 0; i < this.n; i++) {
      const row = `${this.indexNode[i].padStart(3)} ` + 
                  this.dist[i].map(d => this.formatDistance(d).padStart(4)).join('');
      this.log.push(row);
    }
  }

  step() {
    if (this.done) {
      return this.getState();
    }

    // Start new intermediate vertex
    if (this.i === 0) {
      this.k++;
      
      if (this.k >= this.n) {
        this.done = true;
        this.currentUpdate = null;
        this.currentK = null;
        this.currentI = null;
        this.currentJ = null;
        this.log.push(`\nAlgorithm Complete!`);
        this.log.push(`Final all-pairs shortest paths:`);
        this.logMatrix();
        return this.getState();
      }
      
      const kNode = this.indexNode[this.k];
      this.currentK = kNode;
      this.log.push(`\n=== Using intermediate vertex ${kNode} (k=${this.k}) ===`);
    }

    // Process entire row i
    const iNode = this.indexNode[this.i];
    const kNode = this.indexNode[this.k];
    this.currentI = iNode;
    
    let rowUpdates = 0;
    this.log.push(`Processing row ${iNode}:`);
    
    for (let j = 0; j < this.n; j++) {
      if (this.i !== j) {
        const jNode = this.indexNode[j];
        const oldDist = this.dist[this.i][j];
        const newDist = this.dist[this.i][this.k] + this.dist[this.k][j];
        
        if (newDist < oldDist) {
          this.dist[this.i][j] = newDist;
          this.currentJ = jNode;
          this.currentUpdate = {
            from: iNode,
            to: jNode,
            via: kNode,
            oldDist,
            newDist
          };
          this.log.push(`  Updated dist[${iNode}][${jNode}]: ${this.formatDistance(oldDist)} -> ${newDist}`);
          rowUpdates++;
        }
      }
    }
    
    if (rowUpdates === 0) {
      this.log.push(`  No updates in row ${iNode}`);
    }
    
    // Move to next row
    this.i++;
    
    if (this.i >= this.n) {
      // Completed this intermediate vertex
      this.i = 0;
      this.currentI = null;
      this.currentJ = null;
      this.log.push(`Completed processing with intermediate vertex ${kNode}`);
      this.log.push(`Current distance matrix:`);
      this.logMatrix();
    }
    
    return this.getState();
  }

  getState() {
    return {
      dist: this.dist.map(row => [...row]),
      k: this.k,
      i: this.i,
      j: this.j,
      currentUpdate: this.currentUpdate ? { ...this.currentUpdate } : null,
      currentK: this.currentK,
      currentI: this.currentI,
      currentJ: this.currentJ,
      log: [...this.log],
      done: this.done,
      nodes: [...this.nodes],
      nodeIndex: { ...this.nodeIndex },
      indexNode: { ...this.indexNode },
    };
  }

  reset() {
    const newExecutor = new FloydWarshallExecutor(this.adj);
    Object.assign(this, newExecutor);
  }

  runAll() {
    while (!this.done) {
      this.step();
    }
    return this.getState();
  }
}
