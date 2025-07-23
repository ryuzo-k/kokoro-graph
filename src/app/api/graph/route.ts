import { NextResponse } from "next/server";
import driver from "@/lib/neo4j";

export async function GET() {
  const s = driver.session();
  const r = await s.executeRead((tx) =>
    tx.run(`
      MATCH (a:Person)-[r:MET_WITH]->(b:Person)
      WITH a, b, r, keys(r.ratings) AS axes
      UNWIND axes AS ax
      WITH a, b, ax, 
           reduce(sum=0, v IN r.ratings[ax] | sum + v) * 1.0 / size(r.ratings[ax]) AS avg
      RETURN ax, a.name AS p1, b.name AS p2, avg
    `)
  );
  await s.close();

  const scoreMap: Record<string, Record<string, number[]>> = {};
  r.records.forEach((rec) => {
    const ax = rec.get("ax");
    const p1 = rec.get("p1");
    const p2 = rec.get("p2");
    const v = rec.get("avg");
    [p1, p2].forEach((p) => {
      scoreMap[p] = scoreMap[p] || {};
      (scoreMap[p][ax] = scoreMap[p][ax] || []).push(v);
    });
  });

  const nodes = Object.entries(scoreMap).map(([id, axes]) => {
    const avgAxes: Record<string, number> = {};
    Object.entries(axes).forEach(
      ([ax, arr]) => (avgAxes[ax] = arr.reduce((a, c) => a + c, 0) / arr.length)
    );
    const overall =
      Object.values(avgAxes).reduce((a, c) => a + c, 0) /
      Object.keys(avgAxes).length;
    return { id, scores: avgAxes, overall };
  });

  return NextResponse.json({ nodes, links: [] });
}
