import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server is running at : http://localhost:${PORT}`);
});
