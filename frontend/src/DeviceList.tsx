import { CheckCircleIcon, QuestionIcon, WarningIcon } from "@chakra-ui/icons";
import { Flex, Spacer, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import DeviceDetails from "./DeviceDetails";

export type Device = {
    name: string,
    io: string,
    ip: string,
    mac: string,
    sampleRate: string,
    status: DeviceStatus
}

export default function DeviceList() {
    const devices = [
        { name: "DA44AU", io: "4/4", ip: "10.0.0.1", mac:"FF:FF:FF:FF:FF:FF", sampleRate:"192KHz", status: DeviceStatus.Ok },
        { name: "DA11AEN", io: "1/0", ip: "10.0.0.2", mac:"FF:FF:FF:FF:FF:FF", sampleRate:"192KHz", status: DeviceStatus.Error },
        { name: "DA11USB", io: "2/2", ip: "10.0.0.3", mac:"FF:FF:FF:FF:FF:FF", sampleRate:"192KHz", status: DeviceStatus.Ok },
        { name: "ETS630DT", io: "0/1", ip: "10.0.0.4", mac:"FF:FF:FF:FF:FF:FF", sampleRate:"192KHz", status: DeviceStatus.Unknown },
    ];

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
                    <Text>{device.name}</Text><Spacer/>{StatusToIcon(device.status)}
                </Flex>
            </Td>
            <Td><Text>{device.io}</Text></Td>
            <Td>
                <Flex alignItems='center'>
                    <Text>{device.ip}</Text>
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
