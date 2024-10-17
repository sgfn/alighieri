import { Box, Button, Divider, Flex, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Text, UnorderedList, useDisclosure, VStack } from "@chakra-ui/react";
import { Device, DeviceStatus, StatusToIcon } from "./DeviceList";

// interface DeviceDetailsProps {

// }

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
                        <Text fontWeight='semibold'>{device.ip}</Text>
                    </Flex>
                    <Flex>
                        <Text>mac address:</Text>
                        <Spacer width='10px'/>
                        <Text fontWeight='semibold'>{device.mac}</Text>
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
                        <ListItem>
                                <Text>inputs:</Text>
                                <UnorderedList>
                                    <ListItem>
                                        <Flex alignItems='center'>
                                            <Text>CH1</Text>
                                            <Spacer width='2'/>
                                            {StatusToIcon(device.status)}
                                        </Flex>
                                    </ListItem>
                                    <ListItem>
                                        <Flex alignItems='center'>
                                            <Text>CH2</Text>
                                            <Spacer width='2'/>
                                            {StatusToIcon(DeviceStatus.Error)}
                                        </Flex>
                                    </ListItem>
                                    <ListItem>
                                        <Flex alignItems='center'>
                                            <Text>CH3</Text>
                                            <Spacer width='2'/>
                                            {StatusToIcon(DeviceStatus.Unknown)}
                                        </Flex>
                                    </ListItem>
                                    <ListItem>
                                        <Flex alignItems='center'>
                                            <Text>CH4</Text>
                                            <Spacer width='2'/>
                                            {StatusToIcon(device.status)}
                                        </Flex>
                                    </ListItem>
                                </UnorderedList>
                            </ListItem><ListItem>
                                <Text>outputs:</Text>
                                <UnorderedList>
                                    <ListItem>
                                        <Flex alignItems='center'>
                                            <Text>CH1</Text>
                                            <Spacer width='2'/>
                                            {StatusToIcon(DeviceStatus.Ok)}
                                        </Flex>
                                    </ListItem>
                                    <ListItem>
                                        <Flex alignItems='center'>
                                            <Text>CH2</Text>
                                            <Spacer width='2'/>
                                            {StatusToIcon(DeviceStatus.Ok)}
                                        </Flex>
                                    </ListItem>
                                    <ListItem>
                                        <Flex alignItems='center'>
                                            <Text>CH3</Text>
                                            <Spacer width='2'/>
                                            {StatusToIcon(DeviceStatus.Unknown)}
                                        </Flex>
                                    </ListItem>
                                    <ListItem>
                                        <Flex alignItems='center'>
                                            <Text>CH4</Text>
                                            <Spacer width='2'/>
                                            {StatusToIcon(device.status)}
                                        </Flex>
                                    </ListItem>
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
