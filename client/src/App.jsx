import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import BFSSimulation from './pages/BFSSimulation.jsx'
import DFSSimulation from './pages/DFSSimulation.jsx'
import TopologicalSort from './pages/TopologicalSort.jsx'
import BipartiteSimulation from './pages/BipartiteSimulation.jsx'
import ComponentsSimulation from './pages/ComponentsSimulation.jsx'
import CycleDetectionSimulation from './pages/CycleDetectionSimulation.jsx'
import DijkstraSimulation from './pages/DijkstraSimulation.jsx'
import BellmanFordSimulation from './pages/BellmanFordSimulation.jsx'
import FloydWarshallSimulation from './pages/FloydWarshallSimulation.jsx'
import PrimsSimulation from './pages/PrimsSimulation.jsx'
import KruskalsSimulation from './pages/KruskalsSimulation.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bfs" element={<BFSSimulation/>} />
        <Route path="/dfs" element={<DFSSimulation/>} />
        <Route path="/topological-sort" element={<TopologicalSort/>} />
        <Route path="/bipartite" element={<BipartiteSimulation/>} />
        <Route path="/components" element={<ComponentsSimulation/>} />
        <Route path="/cycle-detection" element={<CycleDetectionSimulation/>} />
        <Route path="/dijkstra" element={<DijkstraSimulation/>} />
        <Route path="/bellman-ford" element={<BellmanFordSimulation/>} />
        <Route path="/floyd-warshall" element={<FloydWarshallSimulation/>} />
        <Route path="/prims" element={<PrimsSimulation/>} />
        <Route path="/kruskals" element={<KruskalsSimulation/>} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </>
  )
}
  
export default App
