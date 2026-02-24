
export function parseWeightedAdjList(text) {
  const map = {};
  const lines = text.split("\n");
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(":");
    if (parts.length < 2) continue;
    const node = parts[0].trim();
    // Parse neighbors with weights: "A: B(5) C(3)" or "A: B,5 C,3"
    const neighborsStr = parts[1].trim();
    const neighbors = [];
    
    if (!neighborsStr) {
      map[node] = [];
      continue;
    }
    
    // Match patterns like "B(5)" or "B,5"
    const matches = neighborsStr.matchAll(/([A-Za-z0-9]+)[\(,](\d+)[\)]?/g);
    for (const match of matches) {
      const neighbor = match[1].trim();
      const weight = parseInt(match[2], 10);
      if (neighbor && !isNaN(weight)) {
        neighbors.push({ node: neighbor, weight });
      }
    }
    
    map[node] = neighbors;
  }
  
  // Ensure isolated nodes are included if referenced as neighbor
  Object.values(map)
    .flat()
    .forEach((edge) => {
      if (edge && edge.node && !map[edge.node]) {
        map[edge.node] = [];
      }
    });
    
  return map;
}

export default parseWeightedAdjList;
