import { Box } from "@chakra-ui/react";
import { DHCPSettings } from "./DHCPSettings";
import SystemConfiguration from "./SystemConfiguration";

export default function Settings() {
    return (
        <Box>
            <DHCPSettings />
            <Box mt='24px' pt='16px' borderTop='1px solid' borderColor='gray.300' />
            <SystemConfiguration />
        </Box>
    )
}
