import BaseRepository from '../../core/repository/base.repository.js';
import Brand from './brand.model.js';

class BrandRepository extends BaseRepository {
	constructor() {
		super(Brand);
	}
}

export default new BrandRepository();