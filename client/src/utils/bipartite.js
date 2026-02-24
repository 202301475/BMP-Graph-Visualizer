

export default class BipartiteExecutor {
    constructor(adjacencyList, startNode) {
        this.adj = adjacencyList;
        this.nodes = Object.keys(adjacencyList);

        // Initialize colors (-1: uncolored, 0: Red, 1: Black)
        this.color = {};
        this.nodes.forEach(node => this.color[node] = -1);

        this.queue = [];
        this.currentNode = null;
        this.currentNeighbors = [];
        this.log = [];
        this.done = false;
        this.isBipartite = true;
        this.conflictEdge = null; // Store conflict edge for visualization

        // Start BFS from the given node or first node
        const start = startNode || this.nodes[0];
        if (start) {
            this.queue.push(start);
            this.color[start] = 0; // Color first node as Red
            this.log.push(`Starting from ${start}, colored RED`);
        }
    }

    step() {
        if (this.done) {
            return this.getState();
        }

        if (this.queue.length === 0) {
            // Check if there are unvisited nodes (disconnected components)
            const unvisited = this.nodes.find(node => this.color[node] === -1);
            if (unvisited) {
                this.queue.push(unvisited);
                this.color[unvisited] = 0; // Color as Red
                this.log.push(`New component: ${unvisited}, colored RED`);
                return this.getState();
            }

            // All nodes processed
            this.done = true;
            this.currentNode = null;
            this.currentNeighbors = [];
            if (this.isBipartite) {
                this.log.push("Graph is BIPARTITE!");
            } else {
                this.log.push("Graph is NOT BIPARTITE!");
            }
            return this.getState();
        }

        // Dequeue node
        this.currentNode = this.queue.shift();
        const currentColor = this.color[this.currentNode];
        const oppositeColor = 1 - currentColor;
        const colorName = currentColor === 0 ? "RED" : "BLACK";

        this.log.push(`Processing ${this.currentNode} (${colorName})`);

        // Get neighbors
        const neighbors = this.adj[this.currentNode] || [];
        this.currentNeighbors = neighbors;

        // Try to color neighbors with opposite color
        for (let neighbor of neighbors) {
            if (this.color[neighbor] === -1) {
                // Uncolored, assign opposite color
                this.color[neighbor] = oppositeColor;
                this.queue.push(neighbor);
                const neighborColorName = oppositeColor === 0 ? "RED" : "BLACK";
                this.log.push(`  ${neighbor} colored ${neighborColorName}`);
            } else if (this.color[neighbor] === currentColor) {
                // Same color as current node - NOT BIPARTITE!
                this.isBipartite = false;
                this.conflictEdge = { from: this.currentNode, to: neighbor };
                const conflictColor = currentColor === 0 ? "RED" : "BLACK";
                this.log.push(`  CONFLICT: ${neighbor} already ${conflictColor} (same as ${this.currentNode})`);
                this.done = true;
                return this.getState();
            } else {
                // Already has opposite color - valid
                const neighborColorName = this.color[neighbor] === 0 ? "RED" : "BLACK";
                this.log.push(`  ${neighbor} already ${neighborColorName} (valid)`);
            }
        }

        return this.getState();
    }

    getState() {
        return {
            queue: [...this.queue],
            color: { ...this.color },
            currentNode: this.currentNode,
            currentNeighbors: [...this.currentNeighbors],
            log: [...this.log],
            done: this.done,
            isBipartite: this.isBipartite,
            conflictEdge: this.conflictEdge,
        };
    }

    reset(startNode) {
        const newExecutor = new BipartiteExecutor(this.adj, startNode);
        Object.assign(this, newExecutor);
    }

    runAll() {
        while (!this.done) {
            this.step();
        }
        return this.getState();
    }
}
