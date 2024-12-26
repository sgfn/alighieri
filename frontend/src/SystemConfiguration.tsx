import { Button, Text, useToast, VStack } from "@chakra-ui/react";
import { useRef } from "react";
import { getConfig, sendConfig, } from "./backendController";


export default function SystemConfiguration() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleExport = async () => {
    let getDevicesPromise = getConfig();
    toast.promise(getDevicesPromise, {
      success: { title: 'export configuration', description: 'configuration downloaded from server', position: 'top' },
      error: { title: 'export configuration', description: 'error while downloading configuration from server', position: 'top' },
      loading: { title: 'export configuration', description: 'downloading configuraion from server', position: 'top' }
    });
    let devices = await getDevicesPromise;
    console.log(devices);
    const a = document.createElement('a');
    a.download = 'dante_config.json';
    const blob = new Blob([JSON.stringify(devices, null, 2)], {
      type: "application/json",
    });
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('import');
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          try {
            const jsonData = JSON.parse(text);
            console.log(jsonData);
            const sendConfigPromise = sendConfig(jsonData);
            toast.promise(sendConfigPromise, {
              success: { title: 'import configuration', description: 'configuration imported succesfully', position: 'top' },
              error: { title: 'import configuration', description: 'error while sending configuration to server', position: 'top' },
              loading: { title: 'import configuration', description: 'sending configuraion to server', position: 'top' }
            });
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };

      reader.readAsText(file);
    }
  };
  return (
    <VStack align='start'>
      <Text fontWeight='semibold'>system configuration</Text>
      <label>
        <input ref={fileInputRef} type='file' style={{ display: 'none' }} onChange={handleImport} />
        <Button w='192px' bg='gray.600' color='gray.50' _hover={{ bg: 'gray.500', color: 'gray.100' }} onClick={() => {
          if (fileInputRef.current !== null) {
            return fileInputRef.current.click();
          }
        }}>import from file</ Button>
      </label>
      <Button w='192px' bg='gray.300' color='gray.900' _hover={{ bg: 'gray.400', color: 'gray.800' }} onClick={handleExport}>export to file</Button>
    </VStack>
  )
}
