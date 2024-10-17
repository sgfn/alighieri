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
                    <Divider/>
                    <Flex>
                        <Text>ip address:</Text>
                        <Spacer width='10px'/>
                        <Text fontWeight='semibold'>{device.ipv4}</Text>
                    </Flex>
                    <Flex>
                        <Text>mac address:</Text>
                        <Spacer width='10px'/>
                        <Text fontWeight='semibold'>{device.macAddress}</Text>
                    </Flex>
                    <Flex>
                        <Text>sample rate:</Text>
                        <Spacer width='10px'/>
                        <Text fontWeight='semibold'>{device.sampleRate}</Text>
                    </Flex>
                    <Spacer height='20px'/>
                    <Box>
                        <Text>channels:</Text>
                        <UnorderedList pl='4'>
                        <ListItem key={device.id + '/inputs'}>
                            <Text>inputs:</Text>
                            <UnorderedList>
                                {device.channels.transmitters.map((channelName, ) => channelRow({channelName: channelName, deviceId: device.id}))}
                            </UnorderedList>
                        </ListItem>
                        <ListItem key={device.id + '/outputs'}>
                            <Text>outputs:</Text>
                            <UnorderedList>
                                {device.channels.receivers.map((channelName) => channelRow({channelName: channelName, deviceId: device.id}))}
                            </UnorderedList>
                            </ListItem>
                        </UnorderedList>
                    </Box>
                </VStack>
            </ModalBody>

            <ModalFooter>
                <Button variant='solid' bg='gray.600' color='gray.50' _hover={{bg: 'gray.500', color: 'gray.100'}}>Find device</Button>
                <Spacer />
                <Button onClick={onClose} bg='gray.300'  color='gray.900' _hover={{bg: 'gray.400', color: 'gray.800' }}>Close</Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}

interface channelRowProps {
    channelName: string,
    deviceId: number
}

function channelRow({channelName, deviceId}: channelRowProps) {
    return(
        <ListItem key={deviceId + '/inputs/' + channelName}>
            <Flex alignItems='center'>
                <Text>{channelName}</Text>
                {/* <Spacer width='2'/>
                {StatusToIcon(DeviceStatus.Ok)} */}
            </Flex>
        </ListItem>
    )
}
