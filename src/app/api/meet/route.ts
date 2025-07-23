import { NextResponse } from "next/server";
import driver from "@/lib/neo4j";

type Meet = { from: string; to: string; rating: Record<string, number> };

export async function POST(req: Request) {
  const { from, to, rating }: Meet = await req.json();
  if (!from || !to || !rating)
    return NextResponse.json({ error: "from, to, rating required" }, { status: 400 });

  const s = driver.session();
  await s.executeWrite((tx) =>
    tx.run(
      `
      MERGE (a:Person {name:$from})
      MERGE (b:Person {name:$to})
      MERGE (a)-[r:MET_WITH]->(b)
      FOREACH (k IN keys($rating) |
        SET r.ratings[k] = coalesce(r.ratings[k], []) + $rating[k]
      )
    `,
      { from, to, rating }
    )
  );
  await s.close();
  return NextResponse.json({ status: "stored" });
}
