import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import TradeHistory from './pages/TradeHistory'
import ActivePositions from './pages/ActivePositions'

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="flex">
        <nav className="w-64 bg-gray-800 text-white p-6 min-h-screen">
          <h1 className="text-2xl font-bold mb-8">CAP Client</h1>
          <ul>
            <li className="mb-4">
              <Link to="/active-positions" className="text-lg hover:text-blue-400">Active Positions</Link>
            </li>
            <li className="mb-4">
              <Link to="/trade-history" className="text-lg hover:text-blue-400">Trade History</Link>
            </li>
          </ul>
        </nav>
        <main className="flex-1">
          <Routes>
            <Route path="/active-positions" element={<ActivePositions />} />
            <Route path="/trade-history" element={<TradeHistory />} />
            <Route path="/" element={<ActivePositions />} /> {/* Default route */}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

