import { Box, Button, useToast } from "@chakra-ui/react";
import { addEdge, Controls, Edge, MiniMap, Node, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
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
    testFn: (text: string) => void
}

const RoutingView = forwardRef((props: { baseInfo: string }, ref: Ref<RoutingViewMethods>) => {

    const [info, setInfo] = useState<string>(props.baseInfo);
    const testFn = (text: string) => {
        setInfo(text);
    }
    React.useImperativeHandle(ref, () => ({ testFn }))

    const toast = useToast();
    const nodeTypes = { danteNode: DanteNode }

    const [devices, setDevices] = useState<Device[]>([])
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    const initialNodes: Node[] = getNodes(devices);
    const initialEdges = getEdges(subscriptions);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = useState<any>(null);

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
            <Box>{info}</Box>
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

export default RoutingView;
