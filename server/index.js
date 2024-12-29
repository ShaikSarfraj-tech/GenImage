import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./mongodb/connect.js";
import postRoutes from "./routes/postRoutes.js";
import dalleRoutes from "./routes/dalleRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/posts", postRoutes)
app.use("/api/v1/dalle", dalleRoutes)

app.get("/", async (req, res) => {
    res.status(200).send({
        message: "Hello from CodeX",
    });
});

const startServer = async () => {

    try {
        connectToDB(process.env.MONGODB_URL);
        app.listen(8080, () => console.log("Server has started on port http://localhost:8080"));
    } catch (error) {
        console.log(error);
    }
};

startServer();