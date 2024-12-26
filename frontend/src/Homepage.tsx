import { Box, Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import MainPage from "./MainPage";

export default function Homepage() {

    //const [loggedIn, setLoggedIn] = useState<boolean>(false);

    return (
        <Box bg='gray.300'>
            <Grid
                templateAreas={`"header"
                                "content"`}
                gridTemplateRows={'100px 1fr'}
                gridTemplateColumns={'1fr'}
                h='100vh'
                gap='4'
                color='blackAlpha.700'
                fontWeight='bold'
            >
                <GridItem bg='gray.600' area='header' textAlign='left' pl='12' lineHeight='100px'>
                    <HStack>
                        <Text color='gray.50' fontSize='6xl'>alighieri</Text>
                    </HStack>
                </GridItem>
                <GridItem area='content'>
                    <MainPage />
                </GridItem>
            </Grid>
        </Box>
    )
    //<Spacer />
    //<Button mr='8' onClick={() => setLoggedIn(false)}>log out</Button>
    //{ loggedIn ? <MainPage /> : <AuthPage setLoggedIn={setLoggedIn} /> }
}
