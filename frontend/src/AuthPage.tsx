import { Button, Center, Input, InputGroup, InputRightElement, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import Frame from "./components/Frame";
import { toastErrorParams } from "./utils/toaster";

interface AuthPageProps {
  setLoggedIn: (isLoggedIn: boolean) => void
}

export default function AuthPage({ setLoggedIn }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [password, setPassword] = useState<string>();
  const [login, setLogin] = useState<string>();

  const correctLogin = 'login';
  const correctPassword = 'password';

  const toast = useToast();

  const handleLogIn = () => {
    if (login === correctLogin && password === correctPassword) {
      setLoggedIn(true)
    } else {
      toast(toastErrorParams({ title: 'login error', message: 'invalid credentials' }))
    }
  }

  return (
    <Center mt='64px'>
      <Frame>
        <VStack p='8px' w='512px'>
          <Input placeholder='login' variant='outline' borderWidth='2px' borderColor='gray.600' color='gray.600'
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleLogIn();
              }
            }}
          />
          <InputGroup>
            <Input
              pr='4.5rem'
              type={showPassword ? 'text' : 'password'}
              placeholder='password'
              variant='outline' borderWidth='2px' borderColor='gray.600'
              color='gray.600'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleLogIn();
                }
              }}
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' variant='outline' borderWidth='1px' borderColor='gray.600' onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
          <Button mt='8px' color='gray.50' bgColor='gray.600' w='128px' _hover={{ bg: 'gray.500', color: 'gray.100' }} onClick={() => handleLogIn()}>log in</Button>
        </VStack>
      </Frame>
    </Center>
  );
}
