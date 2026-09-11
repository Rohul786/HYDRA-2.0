import { DrainageNodeProperties, DrainagePipeProperties, TidalState } from '@/types';

export interface DrainageGraphNode extends DrainageNodeProperties {
  coordinates: [number, number]; // [lng, lat]
  upstreamPipes: string[];
  downstreamPipes: string[];
}

export interface DrainageGraphEdge extends DrainagePipeProperties {
  coordinates: [number, number][]; // [[lng, lat], [lng, lat]]
}

export interface DrainageNetworkGraph {
  cityId: string;
  nodes: Map<string, DrainageGraphNode>;
  edges: Map<string, DrainageGraphEdge>;
}

/**
 * Creates and initializes a directed hydraulic drainage network graph.
 */
export function createDrainageNetwork(
  cityId: string,
  rawNodes: DrainageGraphNode[],
  rawEdges: DrainageGraphEdge[]
): DrainageNetworkGraph {
  const nodes = new Map<string, DrainageGraphNode>();
  const edges = new Map<string, DrainageGraphEdge>();

  rawNodes.forEach((node) => {
    nodes.set(node.nodeId, {
      ...node,
      upstreamPipes: [],
      downstreamPipes: [],
    });
  });

  rawEdges.forEach((edge) => {
    edges.set(edge.pipeId, { ...edge });
    const from = nodes.get(edge.fromNode);
    if (from) from.downstreamPipes.push(edge.pipeId);
    const to = nodes.get(edge.toNode);
    if (to) to.upstreamPipes.push(edge.pipeId);
  });

  return { cityId, nodes, edges };
}

/**
 * Runs 1D Hydraulic flow routing through the directed drainage graph.
 * Fuses surface runoff inflow with downstream pipe capacities and tidal backwater.
 */
export function solveHydraulicDrainageNetwork(
  network: DrainageNetworkGraph,
  surfaceInflows: Map<string, number>, // nodeId -> surface runoff in L/s
  tidalState: TidalState = 'normal'
): {
  updatedNodes: DrainageGraphNode[];
  updatedEdges: DrainageGraphEdge[];
  totalSurchargeLps: number;
} {
  const updatedNodes: DrainageGraphNode[] = [];
  const updatedEdges: DrainageGraphEdge[] = [];
  let totalSurchargeLps = 0;

  // Tidal backwater reduction factor on coastal outfalls
  const tidalResistance = tidalState === 'high_tide' ? 0.45 : tidalState === 'low_tide' ? 1.05 : 0.85;

  // Topological / forward accumulation
  network.nodes.forEach((node) => {
    const surfaceRunoff = surfaceInflows.get(node.nodeId) || 0;
    
    // Effective capacity adjusted for tidal outfalls
    let effectiveCapacity = node.designCapacityLps;
    if (node.type === 'outfall') {
      effectiveCapacity *= tidalResistance;
    }

    const totalInflow = surfaceRunoff;
    const utilization = (totalInflow / Math.max(1, effectiveCapacity)) * 100;
    
    let status: 'normal' | 'congested' | 'surcharging' = 'normal';
    let backflowLps = 0;

    if (utilization >= 100) {
      status = 'surcharging';
      backflowLps = Math.round(totalInflow - effectiveCapacity);
      totalSurchargeLps += backflowLps;
    } else if (utilization >= 75) {
      status = 'congested';
    }

    const updatedNode: DrainageGraphNode = {
      ...node,
      inflowLps: Math.round(totalInflow),
      capacityUtilization: Math.min(200, Math.round(utilization)),
      status,
      backflowLps,
    };

    updatedNodes.push(updatedNode);
  });

  // Update edges
  network.edges.forEach((edge) => {
    const fromNode = updatedNodes.find((n) => n.nodeId === edge.fromNode);
    const flowThrough = fromNode ? fromNode.inflowLps - fromNode.backflowLps : 0;
    const util = (flowThrough / Math.max(1, edge.hydraulicCapacityLps)) * 100;
    const isChoked = util >= 100 || (fromNode?.status === 'surcharging');

    updatedEdges.push({
      ...edge,
      currentFlowLps: Math.round(flowThrough),
      utilizationPct: Math.min(200, Math.round(util)),
      isChoked,
    });
  });

  return { updatedNodes, updatedEdges, totalSurchargeLps };
}
