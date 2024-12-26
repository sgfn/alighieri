import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { DHCPSettings } from "./DHCPSettings";

export default function Settings() {
    return (
        <Box>
            <DHCPSettings />
            <VStack align='start' mt='24px' pt='16px' borderTop='1px solid' borderColor='gray.300'>
                <Text fontWeight='semibold'>system configuration</Text>
                <Button w='192px' bg='gray.600' color='gray.50' _hover={{ bg: 'gray.500', color: 'gray.100' }}>import from file</Button>
                <Button w='192px' bg='gray.300' color='gray.900' _hover={{ bg: 'gray.400', color: 'gray.800' }}>export to file</Button>
            </VStack>
        </Box>
    )
}
