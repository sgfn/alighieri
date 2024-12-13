import { Box, Flex, Input, Text } from "@chakra-ui/react";


export default function Settings() {
    return (
        <Box>
            <Text fontWeight='semibold'>IP address range configuration</Text>
            <InputField text={'IP address'} input_placeholder={'255.255.255.255'} />
            <InputField text={'netmask'} input_placeholder={'24'} />
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
