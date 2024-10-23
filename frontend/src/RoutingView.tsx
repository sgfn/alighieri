import { ArrowDownIcon } from "@chakra-ui/icons";
import { Box, Center, Text } from "@chakra-ui/react";
import { addEdge, Controls, Edge, Handle, MiniMap, Node, Position, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from "react";
import Frame from "./Frame";
import { Device, deviceFromJson, DeviceJson, SimpleSubscriptionJson, simpleSubscriptionToJson, Subscription, subscriptionFromJson, SubscriptionJson } from "./types";

const BASE_URL = "http://localhost:4000/";

export default function RoutingView() {
    const nodeTypes = { danteNode: DanteNode }

    const [devices, setDevices] = useState<Device[]>([])
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    const initialNodes: Node[] = getNodes(devices);
    const initialEdges = getEdges(subscriptions);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch(BASE_URL + 'devices');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const jsonData = await response.json();
                const devices: Device[] = jsonData.devices.map((json: DeviceJson) => deviceFromJson(json));
                setDevices(devices);
                setNodes(getNodes(devices));
            } catch (error) {
                console.error("Failed to fetch devices:", error);
            }
        };

        fetchDevices();
    }, []);


    useEffect(() => {
        const fetchSubscriptions = async () => {
            const subs = await getSubscriptions();
            setSubscriptions(subs);
            setEdges(getEdges(subs));
        }
        fetchSubscriptions();
    }, []);


    const onConnect = useCallback(
        (params: any) => {
            setEdges((eds) => addEdge(params, eds));
            console.log('params')
            console.log(params)

            createSubscription({
                receiver: {
                    device_name: params.target,
                    channel_name: params.targetHandle.slice(3)
                },
                transmitter: {
                    device_name: params.source,
                    channel_name: params.sourceHandle.slice(3)
                }
            });

        },
        [setEdges],
    );

    function customOnEdgesChange(changes: any) {
        console.log(edges);
        console.log(changes);
        onEdgesChange(changes)
        const simpleSubscriptionJson = getSimpleSubscriptionJson(edges, changes[0].id);
        if (changes[0].type === 'remove') {
            if (simpleSubscriptionJson === null) {
                console.log('subscriptions does not exist');
                return;
            }
            deleteSubscription(simpleSubscriptionJson);
        }
    }

    return (
        <Frame>
            <Box w='778px' h='670px' >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={customOnEdgesChange}
                    // onEdgesChange={onEdgesChange}
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
            sourceHandle: 'tx_' + subscription.receiver.channelName,
            target: subscription.receiver.deviceName,
            targetHandle: 'rx_' + subscription.receiver.channelName,
            // type: 'smoothstep',
            style: {
                strokeWidth: 2,
            },
        })));
    return edges;
}

function DanteNode({ data }: any) {
    let top = 0;
    let bot = 0;
    const posChange = 20;
    return (
        <>
            <Box border='1px solid black' borderRadius='4px' p='2' minW='64px' bg='white'>
                <Center>
                    <Text>{data.device.name}</Text>
                </Center>
            </Box>
            {data.device.channels.transmitters.map((transmitter: string) => {
                bot += 1;
                return (<Handle type="source" position={Position.Bottom} key={data.device.name + "/" + transmitter} id={"tx_" + transmitter} style={{ left: posChange * bot, backgroundColor: '#2C7A7B', width: '12px', height: '12px' }} >
                    <ArrowDownIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' pointerEvents='none' />
                </Handle>)
            })
            }
            {data.device.channels.receivers.map((receiver: string) => {
                top += 1;
                return (<Handle type="target" position={Position.Top} key={data.device.name + "/" + receiver} id={"rx_" + receiver} style={{ left: posChange * top, backgroundColor: '#C53030', width: '12px', height: '12px' }}><ArrowDownIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' /></Handle>)
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

async function createSubscription(subscriptionJson: SimpleSubscriptionJson) {
    console.log('creating subscription', subscriptionJson);
    console.log(JSON.stringify(subscriptionJson));
    try {
        const response = await fetch(BASE_URL + 'subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriptionJson)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to add subscription", error);
    }
}
async function deleteSubscription(subscriptionJson: SimpleSubscriptionJson) {
    console.log('deleting subscription', subscriptionJson);
    console.log('json', JSON.stringify({ receiver: subscriptionJson.receiver }));
    try {
        const response = await fetch(BASE_URL + 'subscriptions', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ receiver: subscriptionJson.receiver })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to add subscription", error);
    }
}
async function getSubscriptions(): Promise<Subscription[]> {

    try {
        const response = await fetch(BASE_URL + 'subscriptions');
        if (!response.ok) {
            throw new Error('HTTP error! Status: ${response.status}');
        }
        const jsonData = await response.json();
        return jsonData.subscriptions.map((subscription: SubscriptionJson) => subscriptionFromJson(subscription));
    } catch (error) {
        console.error("failed to fetch subscriptions: ", error);
        return []
    }
}
