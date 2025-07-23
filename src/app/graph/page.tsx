"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const FG = dynamic(
  () => import("react-force-graph").then((m) => m.ForceGraph2D),
  { ssr: false }
);

export default function GraphPage() {
  const [data, setData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <main className="w-full h-screen">
      <FG
        graphData={data}
        nodeVal={(n: any) => n.overall || 1}
        nodeLabel={(n: any) =>
          `${n.id}\n` +
          Object.entries(n.scores || {})
            .map(([k, v]: any) => `${k}: ${v.toFixed(1)}`)
            .join("\n")
        }
        nodeAutoColorBy="id"
        linkDirectionalParticles={0}
      />
    </main>
  );
}
