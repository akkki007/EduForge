export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  php: "8.2.3",
  cpp: "10.2.0",
  c: "10.2.0",
};

export const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello Java");\n\t}\n}\n`,
  php: "<?php\n\n$name = 'Alex';\necho $name;\n",
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\ncout << "Hello C++!" << endl;\nreturn 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\nprintf("Hello C!\\n");\nreturn 0;\n}`,
};
