import BaseRepository from '../../core/repository/base.repository';
import CategoryModel from './category.model.js';

class CategoryRepository extends BaseRepository {
	constructor() {
		super(CategoryModel);
		if (!CategoryRepository.instance) return CategoryRepository.instance;
		CategoryRepository.instance = this;
	}
}

export default new CategoryRepository();
