import { Box, Button, Flex, Input, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { setDhcpSettings } from "./backendController";
import { DhcpSettings } from "./types";

export function DHCPSettings() {
  const toast = useToast();
  const [inputsValid, setInputsValid] = useState<boolean>(true);
  const setRemoteDhcpSettings = setDhcpSettings;
  const [localDhcpSettings, setLocalDhcpSettings] = useState<DhcpSettings>({ range_from: '10.0.0.0', range_to: '10.0.0.255', netmask: '255.255.255.0' });
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings: DhcpSettings = {
      ...localDhcpSettings,
      [field]: e.target.value
    };
    setLocalDhcpSettings(newSettings);
    setInputsValid(validateNetmask(newSettings.netmask) && validateIpAddress(newSettings.range_to) && validateIpAddress(newSettings.range_from));
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
        inputPlaceholder={'255.255.255.255'}
        isValid={validateIpAddress(localDhcpSettings.range_from)} />
      <InputField text={'to'}
        value={localDhcpSettings.range_to}
        onChange={handleChange('range_to')}
        inputPlaceholder={'255.255.255.255'}
        isValid={validateIpAddress(localDhcpSettings.range_to)} />
      <InputField text={'netmask'}
        value={localDhcpSettings.netmask}
        onChange={handleChange('netmask')}
        inputPlaceholder={'255.255.255.255'}
        isValid={validateNetmask(localDhcpSettings.netmask)} />
      <Button ml='10px' bg='gray.300' color='gray.900' isDisabled={!inputsValid} _hover={{ bg: 'gray.400', color: 'gray.800' }} onClick={handleSubmit}>update</Button>
    </Box>
  );
}

interface InputFieldProps {
  text: string,
  inputPlaceholder: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  value: string,
  isValid: boolean
}

function InputField({ text, inputPlaceholder, onChange, value, isValid }: InputFieldProps) {
  return (
    <Flex alignItems='center' m='2' ml='4'>
      <Text width='100px'>{text}</Text>
      <Input value={value} onChange={onChange} isInvalid={!isValid} placeholder={inputPlaceholder} width='160px' height='30px' borderWidth='1.5px' borderColor='gray.900' errorBorderColor='#C53030' borderRadius='4' />
    </Flex>
  )
}

function validateIpAddress(address: string): boolean {
  const parts = address.split('.');
  if (parts.length !== 4)
    return false;

  let processedStr = parts.map(part => {
    const number = parseInt(part, 10);
    if (number < 0 || number > 255 || part !== number.toString()) {
      return '#';
    }
    return number.toString();
  });
  return !processedStr.includes('#');
}

function validateNetmask(netmask: string): boolean {
  const parts = netmask.split('.');
  if (parts.length !== 4)
    return false;

  let binaryStr = parts.map(part => {
    const number = parseInt(part, 10);
    if (number < 0 || number > 255 || part !== number.toString())
      return '#';
    return number.toString(2).padStart(8, '0');
  }).join('');

  if (binaryStr.includes('#'))
    return false;

  let firstZeroIdx = binaryStr.indexOf('0');
  let lastOneIdx = binaryStr.lastIndexOf('1');
  return firstZeroIdx > lastOneIdx && firstZeroIdx !== -1;
}
