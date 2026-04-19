import React, { useEffect, useState } from 'react'
import IssueCard from '../components/IssueCard'

const dummy = [
  { id:1, title:'Garbage near Main St', description:'Bin overflowing for 3 days.', category:'Garbage', location:'Main Street', status:'Pending' },
  { id:2, title:'Broken streetlight', description:'No light after 10pm.', category:'Street Light', location:'Oak Avenue', status:'In Progress' },
  { id:3, title:'Potholes', description:'Multiple potholes near market.', category:'Roads', location:'Market Road', status:'Resolved' }
]

export default function Issues(){
  const [issues, setIssues] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(()=>{
    const stored = JSON.parse(localStorage.getItem('issues') || '[]')
    setIssues([...stored, ...dummy])
  },[])

  const filtered = issues.filter(i => filter === 'All' ? true : i.category === filter)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Issues</h2>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 bg-transparent border border-gray-800 rounded-md">
            <option>All</option>
            <option>Garbage</option>
            <option>Street Light</option>
            <option>Roads</option>
            <option>Water</option>
            <option>Other</option>
          </select>
          <button onClick={()=>{localStorage.removeItem('issues'); setIssues(dummy)}} className="px-3 py-2 rounded-md border">Reset Demo</button>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {filtered.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  )
}