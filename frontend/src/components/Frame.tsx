import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface FrameProps {
    children: ReactNode
};

const Frame: React.FC<FrameProps> = ({children}: FrameProps) => {
    return (
    <Box bg='gray.50' height='100%' borderRadius='16' borderColor='gray.600' borderWidth='2px' p='4'>
        {children}
    </Box>
    )
}

export default Frame;
