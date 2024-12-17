import { QuestionIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Text, Tooltip, UnorderedList, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { identifyChannel } from "./backendController";
import { Device } from "./types";

export default function DeviceDetails(device: Device) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast();

    return (
        <>
            <Button onClick={onOpen} variant='outline' borderWidth='2px' borderColor='gray.600' height='30px'>details</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg='gray.50'>
                    <ModalHeader>device details</ModalHeader>
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
                                <Text fontWeight='semibold'>{formatMacAddress(device.macAddress)}</Text>
                            </Flex>
                            <Flex>
                                <Text>sample rate:</Text>
                                <Spacer width='10px' />
                                <Text fontWeight='semibold'>{formatWithSpaces(device.sampleRate)}Hz</Text>
                            </Flex>
                            <Spacer height='20px' />
                            <Box>
                                <Text>channels:</Text>
                                <UnorderedList pl='4'>
                                    <ListItem key={device.id + '/inputs'}>
                                        <Text>inputs:</Text>
                                        <UnorderedList>
                                            {device.channels.transmitters.map((channelName) => inputChannelRow({ channelName: channelName, deviceId: device.id }))}
                                        </UnorderedList>
                                    </ListItem>
                                    <ListItem key={device.id + '/outputs'}>
                                        <Text>outputs:</Text>
                                        <UnorderedList>
                                            {device.channels.receivers.map((channelName) => outputChannelRow({ channelName: channelName, deviceName: device.name, deviceId: device.id, toast: toast }))}
                                        </UnorderedList>
                                    </ListItem>
                                </UnorderedList>
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Spacer />
                        <Button onClick={onClose} bg='gray.300' color='gray.900' _hover={{ bg: 'gray.400', color: 'gray.800' }}>close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
    // {canBeFound && <Button variant='solid' bg='gray.600' color='gray.50' _hover={{ bg: 'gray.500', color: 'gray.100' }} onClick={() => identifyDevice(device.id)}>find device</Button>}
}

interface outputChannelRowProps {
    channelName: string,
    deviceName: string,
    deviceId: number
    toast: any
}

function outputChannelRow({ channelName, deviceName, deviceId, toast }: outputChannelRowProps) {
    const handleIdentify = () => {
        let identifyPromise = identifyChannel({ channelName: channelName, deviceName: deviceName });
        toast.promise(identifyPromise, {
            success: { title: 'identify', description: 'done identifying', position: 'top' },
            error: { title: 'identify', description: 'error while identifying', position: 'top' },
            loading: { title: 'identify', description: 'playing sound', position: 'top' }
        });
    }

    return (
        <ListItem key={deviceId + '/inputs/' + channelName}>
            <Flex alignItems='center'>
                <Text>{channelName}</Text>
                <Spacer width='2' />
                <Tooltip label='identify device'>
                    <QuestionIcon onClick={handleIdentify} />
                </Tooltip>
                {/* <Spacer width='2'/>
                {StatusToIcon(DeviceStatus.Ok)} */}
            </Flex>
        </ListItem>
    )
}

interface inputChannelRowProps {
    channelName: string,
    deviceId: number
}

function inputChannelRow({ channelName, deviceId }: inputChannelRowProps) {
    return (
        <ListItem key={deviceId + '/inputs/' + channelName}>
            <Flex alignItems='center'>
                <Text>{channelName}</Text>
                {/* <Spacer width='2'/>
                {StatusToIcon(DeviceStatus.Ok)} */}
            </Flex>
        </ListItem>
    )
}

function formatMacAddress(input: string): string {
    const macWithColonsRegex = /^([0-9A-Fa-f]{2}[:]){5,7}([0-9A-Fa-f]{2})$/;
    const macWithoutColons6OctetRegex = /^[0-9A-Fa-f]{12}$/;
    const macWithoutColons8OctetRegex = /^[0-9A-Fa-f]{16}$/;

    let formattedInput: string;

    if (macWithoutColons6OctetRegex.test(input)) {
        formattedInput = input.replace(/(.{2})(?=.)/g, '$1:');
    } else if (macWithoutColons8OctetRegex.test(input)) {
        formattedInput = input.replace(/(.{2})(?=.)/g, '$1:');
    } else if (macWithColonsRegex.test(input)) {
        formattedInput = input;
    } else {
        throw new Error('Invalid MAC address format');
    }

    const parts = formattedInput.split(':');

    if (parts.length === 8 && parts[3] === 'ff' && parts[4] === 'fe') {
        const cleanedParts = [...parts.slice(0, 3), ...parts.slice(5)];
        return cleanedParts.join(':');
    }

    return formattedInput;
}

function formatWithSpaces(input: number): string {
    const cleanedInput = input.toString();
    return cleanedInput.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
