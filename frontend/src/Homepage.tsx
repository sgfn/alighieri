import { Box, Button, Grid, GridItem, HStack, Spacer, Text } from "@chakra-ui/react";
import { useState } from "react";
import AuthPage from "./AuthPage";
import MainPage from "./MainPage";

export default function Homepage() {
    type NewType = boolean;

    const [loggedIn, setLoggedIn] = useState<NewType>(false);

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
                        <Spacer />
                        {loggedIn ? <Button mr='8' onClick={() => setLoggedIn(false)}>log out</Button> : null}
                    </HStack>
                </GridItem>
                <GridItem area='content'>
                    {loggedIn ? <MainPage /> : <AuthPage setLoggedIn={setLoggedIn} />}
                </GridItem>
            </Grid>
        </Box>
    )
}
