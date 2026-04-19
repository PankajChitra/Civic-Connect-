import React from 'react'

export default function IssueCard({issue}){
  return (
    <div className="glass neon rounded-xl p-4 shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-300 uppercase">{issue.category}</div>
          <h3 className="text-xl font-semibold mt-1">{issue.title}</h3>
          <p className="text-gray-400 mt-2 text-sm">{issue.description}</p>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-xs ${issue.status === 'Resolved' ? 'bg-green-800 text-green-300' : issue.status === 'In Progress' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>{issue.status}</div>
          <div className="text-xs text-gray-500 mt-2">{issue.location}</div>
        </div>
      </div>
    </div>
  )
}