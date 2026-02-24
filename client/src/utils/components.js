
export default class ComponentsExecutor {
    constructor(adjacencyList) {
        this.adj = adjacencyList;
        this.nodes = Object.keys(adjacencyList);

        this.visited = new Set();
        this.queue = [];
        this.currentNode = null;
        this.currentNeighbors = [];
        this.log = [];
        this.done = false;

        this.componentCount = 0;
        this.componentMap = {}; // Maps node to component number
        this.currentComponent = [];

        this.log.push(`Finding connected components in ${this.nodes.length} nodes`);
    }

    step() {
        if (this.done) {
            return this.getState();
        }

        // If queue is empty, look for next unvisited node
        if (this.queue.length === 0) {
            const unvisited = this.nodes.find(node => !this.visited.has(node));

            if (!unvisited) {
                // All nodes visited
                this.done = true;
                this.currentNode = null;
                this.currentNeighbors = [];
                this.log.push(`Found ${this.componentCount} connected component(s)`);
                return this.getState();
            }

            // Start new component
            this.componentCount++;
            this.currentComponent = [];
            this.queue.push(unvisited);
            this.log.push(`Component ${this.componentCount}: Starting from ${unvisited}`);
        }

        // Process current node
        this.currentNode = this.queue.shift();

        if (this.visited.has(this.currentNode)) {
            return this.step(); // Skip already visited
        }

        // Mark as visited and assign to current component
        this.visited.add(this.currentNode);
        this.componentMap[this.currentNode] = this.componentCount;
        this.currentComponent.push(this.currentNode);

        this.log.push(`  Visited ${this.currentNode}`);

        // Get neighbors
        const neighbors = this.adj[this.currentNode] || [];
        this.currentNeighbors = neighbors;

        // Add unvisited neighbors to queue
        for (let neighbor of neighbors) {
            if (!this.visited.has(neighbor) && !this.queue.includes(neighbor)) {
                this.queue.push(neighbor);
                this.log.push(`    Enqueued ${neighbor}`);
            }
        }

        // If queue is empty after this, component is complete
        if (this.queue.length === 0 && this.currentComponent.length > 0) {
            this.log.push(`  Component ${this.componentCount}: {${this.currentComponent.join(', ')}}`);
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
            componentCount: this.componentCount,
            componentMap: { ...this.componentMap },
            currentComponent: [...this.currentComponent],
        };
    }

    reset() {
        const newExecutor = new ComponentsExecutor(this.adj);
        Object.assign(this, newExecutor);
    }

    runAll() {
        while (!this.done) {
            this.step();
        }
        return this.getState();
    }
}
