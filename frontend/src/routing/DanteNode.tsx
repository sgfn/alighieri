import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Center, Tooltip, Text } from "@chakra-ui/react";
import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { Device } from "../types";

export default function DanteNode({ data }: any) {
    let right: number = -1; let left: number = -1;
    const device: Device = data.device;
    const handleMargin: number = 16;
    const offset: number = 20;
    const height = (Math.max(device.channels.transmitters.length, device.channels.receivers.length) - 1) * offset + 2 * handleMargin;
    return (
        <>
            <Center border='1px solid black' borderRadius='8px' p='2' minW='64px' bg='gray.300' h={`${height}px`} >
                <Text>{device.name}</Text>
            </Center>
            {device.channels.transmitters.map((transmitter: string) => {
                right += 1;
                return (
                    <DanteHandle label={transmitter} type="source" position={Position.Right} key={device.name + "/" + transmitter} id={"tx_" + transmitter} style={{ top: handleMargin + offset * right, width: '12px', height: '12px', borderColor: 'black' }} >
                    </DanteHandle>
                )
            })}
            {device.channels.receivers.map((receiver: string) => {
                left += 1;
                return (
                    <DanteHandle label={receiver} type="target" position={Position.Left} key={device.name + "/" + receiver} id={"rx_" + receiver} style={{ top: handleMargin + offset * left, backgroundColor: ' #C53030', width: '12px', height: '12px', borderColor: 'black' }}>
                    </DanteHandle>
                )
            })}
        </>
    );
}

function DanteHandle(props: any) {
    const connections = useHandleConnections({
        type: props.type,
        id: props.id,
    });

    return (
        <Handle {...props} isConnectable={connections.length < 1} >
            <Tooltip label={props['label']} hasArrow placement='top'>
                <ArrowForwardIcon w='10px' h='10px' color='white' top='-8.5px' position='relative' />
            </Tooltip>
        </Handle>
    );
};
