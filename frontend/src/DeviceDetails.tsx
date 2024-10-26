import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Text, UnorderedList, useDisclosure, VStack } from "@chakra-ui/react";
import { Device } from "./types";

// interface DeviceDetailsProps {}

export default function DeviceDetails(device: Device) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
            <Button onClick={onOpen} variant='outline' borderWidth='2px' borderColor='gray.600' height='30px'>Details</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg='gray.50'>
                    <ModalHeader>Device Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align='start'>
                            <Text fontWeight='bold'>{device.name}</Text>
                            <Divider />
                            <Flex>
                                <Text>ip address:</Text>
                                <Spacer width='10px' />
                                <Text fontWeight='semibold'>{device.ipv4}</Text>
                            </Flex>
                            <Flex>
                                <Text>mac address:</Text>
                                <Spacer width='10px' />
                                <Text fontWeight='semibold'>{device.macAddress}</Text>
                            </Flex>
                            <Flex>
                                <Text>sample rate:</Text>
                                <Spacer width='10px' />
                                <Text fontWeight='semibold'>{`${device.sampleRate} Hz`}</Text>
                            </Flex>
                            <Spacer height='20px' />
                            {deviceChannels(device)}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant='solid' bg='gray.600' color='gray.50' _hover={{ bg: 'gray.500', color: 'gray.100' }}>Find device</Button>
                        <Spacer />
                        <Button onClick={onClose} bg='gray.300' color='gray.900' _hover={{ bg: 'gray.400', color: 'gray.800' }}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

function deviceChannels(device: Device) {
    let receiverMap: Map<string, string[]> = new Map();
    let transmitterMap: Map<string, string[]> = new Map();
    device.channels.receivers.forEach((receiver) => { receiverMap.set(receiver, []) });
    device.channels.transmitters.forEach((transmitter) => { transmitterMap.set(transmitter, []) });
    device.subscriptions.forEach((subsription) => {
        if (subsription.receiver.deviceName === device.name) {
            let record = receiverMap.get(subsription.receiver.channelName);
            if (record !== undefined) {
                record.push(subsription.transmitter.deviceName + '/' + subsription.transmitter.channelName);
            }
        } else if (subsription.transmitter.deviceName === device.name) {
            let record = transmitterMap.get(subsription.transmitter.channelName);
            if (record !== undefined) {
                record.push(subsription.receiver.deviceName + '/' + subsription.receiver.channelName);
            }
        }
    });
    return (

        <Box>
            <Text>channels:</Text>
            <UnorderedList pl='4'>
                <ListItem key={device.id + '/inputs'}>
                    <Text>inputs:</Text>
                    <UnorderedList>
                        {device.channels.transmitters.map((channelName) => channelRow({
                            channelName: channelName,
                            deviceId: device.id,
                            subscriptions: transmitterMap.get(channelName) || [],
                            directionIn: false
                        })
                        )}
                    </UnorderedList>
                </ListItem>
                <ListItem key={device.id + '/outputs'}>
                    <Text>outputs:</Text>
                    <UnorderedList>
                        {device.channels.receivers.map((channelName) => channelRow({
                            channelName: channelName,
                            deviceId: device.id,
                            subscriptions: receiverMap.get(channelName) || [],
                            directionIn: false
                        }))}
                    </UnorderedList>
                </ListItem>
            </UnorderedList>
        </Box>
    )
}

interface channelRowProps {
    channelName: string,
    deviceId: number,
    subscriptions: string[],
    directionIn: boolean

}

function channelRow({ channelName, deviceId, subscriptions, directionIn }: channelRowProps) {
    return (
        <ListItem key={deviceId + '/inputs/' + channelName}>
            <Flex alignItems='center'>
                <Text>{channelName}</Text>
                {directionIn ? <ArrowBackIcon /> : <ArrowForwardIcon />}
                {subscriptions.map((subscription) => { return (<Text>{subscription}</Text>) })}
                {/* <Spacer width='2'/>
                {StatusToIcon(DeviceStatus.Ok)} */}
            </Flex>
        </ListItem>
    )
}

function sumAsciiValues(str: string | undefined) {
    if (str === undefined) {
        return -1;
    }
    let x = str.length;
    let sum = 0;
    for (let i = 0; i < x; i++) {
        sum += str.charCodeAt(i);
    }
    return sum;
}
