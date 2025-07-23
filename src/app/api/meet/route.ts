import { NextResponse } from "next/server";
import driver from "@/lib/neo4j";
import { getUser } from "@/lib/user";
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { from, to, rating, region } = await req.json();
  const s = driver.session();
  await s.executeWrite(tx =>
    tx.run(
      `
      MERGE (u:User {id:$uid})
      MERGE (a:Person {name:$from, region:$region})
      MERGE (b:Person {name:$to,   region:$region})
      MERGE (u)-[:OWNS]->(a)
      MERGE (u)-[:OWNS]->(b)
      MERGE (a)-[r:MET_WITH]->(b)
      FOREACH (k IN keys($rating) |
        SET r.ratings[k] = coalesce(r.ratings[k], []) + $rating[k]
      )
      `,
      { uid: user.id, from, to, rating, region }
    )
  );
  await s.close();
  return NextResponse.json({ status: "stored" });
}
