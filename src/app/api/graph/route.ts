import { NextResponse } from "next/server";
import driver from "@/lib/neo4j";

export async function GET() {
  const s = driver.session();
  
  try {
    // First, get all people
    const peopleResult = await s.executeRead((tx) =>
      tx.run(`MATCH (p:Person) RETURN p.name AS name`)
    );
    
    // If no people exist, return sample data
    if (peopleResult.records.length === 0) {
      await s.close();
      return NextResponse.json({ 
        nodes: [
          { id: "Alice", scores: { kindness: 4.5, intelligence: 3.8 }, overall: 4.15 },
          { id: "Bob", scores: { creativity: 3.2, humor: 4.8 }, overall: 4.0 }
        ], 
        links: [] 
      });
    }

    // Get relationships with ratings
    const relationResult = await s.executeRead((tx) =>
      tx.run(`
        MATCH (a:Person)-[r:MET_WITH]->(b:Person)
        RETURN a.name AS p1, b.name AS p2, r.ratings AS ratings
      `)
    );

    await s.close();

    const scoreMap: Record<string, Record<string, number[]>> = {};
    
    // Process relationships
    relationResult.records.forEach((rec) => {
      const p1 = rec.get("p1");
      const p2 = rec.get("p2");
      const ratings = rec.get("ratings");
      
      if (ratings && typeof ratings === 'object') {
        Object.entries(ratings).forEach(([axis, values]: [string, any]) => {
          if (Array.isArray(values)) {
            const avg = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
            
            [p1, p2].forEach((person) => {
              scoreMap[person] = scoreMap[person] || {};
              (scoreMap[person][axis] = scoreMap[person][axis] || []).push(avg);
            });
          }
        });
      }
    });

    // Create nodes from all people
    const allPeople = peopleResult.records.map(rec => rec.get("name"));
    const nodes = allPeople.map((person) => {
      const personScores = scoreMap[person] || {};
      const avgAxes: Record<string, number> = {};
      
      Object.entries(personScores).forEach(([axis, values]) => {
        avgAxes[axis] = values.reduce((sum, val) => sum + val, 0) / values.length;
      });
      
      const overall = Object.keys(avgAxes).length > 0 ?
        Object.values(avgAxes).reduce((sum, val) => sum + val, 0) / Object.keys(avgAxes).length : 2.5;
      
      return { id: person, scores: avgAxes, overall };
    });

    return NextResponse.json({ nodes, links: [] });
    
  } catch (error) {
    console.error('Graph API error:', error);
    await s.close();
    
    // Return fallback data on error
    return NextResponse.json({ 
      nodes: [
        { id: "Demo User", scores: { kindness: 4.0, intelligence: 3.5 }, overall: 3.75 }
      ], 
      links: [] 
    });
  }
}
