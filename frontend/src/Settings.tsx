import { Box, Button, Flex, Input, Text, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { setDhcpSettings } from "./backendController";
import { DhcpSettings } from "./types";


export default function Settings() {
    const toast = useToast();
    const setRemoteDhcpSettings = setDhcpSettings;
    const [localDhcpSettings, setLocalDhcpSettings] = useState<DhcpSettings>({ range_from: '10.0.0.0', range_to: '10.0.0.255', netmask: '255.255.255.0' });
    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalDhcpSettings({
            ...localDhcpSettings,
            [field]: e.target.value
        });
    };

    const handleSubmit = () => {
        console.log('submit dhcp settings');
        let setDhcpPromise = setRemoteDhcpSettings(localDhcpSettings);
        toast.promise(setDhcpPromise, {
            success: { title: 'dhcp settings', description: 'dhcp settings updated', position: 'top' },
            error: { title: 'dhcp settings', description: 'couldn\'t update dhcp settings', position: 'top' },
            loading: { title: 'dhcp settings', description: 'updating dhcp settings', position: 'top' },
        })
    }
    return (
        <Box>
            <Text fontWeight='semibold'>IP address range configuration</Text>
            <InputField text={'from'}
                value={localDhcpSettings.range_from}
                onChange={handleChange('range_from')}
                input_placeholder={'255.255.255.255'} />
            <InputField text={'to'}
                value={localDhcpSettings.range_to}
                onChange={handleChange('range_to')}
                input_placeholder={'255.255.255.255'} />
            <InputField text={'netmask'}
                value={localDhcpSettings.netmask}
                onChange={handleChange('netmask')}
                input_placeholder={'255.255.255.255'} />
            <Button ml='10px' bg='gray.300' color='gray.900' _hover={{ bg: 'gray.400', color: 'gray.800' }} onClick={handleSubmit}>update</Button>
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
    input_placeholder: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    value: string
}

function InputField({ text, input_placeholder, onChange, value }: InputFieldProps) {
    return (
        <Flex alignItems='center' m='2' ml='4'>
            <Text width='100px'>{text}</Text>
            <Input value={value} onChange={onChange} placeholder={input_placeholder} width='160px' height='30px' borderWidth='1.5px' borderColor='gray.900' borderRadius='4' />
        </Flex>
    )
}
