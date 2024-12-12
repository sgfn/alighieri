import { useToast, UseToastOptions } from "@chakra-ui/react";

interface ToastParams {
  title: string,
  message: string
}

export function toastSuccessParams({ title, message }: ToastParams): UseToastOptions {
  return ({
    title: title,
    description: message,
    status: 'success',
    duration: 2000,
    isClosable: true
  });
}

export function toastErrorParams({ title, message }: ToastParams): UseToastOptions {
  return ({
    title: title,
    description: message,
    status: 'error',
    duration: 6000,
    isClosable: true
  });
} 
