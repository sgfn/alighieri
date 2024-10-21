import { Box, Center, Text } from "@chakra-ui/react";
import { ArrowDownIcon } from "@chakra-ui/icons"
import { addEdge, Controls, Edge, Handle, MiniMap, Node, Position, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from "react";
import Frame from "./Frame";
import { Device, deviceFromJson, DeviceJson, Subscription, subscriptionFromJson, SubscriptionJson } from "./types";

const BASE_URL = "http://localhost:4000/";

export default function RoutingView() {
    const nodeTypes = { danteNode: DanteNode }

    const [devices, setDevices] = useState<Device[]>([])

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
                // getEdges(devices);
            } catch (error) {
                console.error("Failed to fetch devices:", error);
            }
        };

        fetchDevices();
    }, []);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await fetch(BASE_URL + 'subscriptions');
                if (!response.ok) {
                    throw new Error('HTTP error! Status: ${response.status}');
                }
                const jsonData = await response.json();
                const subscriptions: Subscription[] = jsonData.subscriptions.map((subscription: SubscriptionJson) => subscriptionFromJson(subscription));
                setEdges(getEdges(subscriptions));
            } catch (error) {
                console.error("failed to fetch subscriptions: ", error);
            }
        }
        fetchSubscriptions();
    }, []);

    const initialNodes: Node[] = getNodes(devices);

    const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: any) => { setEdges((eds) => addEdge(params, eds)); console.log(params) },
        [setEdges],
    );
    return (
        <Frame>
            <Box w='778px' h='670px' >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
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
    subscriptions.forEach((subscription: Subscription) => (edges.push({ id: 'e_' + subscription.transmitter.deviceName + '/' + subscription.transmitter.channelName + '_' + subscription.receiver.deviceName + '/' + subscription.receiver.channelName, source: subscription.transmitter.deviceName, sourceHandle: subscription.transmitter.deviceName + '/' + subscription.receiver.channelName + '_tx', target: subscription.receiver.deviceName, targetHandle: subscription.receiver.deviceName + '/' + subscription.receiver.channelName + '_rx' })));
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
                return (<Handle type="source" position={Position.Bottom} key={data.device.name + "/" + transmitter} id={data.device.name + "/" + transmitter + "_tx"} style={{ left: posChange * bot, backgroundColor: '#2C7A7B', width: '12px', height: '12px' }} >
                    <ArrowDownIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' pointerEvents='none' />
                </Handle>)
            })
            }
            {data.device.channels.receivers.map((receiver: string) => {
                top += 1;
                return (<Handle type="target" position={Position.Top} key={data.device.name + "/" + receiver} id={data.device.name + "/" + receiver + "_rx"} style={{ left: posChange * top, backgroundColor: '#C53030', width: '12px', height: '12px' }}><ArrowDownIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' /></Handle>)
            })
            }
        </>
    );
}

