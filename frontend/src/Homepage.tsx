import { Box, Grid, GridItem, Text } from "@chakra-ui/react";
import { useState } from "react";
import AuthPage from "./AuthPage";
import MainPage from "./MainPage";

export default function Homepage() {
    type NewType = boolean;

    const [loggedIn, setLoggedIn] = useState<NewType>(true);

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
                    <Text color='gray.50' fontSize='6xl'>alighieri</Text>
                </GridItem>
                <GridItem area='content'>
                    {loggedIn ? <MainPage /> : <AuthPage setLoggedIn={setLoggedIn} />}
                </GridItem>
            </Grid>
        </Box>
    )
}
