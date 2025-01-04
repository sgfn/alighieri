import { Box, Button, useToast } from "@chakra-ui/react";
import { addEdge, Controls, Edge, EdgeChange, MiniMap, Node, NodeChange, ReactFlow, ReactFlowInstance, ReactFlowJsonObject, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import localforage from "localforage";
import React from "react";
import { forwardRef, Ref, useCallback } from "react";
import Frame from "../components/Frame";
import { Device, SimpleSubscription, simpleSubscriptionToJson, Subscription } from "../types";
import { createSubscription, deleteSubscription, } from "../utils/backendController";
import DanteNode from "./DanteNode";
import { getEdgeId, getSimpleSubscriptionFromEdge } from "./utils";

localforage.config({
    name: 'react-flow',
    storeName: 'flows',
});

export interface RoutingViewProps {
    onSubscriptionRemove: (subscription: SimpleSubscription) => void
}

export interface RoutingViewMethods {
    addDevices: (devices: Device[]) => void;
    removeDevices: (deviceIds: number[]) => void;
    addSubscriptions: (subscriptions: Subscription[]) => void;
    removeSubscriptions: (subscriptions: Subscription[]) => void;
}

const RoutingView = forwardRef(({ onSubscriptionRemove: onSubscriptionRemove }: RoutingViewProps, ref: Ref<RoutingViewMethods>) => {

    const addDevices = (newDevices: Device[]) => {
        console.log('add devices:', newDevices)
        const newNodes: NodeChange[] = getNodes(newDevices).map(node => ({ type: 'add', item: node }));
        onNodesChange(newNodes);
    };
    const removeDevices = (deviceIds: number[]) => {
        console.log('remove devices:', deviceIds)
        const toBeRemoved: NodeChange[] = deviceIds.map(id => ({ type: 'remove', id: id.toString() }))
        onNodesChange(toBeRemoved);
    }
    const addSubscriptions = (subscriptions: Subscription[]) => {
        console.log('new subs:', subscriptions);
        const edgesSet = new Set(edges.map(edge => edge.id));
        const newEdges: Edge[] = getEdges(subscriptions).filter(edge => !edgesSet.has(edge.id))
        for (let edge of newEdges) {
            edgesSet.add(edge.id);
        }
        const newEdgesChanges: EdgeChange[] = newEdges.map(edge => ({ type: 'add', item: edge }))
        onEdgesChange(newEdgesChanges);
    };
    const removeSubscriptions = (subscriptions: Subscription[]) => {
        console.log('remove subs:', subscriptions);
        const toBeRemoved: EdgeChange[] = subscriptions.map(subscription => ({ type: 'remove', id: 'xy-edge__' + subscription.transmitter.deviceName + 'tx_' + subscription.transmitter.channelName + '-' + subscription.receiver.deviceName + 'rx_' + subscription.receiver.channelName }));
        onEdgesChange(toBeRemoved);
    };

    React.useImperativeHandle(ref, () => ({ addDevices, removeDevices, addSubscriptions, removeSubscriptions }))

    const toast = useToast();
    const nodeTypes = { danteNode: DanteNode }

    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { setViewport, toObject } = useReactFlow();

    const onConnect = useCallback(
        async (params: any) => {
            setEdges((eds) => addEdge(params, eds));
            let subscriptionPromise = createSubscription({
                receiver: {
                    device_name: params.target,
                    channel_name: params.targetHandle.slice(3)
                },
                transmitter: {
                    device_name: params.source,
                    channel_name: params.sourceHandle.slice(3)
                }
            });
            toast.promise(subscriptionPromise, {
                success: { title: 'routing', description: 'created subscription', position: 'top' },
                error: { title: 'routing', description: 'failed to create subscription', position: 'top' },
                loading: { title: 'routing', description: 'creating subscription', position: 'top' }
            });

            try {
                await subscriptionPromise;
            } catch (error) {
                let edgeId = getEdgeId(params);
                setEdges((eds) => eds.filter((e) => e.id !== edgeId))
            }
        },
        [setEdges, edges, toast],
    );

    async function customOnEdgesChange(changes: any) {
        if (changes[0].type === 'remove') {
            console.log('remove');
            const simpleSubscription = getSimpleSubscriptionFromEdge(edges, changes[0].id);
            if (simpleSubscription === null) {
                console.log('subscriptions does not exist');
                return;
            }
            let deleteSubscriptionPromise = deleteSubscription(simpleSubscriptionToJson(simpleSubscription));
            toast.promise(deleteSubscriptionPromise, {
                success: { title: 'routing', description: 'removed subscription', position: 'top' },
                error: { title: 'routing', description: 'failed to remove subscription', position: 'top' },
                loading: { title: 'routing', description: 'removing subscription', position: 'top' }
            });
            try {
                await deleteSubscriptionPromise;
                onSubscriptionRemove(simpleSubscription);
                onEdgesChange(changes);
            } catch (error) {
                console.log(`couldn't delete edge due to following error: ${error}`);
            }
        } else {
            onEdgesChange(changes);
        }
    }

    const flowKey = 'alighieriGraphState';
    const onSave = useCallback(() => {
        const flow = toObject();
        localforage.setItem(flowKey, flow);
    }, [toObject]);

    const onRestore = useCallback(() => {
        const restoreFlow = async () => {
            const flow: ReactFlowJsonObject | null = await localforage.getItem(flowKey);

            if (flow) {
                const { x, y, zoom } = flow.viewport;

                const currentNodes = toObject().nodes;
                setNodes(getNewNodes(currentNodes, flow.nodes));
                setViewport({ x, y, zoom: zoom || 0 });
            }
        };

        restoreFlow();
    }, [setNodes, setEdges, setViewport]);

    return (
        <Frame>
            <Button onClick={onSave} > save graph </Button>
            <Button onClick={onRestore} > update graph </Button>
            <Box w='778px' h='670px' >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={customOnEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}>
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </Box>
        </Frame >
    )
});

export function getNodes(devices: Device[]): Node[] {
    let y_pos = -64;
    const nodes: Node[] = [];
    devices.forEach((device) => {
        y_pos += 64;
        nodes.push({
            id: device.name,
            position: { x: 0, y: y_pos },
            type: 'danteNode',
            data: { device: device }
        });
    })
    return nodes;
}

export function getEdges(subscriptions: Subscription[]) {
    const edges: Edge[] = [];
    subscriptions.forEach((subscription: Subscription) => (edges.push(
        {
            id: 'xy-edge__' + subscription.transmitter.deviceName + 'tx_' + subscription.transmitter.channelName + '-' + subscription.receiver.deviceName + 'rx_' + subscription.receiver.channelName,
            source: subscription.transmitter.deviceName,
            sourceHandle: 'tx_' + subscription.transmitter.channelName,
            target: subscription.receiver.deviceName,
            targetHandle: 'rx_' + subscription.receiver.channelName,
        })));
    return edges;
}

export function getNewNodes(currentNodes: Node[], savedNodes: Node[]): Node[] {
    for (let currentNode of currentNodes) {
        const savedNode = savedNodes.find(node => node.id === currentNode.id);
        if (savedNode) {
            currentNode.position = savedNode.position;
        }
    }
    console.log('currentNodes', currentNodes);
    return currentNodes;
}

export default RoutingView;
