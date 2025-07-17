import { Schema, model } from 'mongoose';

const bannerSchema = new Schema({
	imageUrl: { type: String, required: true },
	title: { type: String },
	linkTo: { type: String },
	position: { type: String, enum: ['homepage', 'category', 'footer'] },
	isActive: { type: Boolean, default: true },
	startDate: Date,
	endDate: Date,
});

const Banner = model('Banner', bannerSchema);
export default Banner;
