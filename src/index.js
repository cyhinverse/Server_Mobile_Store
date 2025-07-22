import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/connect.mongodb.js';
import { configCors } from './configs/config.cors.js';
import routes from './routes/index.js';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();
app.use(cors(configCors));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(
	helmet({
		contentSecurityPolicy: true,
		xssFilter: true,
		frameguard: {
			action: 'deny',
		},
		hidePoweredBy: true,
		noSniff: true,
	})
);
app.use(compression());

routes(app);

connectDB(app);
