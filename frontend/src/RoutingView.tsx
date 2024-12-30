import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Center, Text, Tooltip, useToast } from "@chakra-ui/react";
import { addEdge, Controls, Edge, Handle, MiniMap, Node, Position, ReactFlow, useEdgesState, useHandleConnections, useNodesState } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from "react";
import { createSubscription, deleteSubscription, getDevices, getSubscriptions } from "./backendController";
import Frame from "./Frame";
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


    const getEdgeId = ({ source, sourceHandle, target, targetHandle }: any): string =>
        `xy-edge__${source}${sourceHandle || ''}-${target}${targetHandle || ''}`;

    const onConnect = useCallback(
        async (params: any) => {
            setEdges((eds) => addEdge(params, eds));
            console.log(`edges`);
            console.log(edges);
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

    return (
        <Frame>
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
                            <DanteHandle type="source" position={Position.Right} key={device.name + "/" + transmitter} id={"tx_" + transmitter} style={{ top: handleMargin + offset * right, width: '12px', height: '12px', borderColor: 'black' }} >
                                <ArrowForwardIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' pointerEvents='none' />
                            </DanteHandle>
                        </Tooltip>
                    )
                })
            }
            {
                device.channels.receivers.map((receiver: string) => {
                    left += 1;
                    return (
                        <Tooltip label={receiver}>
                            <DanteHandle type="target" position={Position.Left} key={device.name + "/" + receiver} id={"rx_" + receiver} style={{ top: handleMargin + offset * left, backgroundColor: '#C53030', width: '12px', height: '12px', borderColor: 'black' }}>
                                <ArrowForwardIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' />
                            </DanteHandle>
                        </Tooltip>
                    )
                })
            }
        </>
    );
}

function DanteHandle(props: any) {
    const connections = useHandleConnections({
        type: props.type,
        id: props.id,
    });

    return (
        <Handle
            {...props}
            isConnectable={connections.length < 1}
        />
    );
};

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

