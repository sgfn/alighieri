import { Box, Grid, GridItem, Text } from "@chakra-ui/react";
import InfoView from "./InfoView";
import RoutingView from "./RoutingView";

export default function Homepage() {
    return(
        <Box bg='gray.300'>
            <Grid
            templateAreas={`"header header"
                            "routing info"`}
            gridTemplateRows={'100px 1fr'}
            gridTemplateColumns={'55% 1fr'}
            h='100vh'
            gap='4'
            color='blackAlpha.700'
            fontWeight='bold'
            >
                <GridItem bg='gray.600' area={'header'} textAlign='left' pl='12' lineHeight='100px'>
                    <Text color='gray.50' fontSize='6xl'>alighieri</Text>
                </GridItem>
                <GridItem area={'routing'} ml='4' mb='4'>
                    <RoutingView />
                </GridItem>
                <GridItem area={'info'} mr='4' mb='4'>
                    <InfoView />
                </GridItem>
            </Grid>
        </Box>
    )
}
