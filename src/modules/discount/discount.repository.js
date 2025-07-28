import BaseRepository from '../../core/repository/base.repository.js';
import Discount from './discount.model.js';

class DiscountRepository extends BaseRepository {
	constructor() {
		super(Discount);
	}
}

export default new DiscountRepository();
