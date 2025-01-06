import { Box, Button, useToast } from "@chakra-ui/react";
import { addEdge, Controls, Edge, EdgeChange, MiniMap, Node, NodeChange, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import React from "react";
import { forwardRef, Ref, useCallback, useState } from "react";
import Frame from "../components/Frame";
import { Device, SimpleSubscription, simpleSubscriptionToJson, Subscription } from "../types";
import { createSubscription, deleteSubscription, } from "../utils/backendController";
import DanteNode from "./DanteNode";
import { getEdgeId, getSimpleSubscriptionFromEdge } from "./utils";

export interface RoutingViewProps {
    onSubscriptionRemove: (subscription: SimpleSubscription) => void,
    onRefresh: () => void
}

export interface RoutingViewMethods {
    addDevices: (devices: Device[]) => void;
    removeDevices: (deviceIds: Device[]) => void;
    addSubscriptions: (subscriptions: SimpleSubscription[]) => void;
    removeSubscriptions: (subscriptions: SimpleSubscription[]) => void;
}

const RoutingView = forwardRef(({ onSubscriptionRemove, onRefresh }: RoutingViewProps, ref: Ref<RoutingViewMethods>) => {

    const addDevices = (newDevices: Device[]) => {
        console.log('add devices:', newDevices)
        const newNodes: NodeChange[] = getNodes(newDevices).map(node => ({ type: 'add', item: node }));
        onNodesChange(newNodes);
        let newDeviceStr = "";
        for (let device of newDevices) {
            newDeviceStr = newDeviceStr + device.name + ", "
        }
        newDeviceStr = newDeviceStr.slice(0, -2);
        toast({
            title: 'found new devices',
            description: newDeviceStr,
            position: 'top',
            status: 'info'
        })
    };
    const removeDevices = (oldDevices: Device[]) => {
        console.log('remove devices:', oldDevices)
        const toBeRemoved: NodeChange[] = oldDevices.map(device => ({ type: 'remove', id: device.id.toString() }))
        onNodesChange(toBeRemoved);
        let removedDevicesStr = "";
        for (let device of oldDevices) {
            removedDevicesStr = removedDevicesStr + device.name + ", "
        }
        removedDevicesStr = removedDevicesStr.slice(0, -2);
        toast({
            title: 'removed devices',
            description: removedDevicesStr,
            position: 'top',
            status: 'info'
        })
    }
    const addSubscriptions = (subscriptions: SimpleSubscription[]) => {
        console.log('new subs:', subscriptions);
        const edgesSet = new Set(edges.map(edge => edge.id));
        const newEdges: Edge[] = getEdges(subscriptions).filter(edge => !edgesSet.has(edge.id))
        for (let edge of newEdges) {
            edgesSet.add(edge.id);
        }
        const newEdgesChanges: EdgeChange[] = newEdges.map(edge => ({ type: 'add', item: edge }))
        onEdgesChange(newEdgesChanges);
        let newSubscriptionsStr = "";
        for (let subscription of subscriptions) {
            newSubscriptionsStr = newSubscriptionsStr + `${subscription.transmitter.deviceName}/${subscription.transmitter.channelName} -> ${subscription.receiver.deviceName}/${subscription.receiver.channelName}, `;
        }
        newSubscriptionsStr = newSubscriptionsStr.slice(0, -2);
        toast({
            title: 'found new subscriptions',
            description: newSubscriptionsStr,
            position: 'top',
            status: 'info'
        })
    };
    const removeSubscriptions = (subscriptions: SimpleSubscription[]) => {
        console.log('remove subs:', subscriptions);
        const toBeRemoved: EdgeChange[] = subscriptions.map(subscription => ({ type: 'remove', id: 'xy-edge__' + subscription.transmitter.deviceName + 'tx_' + subscription.transmitter.channelName + '-' + subscription.receiver.deviceName + 'rx_' + subscription.receiver.channelName }));
        onEdgesChange(toBeRemoved);
        let oldSubscriptionsStr = "";
        for (let subscription of subscriptions) {
            oldSubscriptionsStr = oldSubscriptionsStr + `${subscription.transmitter.deviceName}/${subscription.transmitter.channelName} -> ${subscription.receiver.deviceName}/${subscription.receiver.channelName}, `;
        }
        oldSubscriptionsStr = oldSubscriptionsStr.slice(0, -2);
        toast({
            title: 'removed subscriptions',
            description: oldSubscriptionsStr,
            position: 'top',
            status: 'info'
        })
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
            <Button onClick={onRefresh} > refresh </Button>
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
            id: device.name,
            position: { x: 0, y: y_pos },
            type: 'danteNode',
            data: { device: device }
        });
    })
    return nodes;
}

export function getEdges(subscriptions: SimpleSubscription[]) {
    const edges: Edge[] = [];
    subscriptions.forEach((subscription: SimpleSubscription) => (edges.push(
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
