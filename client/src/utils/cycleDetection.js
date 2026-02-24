

export default class CycleDetectionExecutor {
    constructor(adjacencyList, startNode) {
        this.adj = adjacencyList;
        this.nodes = Object.keys(adjacencyList);

        this.visited = new Set();
        this.parent = {}; // Track parent of each node
        this.queue = [];
        this.currentNode = null;
        this.currentNeighbors = [];
        this.log = [];
        this.done = false;

        this.hasCycle = false;
        this.cycleEdge = null; // Store the edge that creates cycle

        // Start from given node or first node
        const start = startNode || this.nodes[0];
        if (start) {
            this.queue.push(start);
            this.parent[start] = null;
            this.log.push(`Starting cycle detection from ${start}`);
        }
    }

    step() {
        if (this.done) {
            return this.getState();
        }

        if (this.queue.length === 0) {
            // Check for unvisited nodes (disconnected components)
            const unvisited = this.nodes.find(node => !this.visited.has(node));

            if (unvisited) {
                this.queue.push(unvisited);
                this.parent[unvisited] = null;
                this.log.push(`New component: Starting from ${unvisited}`);
                return this.getState();
            }

            // All nodes processed
            this.done = true;
            this.currentNode = null;
            this.currentNeighbors = [];
            if (this.hasCycle) {
                this.log.push("CYCLE DETECTED in graph!");
            } else {
                this.log.push("NO CYCLE found - Graph is acyclic");
            }
            return this.getState();
        }

        // Dequeue node
        this.currentNode = this.queue.shift();

        if (this.visited.has(this.currentNode)) {
            return this.step(); // Skip already visited
        }

        // Mark as visited
        this.visited.add(this.currentNode);
        this.log.push(`Visited ${this.currentNode}`);

        // Get neighbors
        const neighbors = this.adj[this.currentNode] || [];
        this.currentNeighbors = neighbors;

        // Check each neighbor
        for (let neighbor of neighbors) {
            if (!this.visited.has(neighbor)) {
                // Unvisited neighbor - add to queue
                if (!this.queue.includes(neighbor)) {
                    this.queue.push(neighbor);
                    this.parent[neighbor] = this.currentNode;
                    this.log.push(`  Enqueued ${neighbor} (parent: ${this.currentNode})`);
                }
            } else if (this.parent[this.currentNode] !== neighbor) {
                // Visited neighbor that's not the parent - CYCLE FOUND!
                this.hasCycle = true;
                this.cycleEdge = { from: this.currentNode, to: neighbor };
                this.log.push(`  CYCLE: ${this.currentNode} to ${neighbor} (already visited, not parent)`);
                this.done = true;
                return this.getState();
            } else {
                // Parent node - skip
                this.log.push(`  ${neighbor} is parent, skipping`);
            }
        }

        return this.getState();
    }

    getState() {
        return {
            queue: [...this.queue],
            visited: Array.from(this.visited),
            parent: { ...this.parent },
            currentNode: this.currentNode,
            currentNeighbors: [...this.currentNeighbors],
            log: [...this.log],
            done: this.done,
            hasCycle: this.hasCycle,
            cycleEdge: this.cycleEdge,
        };
    }

    reset(startNode) {
        const newExecutor = new CycleDetectionExecutor(this.adj, startNode);
        Object.assign(this, newExecutor);
    }

    runAll() {
        while (!this.done) {
            this.step();
        }
        return this.getState();
    }
}
