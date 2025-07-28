import BaseRepository from '../../core/repository/base.repository.js';
import Category from './category.model.js';
import { getPaginationMeta } from '../../shared/response/pagination.js';

class CategoryRepository extends BaseRepository {
	constructor() {
		super(Category);
	}

	/**
	 * Find category by slug
	 */
	async findBySlug(slug) {
		return await this.model.findOne({ slug }).lean();
	}

	/**
	 * Check if slug exists (excluding current category for updates)
	 */
	async isSlugExists(slug, excludeId = null) {
		const query = { slug };
		if (excludeId) {
			query._id = { $ne: excludeId };
		}
		const category = await this.model.findOne(query).lean();
		return !!category;
	}

	/**
	 * Get categories with pagination and search
	 */
	async findWithPagination(page = 1, limit = 10, search = '') {
		const query = search ? { name: { $regex: search, $options: 'i' } } : {};
		const skip = (page - 1) * limit;

		const categories = await this.model
			.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await this.model.countDocuments(query);

		return {
			categories,
			total,
			...getPaginationMeta(page, limit, total),
		};
	}

	/**
	 * Get category tree structure
	 */
	async getCategoryTree() {
		return await this.model.aggregate([
			{ $match: { parentId: null } },
			{
				$lookup: {
					from: 'categories',
					localField: '_id',
					foreignField: 'parentId',
					as: 'children',
				},
			},
			{
				$addFields: {
					children: {
						$map: {
							input: '$children',
							as: 'child',
							in: {
								_id: '$$child._id',
								name: '$$child.name',
								slug: '$$child.slug',
								description: '$$child.description',
								parentId: '$$child.parentId',
								createdAt: '$$child.createdAt',
								updatedAt: '$$child.updatedAt',
							},
						},
					},
				},
			},
		]);
	}

	/**
	 * Get children categories by parent ID
	 */
	async findChildrenByParentId(parentId) {
		return await this.model.find({ parentId }).sort({ name: 1 }).lean();
	}

	/**
	 * Update children categories when parent is deleted
	 */
	async updateChildrenParent(parentId, newParentId = null) {
		return await this.model.updateMany({ parentId }, { parentId: newParentId });
	}

	/**
	 * Count categories by parent
	 */
	async countByParent(parentId = null) {
		return await this.model.countDocuments({ parentId });
	}

	/**
	 * Find categories by parent ID with pagination
	 */
	async findByParentWithPagination(parentId, page = 1, limit = 10) {
		const skip = (page - 1) * limit;

		const categories = await this.model
			.find({ parentId })
			.sort({ name: 1 })
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await this.model.countDocuments({ parentId });

		return {
			categories,
			total,
			...getPaginationMeta(page, limit, total),
		};
	}
}

export default new CategoryRepository();
