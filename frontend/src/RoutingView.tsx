import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Center, Text, Tooltip, useToast, UseToastOptions } from "@chakra-ui/react";
import { addEdge, Controls, Edge, Handle, MiniMap, Node, Position, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from "react";
import { createSubscription, deleteSubscription, getDevices, getSubscriptions } from "./backendController";
import Frame from "./Frame";
import * as toaster from "./toaster";
import { Device, SimpleSubscriptionJson, Subscription } from "./types";


export default function RoutingView() {
    const toast = useToast();
    const nodeTypes = { danteNode: DanteNode }

    const [devices, setDevices] = useState<Device[]>([])
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    const initialNodes: Node[] = getNodes(devices);
    const initialEdges = getEdges(subscriptions);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        const fetchDevices = async () => {
            const devices = await getDevices();
            setDevices(devices);
            setNodes(getNodes(devices));
        };
        fetchDevices();
    }, [setNodes]);


    useEffect(() => {
        const fetchSubscriptions = async () => {
            const subs = await getSubscriptions();
            setSubscriptions(subs);
            setEdges(getEdges(subs));
        }
        fetchSubscriptions();
    }, [setEdges]);


    const onConnect = useCallback(
        async (params: any) => {
            try {
                let response = await createSubscription({
                    receiver: {
                        device_name: params.target,
                        channel_name: params.targetHandle.slice(3)
                    },
                    transmitter: {
                        device_name: params.source,
                        channel_name: params.sourceHandle.slice(3)
                    }
                });
                setEdges((eds) => addEdge(params, eds));
                toast(toastSuccess(`Subscription created successfully: ${response}`));
            } catch (error) {
                toast(toastError(`Couldn't create subscription: ${error}`));
            }
        },
        [setEdges, toast],
    );

    async function customOnEdgesChange(changes: any) {
        console.log(edges);
        console.log(changes);
        onEdgesChange(changes)
        const simpleSubscriptionJson = getSimpleSubscriptionJson(edges, changes[0].id);
        if (changes[0].type === 'remove') {
            if (simpleSubscriptionJson === null) {
                console.log('subscriptions does not exist');
                return;
            }
            try {
                let response = await deleteSubscription(simpleSubscriptionJson);
                toast(toastSuccess(`Subscription deleted successfully: ${response}`));
            } catch (error) {
                toast(toastError(`Couldn't delete subscription: ${error}`));
            }
        }
    }

    return (
        <Frame>
            <Box w='100%' h='100%'>
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
}


export function getNodes(devices: Device[]): Node[] {
    let y_pos = -64;
    const nodes: Node[] = [];
    devices.forEach((device) => {
        y_pos += 64;
        nodes.push({ id: device.name, position: { x: 0, y: y_pos }, type: 'danteNode', data: { device: device } });
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
            // type: 'smoothstep',
        })));
    return edges;
}

function DanteNode({ data }: any) {
    let right = -1;
    let left = -1;
    const device: Device = data.device;
    const handleMargin: number = 16;
    const offset: number = 20;
    const height = (Math.max(device.channels.transmitters.length, device.channels.receivers.length) - 1) * offset + 2 * handleMargin;
    return (
        <>
            <Center border='1px solid black' borderRadius='8px' p='2' minW='64px' bg='gray.300' h={`${height}px`} >
                <Center>
                    <Text>{device.name}</Text>
                </Center>
            </Center>
            {
                device.channels.transmitters.map((transmitter: string) => {
                    right += 1;
                    return (
                        <Tooltip label={transmitter}>
                            <Handle type="source" position={Position.Right} key={device.name + "/" + transmitter} id={"tx_" + transmitter} style={{ top: handleMargin + offset * right, width: '12px', height: '12px', borderColor: 'black' }} >
                                <ArrowForwardIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' pointerEvents='none' />
                            </Handle>
                        </Tooltip>
                    )
                })
            }
            {
                device.channels.receivers.map((receiver: string) => {
                    left += 1;
                    return (
                        <Tooltip label={receiver}>
                            <Handle type="target" position={Position.Left} key={device.name + "/" + receiver} id={"rx_" + receiver} style={{ top: handleMargin + offset * left, backgroundColor: '#C53030', width: '12px', height: '12px', borderColor: 'black' }}>
                                <ArrowForwardIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' />
                            </Handle>
                        </Tooltip>
                    )
                })
            }
        </>
    );
}

function getSimpleSubscriptionJson(edges: Edge[], edgeId: string): SimpleSubscriptionJson | null {
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

function toastSuccess(message: string): UseToastOptions {
    return toaster.toastSuccessParams({
        title: 'routing success',
        message: message
    })
}

function toastError(message: string): UseToastOptions {
    return toaster.toastErrorParams({
        title: 'routing error',
        message: message
    })
}
