import Container from "./Container.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme.js";

export default function Playground() {
  return (
    <ChakraProvider theme={theme}>
      <Container />
    </ChakraProvider>
  );
}
