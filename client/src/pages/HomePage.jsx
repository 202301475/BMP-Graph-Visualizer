import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowRight, Network, Map, Share2, ShoppingCart } from "lucide-react";
import GraphAlgorithmIntroductionCard from "../components/ui/Cards/GraphAlgorithmIntroductionCard";
import Waves from "../components/background/Waves";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import GraphTypes from "../assets/graphtypes.png";

export default function Home() {
  const navigate = useNavigate();
  const algorithms = [
    {
      title: "Breadth-First Search (BFS)",
      description: "Level-order traversal",
      content:
        "Explores all vertices at the present depth before moving to vertices at the next depth level. Perfect for finding shortest paths in unweighted graphs.",
      time: "O(V + E)",
      space: "O(V)",
      link: "/bfs"
    },
    {
      title: "Depth-First Search (DFS)",
      description: "Deep exploration traversal",
      content:
        "Explores as far as possible along each branch before backtracking. Essential for cycle detection, topological sorting, and path finding.",
      time: "O(V + E)",
      space: "O(V)",
      link: "/dfs"
    },
    {
      title: "Dijkstra's Algorithm",
      description: "Shortest path finder",
      content:
        "Finds the shortest path between nodes in a weighted graph with non-negative edge weights. The foundation of GPS and routing systems.",
      time: "O((V + E) log V)",
      space: "O(V)",
      link: "/dijkstra"
    },
    {
      title: "Bellman-Ford Algorithm",
      description: "Handles negative weights",
      content:
        "Computes shortest paths from a single source even with negative edge weights. Can detect negative cycles in graphs.",
      time: "O(V × E)",
      space: "O(V)",
      link: "/bellman-ford"
    },
    {
      title: "Floyd-Warshall Algorithm",
      description: "All-pairs shortest paths",
      content:
        "Finds shortest paths between all pairs of vertices. Uses dynamic programming to efficiently compute distances in dense graphs.",
      time: "O(V³)",
      space: "O(V²)",
      link: "/floyd-warshall"
    },
    {
      title: "Topological Sort",
      description: "Dependency ordering",
      content:
        "Orders vertices in a directed acyclic graph so that for every edge from u to v, u comes before v. Essential for task scheduling.",
      time: "O(V + E)",
      space: "O(V)",
      link: "/topological-sort"
    },
  ];

  const applications = [
    {
      title: "Social Networks",
      icon: <Share2 className="h-6 w-6 text-primary" />,
      content:
        "Friend suggestions, connection recommendations, and community detection in platforms like Facebook, LinkedIn, and Twitter all rely on graph algorithms to analyze relationships between users.",
    },
    {
      title: "Navigation & Maps",
      icon: <Map className="h-6 w-6 text-primary" />,
      content:
        "GPS systems, Google Maps, and ride-sharing apps use shortest path algorithms to calculate optimal routes, estimate travel times, and provide turn-by-turn directions.",
    },
    {
      title: "Network Routing",
      icon: <Network className="h-6 w-6 text-primary" />,
      content:
        "Internet routers use graph algorithms to determine the most efficient path for data packets to travel from source to destination, ensuring fast and reliable connectivity.",
    },
    {
      title: "Recommendation Systems",
      icon: <ShoppingCart className="h-6 w-6 text-primary" />,
      content:
        "E-commerce platforms and streaming services use graph-based algorithms to analyze user behavior and product relationships, delivering personalized recommendations.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
        <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Base Waves layer */}
        <div className="absolute inset-0 opacity-90">
          <Waves className="absolute inset-0 h-full w-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight text-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              Master Graph Algorithms
            </h1>

            <p className="text-xl md:text-2xl font-bold bg-background/10 text-foreground text-balance max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              Learn the fundamental data structure that powers social networks,
              navigation systems, and modern computing
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-lg px-8 shadow-lg backdrop-blur-3xl hover:text-foreground">
                Start Learning <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent border-black/20 border-2 backdrop-blur-3xl"
              >
                View Algorithms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is a Graph Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What is a Graph?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
                A graph is a non-linear data structure consisting of nodes
                (vertices) and edges that connect these nodes. It's one of the
                most versatile data structures in computer science.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Key Components</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                        V
                      </span>
                      <span>
                        <strong className="text-foreground">
                          Vertices (Nodes):
                        </strong>{" "}
                        The fundamental units that represent entities
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                        E
                      </span>
                      <span>
                        <strong className="text-foreground">Edges:</strong>{" "}
                        Connections between vertices that represent
                        relationships
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                        W
                      </span>
                      <span>
                        <strong className="text-foreground">Weight:</strong>{" "}
                        Optional values on edges representing cost, distance, or
                        capacity
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 space-y-3">
                  <h4 className="font-semibold text-lg">Types of Graphs</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-medium">Directed</p>
                      <p className="text-sm text-muted-foreground">
                        One-way edges
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-medium">Undirected</p>
                      <p className="text-sm text-muted-foreground">
                        Two-way edges
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-medium">Weighted</p>
                      <p className="text-sm text-muted-foreground">
                        Edges have values
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-medium">Cyclic</p>
                      <p className="text-sm text-muted-foreground">
                        Contains loops
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-center">
                <img src={GraphTypes} alt="Graph Illustration" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Algorithms Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Essential Graph Algorithms
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
                Master these fundamental algorithms to solve complex problems
                efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {algorithms.map((algo, index) => (
                <GraphAlgorithmIntroductionCard
                  key={algo.title}
                  title={algo.title}
                  description={algo.description}
                  content={algo.content}
                  time={algo.time}
                  space={algo.space}
                  link={algo.link}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Applications */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Real-World Applications
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
                Graph algorithms power the technology you use every day
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {applications.map((app) => (
                <Card
                  key={app.title}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="flex items-center gap-4">
                    {app.icon}
                    <CardTitle>{app.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {app.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              Ready to Master Graph Algorithms?
            </h2>
            <p className="text-xl text-muted-foreground text-balance">
              Start your journey into one of computer science's most powerful
              concepts
            </p>
            <button onClick={() => navigate("/bfs")}>
            <Button size="lg" className="text-lg px-8">
              Begin Learning Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2026 Graphify. Learn, Practice, Master.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
