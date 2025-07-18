import { Schema, model } from 'mongoose';

const bannerSchema = new Schema({
	title: { type: String },
	imageUrl: { type: String, required: true },

	linkTo: { type: String },

	type: {
		type: String,
		enum: ['homepage', 'category', 'promotion', 'product'],
		default: 'homepage',
	},

	isActive: { type: Boolean, default: true },
	position: { type: Number, default: 0 },
	startDate: { type: Date },
	endDate: { type: Date },
},
	{ timestamps: true, collection: 'banners' });

const Banner = model('Banner', bannerSchema);
export default Banner;
