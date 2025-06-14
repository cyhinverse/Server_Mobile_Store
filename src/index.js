import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/connect.mongodb.js";
import { configCors } from "./configs/config.cors.js";
dotenv.config();



const app = express();
app.use(cors(configCors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



connectDB(app)


