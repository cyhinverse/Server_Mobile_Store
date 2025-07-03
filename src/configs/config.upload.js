import chalk from 'chalk';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
export const upload = multer({ storage });

(async function (req, res) {
	if (!req.file) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: chalk.red('No file uploaded'),
		});
	}
	const uploadImage = cloudinary.uploader
		.upload(req.file.path)
		.catch((error) => {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: chalk.red(error.message),
			});
		});
	if (!uploadImage) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: chalk.red('Failed to upload image'),
		});
	}
	fs.unlinkSync(req.file.path, (error) => {
		if (error) {
			console.error(chalk.red('Error deleting file:', error));
		} else {
			console.log(chalk.green('File deleted successfully'));
		}
	});
	return res.status(StatusCodes.OK).json({
		message: chalk.green('Image uploaded successfully'),
		url: uploadImage.secure_url,
	});
})();
