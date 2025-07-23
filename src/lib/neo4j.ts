import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
)

export default driver

export async function closeDriver() {
  await driver.close()
}

// Test connection function
export async function testConnection() {
  const session = driver.session()
  try {
    const result = await session.run('RETURN "Hello, Neo4j!" as message')
    return result.records[0].get('message')
  } catch (error) {
    console.error('Neo4j connection error:', error)
    throw error
  } finally {
    await session.close()
  }
}
