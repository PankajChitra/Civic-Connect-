import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home(){
  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <section>
        <h1 className="font-display text-4xl">Keep your neighbourhood safe — report issues quickly</h1>
        <p className="mt-4 text-gray-400 max-w-xl">A simple interface to report community problems and keep everyone informed. Dark, futuristic UI with smooth micro-interactions.</p>

        <div className="mt-6 flex gap-3">
          <Link to="/report" className="px-5 py-3 rounded-md neon font-semibold">Report Issue</Link>
          <Link to="/issues" className="px-5 py-3 rounded-md border border-white/6">View Issues</Link>
        </div>

      </section>

      <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="glass p-6 rounded-2xl">
        <h3 className="text-gray-300">Recent Reports (demo)</h3>
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-lg border border-white/4">
            <div className="flex justify-between"><div className="font-semibold">Garbage piling near Main St</div><div className="text-xs text-gray-400">Pending</div></div>
            <div className="text-sm text-gray-400 mt-1">Reported 2 hours ago · Location: Main Street</div>
          </div>
          <div className="p-4 rounded-lg border border-white/4">
            <div className="flex justify-between"><div className="font-semibold">Fallen tree</div><div className="text-xs text-gray-400">In Progress</div></div>
            <div className="text-sm text-gray-400 mt-1">Reported yesterday · Location: Riverside Park</div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}