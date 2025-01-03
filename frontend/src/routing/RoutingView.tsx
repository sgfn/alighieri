import { Box, Button, useToast } from "@chakra-ui/react";
import { addEdge, Controls, Edge, EdgeChange, MiniMap, Node, NodeChange, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import React, { RefObject } from "react";
import { forwardRef, Ref, useCallback, useEffect, useState } from "react";
import Frame from "../components/Frame";
import { Device, Subscription } from "../types";
import { createSubscription, deleteSubscription, getDevices, getSubscriptions } from "../utils/backendController";
import DanteNode from "./DanteNode";
import { getEdgeId, getSimpleSubscriptionJson } from "./utils";


interface RoutingViewProps {
    devices: Device[],
    subscriptions: Subscription[]
}

export interface RoutingViewMethods {
    addDevices: (devices: Device[]) => void;
    removeDevices: (deviceIds: number[]) => void;
    addSubscriptions: (subscriptions: Subscription[]) => void;
    removeSubscriptions: (subscriptions: Subscription[]) => void;
}

const RoutingView = forwardRef((_props, ref: Ref<RoutingViewMethods>) => {

    const addDevices = (newDevices: Device[]) => {
        //console.log('add devices:', newDevices)
        const newNodes: NodeChange[] = getNodes(newDevices).map(node => ({ type: 'add', item: node }));
        onNodesChange(newNodes);
    };
    const removeDevices = (deviceIds: number[]) => {
        //console.log('remove devices:', deviceIds)
        const toBeRemoved: NodeChange[] = deviceIds.map(id => ({ type: 'remove', id: id.toString() }))
        onNodesChange(toBeRemoved);
    }
    const addSubscriptions = (subscriptions: Subscription[]) => {
        //console.log('new subs:', subscriptions);
        const newEdges: EdgeChange[] = getEdges(subscriptions).map(edge => ({ type: 'add', item: edge }))
        onEdgesChange(newEdges);
    };
    const removeSubscriptions = (subscriptions: Subscription[]) => {
        //console.log('remove subs:', subscriptions);
        const toBeRemoved: EdgeChange[] = subscriptions.map(subscription => ({ type: 'remove', id: 'xy-edge__' + subscription.transmitter.deviceName + 'tx_' + subscription.transmitter.channelName + '-' + subscription.receiver.deviceName + 'rx_' + subscription.receiver.channelName }));
        onEdgesChange(toBeRemoved);
    };

    React.useImperativeHandle(ref, () => ({ addDevices, removeDevices, addSubscriptions, removeSubscriptions }))

    const toast = useToast();
    const nodeTypes = { danteNode: DanteNode }

    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = useState<any>(null);

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
        const simpleSubscriptionJson = getSimpleSubscriptionJson(edges, changes[0].id);
        if (changes[0].type === 'remove') {
            if (simpleSubscriptionJson === null) {
                console.log('subscriptions does not exist');
                return;
            }
            let deleteSubscriptionPromise = deleteSubscription(simpleSubscriptionJson);
            toast.promise(deleteSubscriptionPromise, {
                success: { title: 'routing', description: 'removed subscription', position: 'top' },
                error: { title: 'routing', description: 'failed to remove subscription', position: 'top' },
                loading: { title: 'routing', description: 'removing subscription', position: 'top' }
            });
            try {
                await deleteSubscriptionPromise;
            } catch (error) {
                console.log(`couldn't delete edge due to following error: ${error}`);
            }
        }
        onEdgesChange(changes)
    }

    const onRoutingGraphSave = useCallback(() => {
        console.log('done');
        if (rfInstance) {
            const flow = rfInstance.toObject();
            localStorage.setItem('flowKey', JSON.stringify(flow));
        }
    }, [rfInstance]);

    return (
        <Frame>
            <Button onClick={onRoutingGraphSave} > save graph </Button>
            <Box w='778px' h='670px' >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={customOnEdgesChange}
                    onConnect={onConnect}
                    onInit={setRfInstance}
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
            id: device.id.toString(),
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

export default RoutingView;
