import { Box } from "@chakra-ui/react";
import CodeEditor from "./CodeEditor";
import Header from "../Header";
import Header2 from "../Header2";

function Container() {
  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 mt-20 py-12 lg:px-8">
      <Header2/>
      <CodeEditor />
      </div>
    </Box>
  );
}

export default Container;
