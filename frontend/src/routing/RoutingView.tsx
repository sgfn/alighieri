import { Box, Text, Button, useToast, Tooltip } from "@chakra-ui/react";
import { addEdge, Controls, Edge, EdgeChange, MiniMap, Node, NodeChange, ReactFlow, ReactFlowJsonObject, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import localforage from "localforage";
import React from "react";
import { forwardRef, Ref, useCallback } from "react";
import Frame from "../components/Frame";
import SubscriptionEdge from "../SubscriptionEdge";
import { Device, SimpleSubscription, simpleSubscriptionToJson, Subscription } from "../types";
import { createSubscription, deleteSubscription, } from "../utils/backendController";
import DanteNode from "./DanteNode";
import { getEdgeId, getSimpleSubscriptionFromEdge } from "./utils";

localforage.config({
    name: 'react-flow',
    storeName: 'flows',
});

export interface RoutingViewProps {
    onSubscriptionRemove: (subscription: SimpleSubscription) => void,
    onRefresh: () => void
}

export interface RoutingViewMethods {
    addDevices: (devices: Device[]) => void;
    removeDevices: (deviceIds: Device[]) => void;
    addSubscriptions: (subscriptions: Subscription[]) => void;
    removeSubscriptions: (subscriptions: Subscription[]) => void;
}

const RoutingView = forwardRef(({ onSubscriptionRemove, onRefresh }: RoutingViewProps, ref: Ref<RoutingViewMethods>) => {

    const addDevices = (newDevices: Device[]) => {
        console.log('add devices:', newDevices)
        const newNodes: NodeChange[] = getNodes(newDevices).map(node => ({ type: 'add', item: node }));
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
        onNodesChange(newNodes);
    };
    const removeDevices = (oldDevices: Device[]) => {
        console.log('remove devices:', oldDevices)
        const toBeRemoved: NodeChange[] = oldDevices.map(device => ({ type: 'remove', id: device.name }))
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
        onEdgesChange(newEdgesChanges);
    };
    const removeSubscriptions = (subscriptions: Subscription[]) => {
        console.log('remove subs:', subscriptions);
        const toBeRemoved: EdgeChange[] = subscriptions.map(subscription => ({ type: 'remove', id: 'xy-edge__' + subscription.transmitter.deviceName + 'tx_' + subscription.transmitter.channelName + '-' + subscription.receiver.deviceName + 'rx_' + subscription.receiver.channelName }));
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
        onEdgesChange(toBeRemoved);
    };

    React.useImperativeHandle(ref, () => ({ addDevices, removeDevices, addSubscriptions, removeSubscriptions }))

    const toast = useToast();
    const nodeTypes = { danteNode: DanteNode }
    const edgeTypes = { subscriptionEdge: SubscriptionEdge }

    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { setViewport, toObject } = useReactFlow();

    const onConnect = useCallback(
        async (params: any) => {
            const edge = { ...params, type: 'subscriptionEdge' }
            setEdges((eds) => addEdge(edge, eds));
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
            } else {
                toast({
                    title: "couldn't find saved layout",
                    description: 'you need to save layout first, it is stored in browser',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'top'
                })

            }
        };

        restoreFlow();
    }, [setNodes, setEdges, setViewport]);

    return (
        <Frame>
            <Box w='100%' h='100%' >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={customOnEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}>
                    <Controls orientation="horizontal">
                        <Tooltip hasArrow placement='top-end' label='get devices and subscriptions from Dante network'>
                            <Button onClick={onRefresh} p='2' bgColor='white' h='26px'><Text fontSize='xs'> refresh</Text></Button>
                        </Tooltip>
                        <Tooltip hasArrow placement='top-end' label='save nodes layot and viewport in the browser'>
                            <Button onClick={onSave} p='2' bgColor='white' h='26px'><Text fontSize='xs'> save graph </Text></Button>
                        </Tooltip>
                        <Tooltip hasArrow placement='top-end' label='load nodes layout and viewport saved in the browser'>
                            <Button onClick={onRestore} p='2' bgColor='white' h='26px'><Text fontSize='xs'> load graph </Text></Button>
                        </Tooltip>
                    </Controls>
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
            type: 'subscriptionEdge',
            data: { status: subscription.status }
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
