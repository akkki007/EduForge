import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config();
const PORT = process.env.PORT || 7000;

app.get("/", (req, res) => {
  
});

app.listen(PORT, () => {
  console.log(`Server is running at : http://localhost:${PORT}`);
});
