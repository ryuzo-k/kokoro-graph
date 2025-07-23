'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [apiStatus, setApiStatus] = useState<string>('Testing...')
  const [neo4jStatus, setNeo4jStatus] = useState<string>('Testing...')

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data.message || 'Error')
        setNeo4jStatus(data.neo4j || 'Error')
      })
      .catch(err => {
        setApiStatus('Failed')
        setNeo4jStatus('Failed')
        console.error('API test failed:', err)
      })
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Kokoro Graph
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Next.js + TypeScript + Tailwind + shadcn/ui + Neo4j
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">API Status</h3>
            <p className={`text-sm ${apiStatus === 'pong' ? 'text-green-600' : 'text-red-600'}`}>
              {apiStatus}
            </p>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Neo4j Status</h3>
            <p className={`text-sm ${neo4jStatus.includes('Hello') ? 'text-green-600' : 'text-red-600'}`}>
              {neo4jStatus}
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🚀 Ready to build your graph application!
          </p>
        </div>
      </div>
    </main>
  )
}
