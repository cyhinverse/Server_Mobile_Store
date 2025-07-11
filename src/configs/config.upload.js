import chalk from 'chalk';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';

dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); // thư mục lưu file tạm
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	},
});
export const upload = multer({ storage });

export const uploadImage = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: chalk.red('No file uploaded'),
			});
		}

		const result = await cloudinary.uploader.upload(req.file.path);
		fs.unlink(req.file.path, (error) => {
			if (error) {
				console.error(chalk.red('Error deleting file:', error));
			}
		});

		return res.status(StatusCodes.OK).json({
			message: chalk.green('Image uploaded successfully'),
			url: result.secure_url,
		});
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: chalk.red(error.message),
		});
	}
};
