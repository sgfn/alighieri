import { CheckCircleIcon, QuestionIcon, WarningIcon } from "@chakra-ui/icons";
import { Flex, Spacer, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DeviceDetails from "./DeviceDetails";
import { Channels, Device, deviceFromJson, DeviceJson } from "./types";

const BASE_URL = "http://localhost:4000/";

export default function DeviceList() {
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
            } catch (error) {
                console.error("Failed to fetch devices:", error);
            }
        };

        fetchDevices();
    }, []);

    return (
        <TableContainer>
            <Table variant='simple' size='sm'>
                <Thead>
                    <Tr>
                        <Th color='gray.900'>Name</Th>
                        <Th color='gray.900'>Inputs/Outputs</Th>
                        <Th color='gray.900'>IP address</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {devices.map((device) => DeviceRow(device))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}


function DeviceRow(device: Device) {
    return (
        <Tr>
            <Td>
                <Flex>
                    <Text>{device.name}</Text>
                    {/* <Spacer/>{StatusToIcon(device.status)} */}
                </Flex>
            </Td>
            <Td><Text>{io(device.channels)}</Text></Td>
            <Td>
                <Flex alignItems='center'>
                    <Text>{device.ipv4}</Text>
                    <Spacer/>
                    {/* <Button variant='outline' borderWidth='2px' borderColor='gray.600' height='30px'>Details</Button> */}
                    <DeviceDetails {...device}/>
                </Flex>
            </Td>
        </Tr>
    )
}

export enum DeviceStatus {
    Ok = "OK",
    Unknown = "UNKNOWN",
    Error = "Error"
}

export function StatusToIcon(status: DeviceStatus) {
    if (status === DeviceStatus.Ok) {
        return(<CheckCircleIcon color='green.400' />)
    } else if (status === DeviceStatus.Error) {
        return(<WarningIcon color='red.400'/>)
    } else {
        return(<QuestionIcon color='blue.400'/>)
    }
}

function io(channels: Channels) {
    return channels.transmitters.length + "/" + channels.receivers.length;
}