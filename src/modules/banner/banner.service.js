import Banner from './banner.model.js';

class BannerService {
	constructor() {
		if (!BannerService.instance) return BannerService.instance;
		this.model = Banner;
		BannerService.instance = this;
	}
	async createBanner(data) {
		const {
			imageUrl,
			title,
			type,
			linkTo,
			position,
			isActive,
			startDate,
			endDate,
		} = data;
		if (
			!imageUrl ||
			!title ||
			!linkTo ||
			!position ||
			!isActive ||
			!startDate ||
			!endDate
		) {
			throw new Error('These fields are required.');
		}
		const newBanner = await this.model.create({
			imageUrl,
			title,
			type,
			linkTo,
			position,
			isActive,
			startDate,
			endDate,
		});
		return await newBanner.save();
	}
	async getAllBanners() {
		return await this.model.find();
	}
	async getActiveBanners() {
		return await this.model.find({ isActive: true });
	}
	async updateBanner(id, data) {
		if (!id || !data) {
			throw new Error('These fields are required.');
		}
		return await this.model.findByIdAndUpdate(id, { data }, { new: true });
	}
	async deleteBanner(id) {
		if (!id) {
			throw new Error('Id is required.');
		}
		return await this.model.findByIdAndDelete(id);
	}
	async reorderBanner(bannerIDs) {
		for (let i = 0; i <= bannerIDs.length; i++) {
			let id = bannerIDs[i];
			await this.model.findByIdAndUpdate(id, { position: i + 1 });
		}
	}
}

export default new BannerService();
