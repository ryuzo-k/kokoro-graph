import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/neo4j'

export async function GET() {
  try {
    // Test Neo4j connection
    const message = await testConnection()
    
    return NextResponse.json({ 
      message: 'pong',
      neo4j: message,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      message: 'pong',
      neo4j: 'Connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
