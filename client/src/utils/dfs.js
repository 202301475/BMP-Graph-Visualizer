
export default class DFSExecutor {
    constructor(adjacencyList, startNode) {
        this.adj = adjacencyList;
        this.visited = new Set();
        this.log = [];
        this.currentNode = null;
        this.currentNeighbors = [];
        this.done = false;


        this.recursionStack = startNode ? [startNode] : [];// Stack to manage the recursion
        this.neighborIndices = {}; // Track which neighbor to explore next for each node
        this.backtracking = false; // Track if we're currently backtracking

        if (startNode) {
            this.neighborIndices[startNode] = 0;
        }
    }


    step() {
        if (this.done || this.recursionStack.length === 0) {
            this.done = true;
            this.currentNode = null;
            this.currentNeighbors = [];
            this.backtracking = false;
            return this.getState();
        }

        // Get current node from top of stack
        this.currentNode = this.recursionStack[this.recursionStack.length - 1];

        // If not visited yet, visit it
        if (!this.visited.has(this.currentNode)) {
            this.visited.add(this.currentNode);
            this.log.push(`Visited ${this.currentNode}`);
            this.backtracking = false;

            // Initialize neighbor index if not exists
            if (!(this.currentNode in this.neighborIndices)) {
                this.neighborIndices[this.currentNode] = 0;
            }

            // Get all neighbors for visualization
            const neighbors = this.adj[this.currentNode] || [];
            this.currentNeighbors = neighbors;

            return this.getState();
        }

        // Node already visited, try to explore next unvisited neighbor
        const neighbors = this.adj[this.currentNode] || [];
        const currentIndex = this.neighborIndices[this.currentNode] || 0;

        // Find next unvisited neighbor
        let foundUnvisited = false;
        for (let i = currentIndex; i < neighbors.length; i++) {
            const neighbor = neighbors[i];

            if (!this.visited.has(neighbor)) {
                // Found unvisited neighbor, push to stack
                this.recursionStack.push(neighbor);
                this.neighborIndices[this.currentNode] = i + 1;
                this.neighborIndices[neighbor] = 0;
                this.log.push(`  Exploring ${neighbor} from ${this.currentNode}`);
                this.currentNeighbors = [neighbor]; // Highlight the edge we're exploring
                this.backtracking = false;
                foundUnvisited = true;
                break;
            }
        }

        if (!foundUnvisited) {
            // No more unvisited neighbors, backtrack
            const poppedNode = this.recursionStack.pop();
            this.log.push(`Backtracking from ${poppedNode}`);
            this.backtracking = true;

            // Update current node and neighbors for visualization
            if (this.recursionStack.length > 0) {
                this.currentNode = this.recursionStack[this.recursionStack.length - 1];
                this.currentNeighbors = [poppedNode]; // Show backtracking edge
            } else {
                this.currentNode = null;
                this.currentNeighbors = [];
            }
        }

        return this.getState();
    }

    getState() {
        return {
            recursionStack: [...this.recursionStack],
            visited: Array.from(this.visited),
            currentNode: this.currentNode,
            currentNeighbors: [...this.currentNeighbors],
            log: [...this.log],
            done: this.done,
            backtracking: this.backtracking,
        };
    }


    reset(startNode) {
        this.visited = new Set();
        this.log = [];
        this.currentNode = null;
        this.currentNeighbors = [];
        this.done = false;
        this.recursionStack = startNode ? [startNode] : [];
        this.neighborIndices = {};
        this.backtracking = false;

        if (startNode) {
            this.neighborIndices[startNode] = 0;
        }
    }

    runAll() {
        while (!this.done && this.recursionStack.length > 0) {
            this.step();
        }
        return this.getState();
    }
}
