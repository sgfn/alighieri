import { Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";


export default function Settings() {
    return (
        <Box>
            <Text fontWeight='semibold'>IP address range configuration</Text>
            <InputField text={'from'} input_placeholder={'255.255.255.255'} />
            <InputField text={'to'} input_placeholder={'255.255.255.255'} />
            <InputField text={'netmask'} input_placeholder={'255.255.255.255'} />
            <Button ml='10px' bg='gray.300' color='gray.900' _hover={{ bg: 'gray.400', color: 'gray.800' }}>update</Button>
            <VStack align='start' mt='24px' pt='16px' borderTop='1px solid' borderColor='gray.300'>
                <Text fontWeight='semibold'>system configuration</Text>
                <Button w='192px' bg='gray.600' color='gray.50' _hover={{ bg: 'gray.500', color: 'gray.100' }}>import from file</Button>
                <Button w='192px' bg='gray.300' color='gray.900' _hover={{ bg: 'gray.400', color: 'gray.800' }}>export to file</Button>
            </VStack>
        </Box>
    )
}

interface InputFieldProps {
    text: string,
    input_placeholder: string
}

function InputField({ text, input_placeholder }: InputFieldProps) {
    return (
        <Flex alignItems='center' m='2' ml='4'>
            <Text width='100px'>{text}</Text>
            <Input placeholder={input_placeholder} width='160px' height='30px' borderWidth='1.5px' borderColor='gray.900' borderRadius='4' />
        </Flex>
    )
}
