import { Schema, model, Types } from 'mongoose';

const promotionSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		description: {
			type: String,
			trim: true,
			maxlength: 500,
		},
		applicableProducts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Product',
			},
		],
		discountPercent: {
			type: Number,
			min: 0,
			max: 100,
		},
		discountAmount: {
			type: Number,
			min: 0,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtual for checking if promotion is currently running
promotionSchema.virtual('isCurrentlyActive').get(function () {
	const now = new Date();
	return this.isActive && this.startDate <= now && this.endDate >= now;
});

// Virtual for promotion status
promotionSchema.virtual('status').get(function () {
	const now = new Date();
	if (!this.isActive) return 'inactive';
	if (this.startDate > now) return 'upcoming';
	if (this.endDate < now) return 'expired';
	return 'active';
});

// Index for better query performance
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ title: 1 });
promotionSchema.index({ applicableProducts: 1 });

// Pre-save validation
promotionSchema.pre('save', function (next) {
	// Ensure only one discount type is set
	if (this.discountPercent && this.discountAmount) {
		return next(
			new Error('Cannot have both discount percent and discount amount')
		);
	}

	// Ensure at least one discount type is set
	if (!this.discountPercent && !this.discountAmount) {
		return next(
			new Error('Either discount percent or discount amount is required')
		);
	}

	// Ensure end date is after start date
	if (this.endDate <= this.startDate) {
		return next(new Error('End date must be after start date'));
	}

	next();
});

const Promotion = model('Promotion', promotionSchema);
export default Promotion;
