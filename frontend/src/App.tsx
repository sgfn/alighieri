import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useState } from 'react';
import './App.css';
import AuthPage from './AuthPage';
// import RoutingTable from './RoutingTable';
import Homepage from './Homepage';

function App() {
    const customTheme = extendTheme({
        components: {
            Text: {
                baseStyle: {
                    fontWeight: 'normal',
                    color: 'gray.900'
                }
            },
        },
    });

    return (
        <ChakraProvider theme={customTheme}>
            <Homepage />
        </ChakraProvider>
    );
}

export default App;
