
class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return root;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].indegree <= this.heap[index].indegree) break;

      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.heap.length && this.heap[leftChild].indegree < this.heap[smallest].indegree) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].indegree < this.heap[smallest].indegree) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }

  size() {
    return this.heap.length;
  }

  toArray() {
    return this.heap.map(item => ({ ...item }));
  }
}

export default class TopologicalSortExecutor {
  constructor(adjacencyList) {
    this.adj = adjacencyList;
    this.nodes = Object.keys(adjacencyList);

    // Calculate indegrees
    this.indegree = {};
    this.nodes.forEach(node => this.indegree[node] = 0);

    Object.entries(adjacencyList).forEach(([from, neighbors]) => {
      neighbors.forEach(to => {
        this.indegree[to] = (this.indegree[to] || 0) + 1;
      });
    });

    // Initialize priority queue (min-heap) with nodes having indegree 0
    this.pq = new MinHeap();
    this.nodes.forEach(node => {
      if (this.indegree[node] === 0) {
        this.pq.push({ node, indegree: 0 });
      }
    });

    this.result = [];
    this.currentNode = null;
    this.currentNeighbors = [];
    this.log = [];
    this.done = false;
    this.hasCycle = false;
    this.indegreeUpdates = {}; // Track which nodes are being updated

    this.log.push("Initialized indegrees:");
    this.nodes.forEach(node => {
      this.log.push(`  ${node}: indegree = ${this.indegree[node]}`);
    });
    this.log.push("Nodes with indegree 0 added to heap");
  }

  step() {
    if (this.done) {
      return this.getState();
    }

    // Clear previous updates
    this.indegreeUpdates = {};

    if (this.pq.size() === 0) {
      // Check if all nodes are processed
      if (this.result.length < this.nodes.length) {
        this.hasCycle = true;
        this.log.push("Cycle detected! Cannot complete topological sort.");
        this.log.push(`Processed ${this.result.length}/${this.nodes.length} nodes`);
      } else {
        this.log.push("Topological sort completed successfully!");
      }
      this.done = true;
      this.currentNode = null;
      this.currentNeighbors = [];
      return this.getState();
    }

    // Pop node with smallest indegree from heap
    const current = this.pq.pop();
    this.currentNode = current.node;
    this.result.push(current.node);

    this.log.push(`Popped ${current.node} from heap (indegree: ${current.indegree})`);
    this.log.push(`  Result: [${this.result.join(', ')}]`);

    // Get neighbors for visualization
    const neighbors = this.adj[current.node] || [];
    this.currentNeighbors = neighbors;

    // Reduce indegree of neighbors
    if (neighbors.length > 0) {
      this.log.push(`  Updating neighbors' indegrees:`);
      neighbors.forEach(neighbor => {
        const oldIndegree = this.indegree[neighbor];
        this.indegree[neighbor]--;
        this.indegreeUpdates[neighbor] = this.indegree[neighbor];
        this.log.push(`     ${neighbor}: ${oldIndegree} -> ${this.indegree[neighbor]}`);

        // If indegree becomes 0, add to heap
        if (this.indegree[neighbor] === 0) {
          this.pq.push({ node: neighbor, indegree: 0 });
          this.log.push(`     ${neighbor} added to heap`);
        }
      });
    }

    return this.getState();
  }

  getState() {
    return {
      heap: this.pq.toArray(),
      indegree: { ...this.indegree },
      indegreeUpdates: { ...this.indegreeUpdates },
      result: [...this.result],
      currentNode: this.currentNode,
      currentNeighbors: [...this.currentNeighbors],
      log: [...this.log],
      done: this.done,
      hasCycle: this.hasCycle,
    };
  }

  reset() {
    const newExecutor = new TopologicalSortExecutor(this.adj);
    Object.assign(this, newExecutor);
  }

  runAll() {
    while (!this.done) {
      this.step();
    }
    return this.getState();
  }
}
