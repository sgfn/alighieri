import { Box, Center, Text } from "@chakra-ui/react";
import { addEdge, Controls, Handle, MiniMap, Node, Position, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from "react";
import Frame from "./Frame";
import { Device, deviceFromJson, DeviceJson } from "./types";

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
            } catch (error) {
                console.error("Failed to fetch devices:", error);
            }
        };

        fetchDevices();
    }, []);

    const initialNodes: Node[] = getNodes(devices);

    const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );
    return (
        <Frame>
            <Box>
                <div style={{ width: '778px', height: '670px', border: '1px solid red' }}>
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
                </div>
            </Box>
        </Frame>
    )
}

export function getNodes(devices: Device[]): Node[] {
    let y_pos = -64;
    const nodes: Node[] = [];
    devices.forEach((device) =>  {
        y_pos += 64;
        nodes.push({id: device.id.toString(), position: { x: 0, y: y_pos }, type: 'danteNode', data: { device: device } });
    })
    return nodes;
}

export function getEdges(devices: Device[]) {

}

function DanteNode({data}: any) {
    let top = 0;
    let bot = 0;
    return (
      <>
        <Box border='1px solid black' borderRadius='4px' p='2' minW='64px' bg='white'>
          <Center>
            <Text>{data.device.name}</Text>
          </Center>
        </Box>
        {data.device.channels.transmitters.map((transmitter: string) => {
            bot += 1;
            return (<Handle type="source" position={Position.Bottom} key={data.device.id + "/" + transmitter} id={data.device.id + "/" + transmitter} style={{left: 10 * bot}}/>)
            })
        }
        {data.device.channels.receivers.map((receiver: string) => {
            top += 1;
            return (<Handle type="target" position={Position.Top} key={data.device.id + "/" + receiver} id={data.device.id + "/" + receiver} style={{left: 10 * top}}/>)
            })
        }
      </>
    );
}
