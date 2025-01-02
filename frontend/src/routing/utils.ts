import { Edge } from "@xyflow/react";
import { Device, SimpleSubscriptionJson, Subscription } from "../types";

export function getEdgeId({ source, sourceHandle, target, targetHandle }: any): string {
  return `xy-edge__${source}${sourceHandle || ''}-${target}${targetHandle || ''}`;
}

export function getSimpleSubscriptionJson(edges: Edge[], edgeId: string): SimpleSubscriptionJson | null {
  if (edges === undefined) {
    console.log('undefined');
    return null;
  }
  const properEdge: Edge | undefined = edges.find((edge: Edge) => edge.id === edgeId);
  if (properEdge === undefined) {
    console.log('no edge with id: ' + edgeId + ' in edges: ' + edges);
    return null;
  }

  if (properEdge.sourceHandle === null || properEdge.sourceHandle === undefined) {
    return null;
  }
  if (properEdge.targetHandle === null || properEdge.targetHandle === undefined) {
    return null;
  }
  if (properEdge.sourceHandle.length < 5 || properEdge.targetHandle.length < 5) {
    return null;
  }

  return (
    {
      transmitter: {
        device_name: properEdge.source,
        channel_name: properEdge.sourceHandle.slice(3)
      },
      receiver: {
        device_name: properEdge.target,
        channel_name: properEdge.targetHandle.slice(3)
      }
    })
}

