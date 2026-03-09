import { Home, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";

const ALGORITHMS = [
  { name: "Breadth-First Search (BFS)", route: "/bfs" },
  { name: "Depth-First Search (DFS)", route: "/dfs" },
  { name: "Dijkstra's Algorithm", route: "/dijkstra" },
  { name: "Bellman-Ford Algorithm", route: "/bellman-ford" },
  { name: "Floyd-Warshall Algorithm", route: "/floyd-warshall" },
  { name: "Topological Sort (Kahn's)", route: "/topological-sort" },
  { name: "Bipartite Graph Check", route: "/bipartite" },
  { name: "Connected Components", route: "/components" },
  { name: "Cycle Detection", route: "/cycle-detection" },
  { name: "Prim's Algorithm", route: "/prims" },
  { name: "Kruskal's Algorithm", route: "/kruskals" },
];

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="bg-background/80 backdrop-blur-md border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-4">

          {/* Logo */}
          <img
            src={Logo}
            alt="Graphify Logo"
            className="h-8 cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* Algorithms Dropdown */}
          <details className="relative flex-1">
            <summary
              className="flex items-center gap-2 px-4 py-2 rounded-full border
                         bg-background/60 cursor-pointer list-none"
            >
              <Search size={17} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Algorithms
              </span>
            </summary>

            <div className="absolute top-full mt-2 w-full bg-background
                            border rounded-lg shadow-lg overflow-hidden z-50">
              {ALGORITHMS.map((algo) => (
                <div
                  key={algo.route}
                  className="px-4 py-3 hover:bg-muted cursor-pointer font-medium text-foreground"
                  onClick={() => navigate(algo.route)}
                >
                  {algo.name}
                </div>
              ))}
            </div>
          </details>

          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/")}
          >
            <Home />
          </Button>

        </div>
      </div>
    </nav>
  );
}
