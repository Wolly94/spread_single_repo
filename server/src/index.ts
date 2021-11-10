import dotenv from "dotenv";
import { createAndStartServer } from "./app";

dotenv.config();

// const allowedOrigins = ["http://3.12.88.207", "*"];

// const options: cors.CorsOptions = {
//    origin: allowedOrigins,
// };
// app.use(cors(options))

const parseIntOrThrow = (envVar: string | undefined): number => {
    return parseInt(envVar || "", undefined);
};

const app = createAndStartServer(
    parseIntOrThrow(process.env.PORT),
    parseIntOrThrow(process.env.PORT_RANGE_LOWER_BOUND),
    parseIntOrThrow(process.env.PORT_RANGE_LOWER_BOUND) + 1,
    parseIntOrThrow(process.env.PORT_RANGE_UPPER_BOUND)
);
