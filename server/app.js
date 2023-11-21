import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./modules/router.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(router);

const port = process.env.PORT ?? 3001;
app.listen(port, () => {
    console.log(`Listening on: http://localhost:${port}`);
});
