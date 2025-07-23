"use client";
import { useEffect, useState, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";

export default function GraphPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const [isClient, setIsClient] = useState(false);
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetch("/api/graph")
      .then((r) => r.json())
      .then(setData)
      .catch((err) => {
        console.error('Failed to fetch graph data:', err);
        // Set fallback data
        setData({
          nodes: [{ id: "Error loading data", scores: {}, overall: 1 }],
          links: []
        });
      });
  }, []);

  useEffect(() => {
    if (!isClient || !networkRef.current || data.nodes.length === 0) return;

    // Convert data for vis-network
    const nodes = new DataSet(
      data.nodes.map((node) => ({
        id: node.id,
        label: node.id,
        title: `${node.id}\n` + 
               Object.entries(node.scores || {})
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 .map(([k, v]: any) => `${k}: ${v.toFixed(1)}`)
                 .join('\n') +
               `\nOverall: ${node.overall.toFixed(2)}`,
        size: Math.max(node.overall * 10, 10),
        color: {
          background: `hsl(${(node.id.charCodeAt(0) * 137.5) % 360}, 70%, 60%)`,
          border: '#2B7CE9'
        }
      }))
    );

    const edges = new DataSet(
      data.links.map((link, index) => ({
        id: index,
        from: link.source,
        to: link.target
      }))
    );

    const graphData = { nodes, edges };
    
    const options = {
      nodes: {
        shape: 'circle' as const,
        font: {
          size: 14,
          color: '#343434'
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        color: { inherit: 'from' as const },
        smooth: {
          enabled: true,
          type: 'continuous' as const,
          roundness: 0.5
        }
      },
      physics: {
        stabilization: { iterations: 100 },
        barnesHut: {
          gravitationalConstant: -8000,
          springConstant: 0.001,
          springLength: 200
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200
      }
    };

    // Cleanup previous network
    if (networkInstance.current) {
      networkInstance.current.destroy();
    }

    // Create new network
    networkInstance.current = new Network(networkRef.current, graphData, options);

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }
    };
  }, [isClient, data]);

  if (!isClient) {
    return (
      <main className="w-full h-screen flex items-center justify-center">
        <div className="text-lg">Initializing...</div>
      </main>
    );
  }

  return (
    <main className="w-full h-screen relative">
      <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded-lg shadow-lg">
        <h1 className="font-bold text-lg text-gray-800">Kokoro Graph</h1>
        <p className="text-sm text-gray-600">
          Nodes: {data.nodes.length} | Links: {data.links.length}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Node size = Overall score | Hover for details
        </p>
      </div>
      
      <div 
        ref={networkRef} 
        className="w-full h-full"
        style={{ background: '#fafafa' }}
      />
    </main>
  );
}
