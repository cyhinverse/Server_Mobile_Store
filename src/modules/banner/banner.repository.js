import BaseRepository from '../../core/repository/base.repository.js';
import Banner from './banner.model.js';

class BannerRepository extends BaseRepository {
	constructor() {
		super(Banner);
	}
}

export default new BannerRepository();
