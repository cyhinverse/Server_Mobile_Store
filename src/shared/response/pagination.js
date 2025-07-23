/**
 * Trả về meta cho pagination
 * @param {number} page
 * @param {number} pageSize
 * @param {number} totalItems
 */
export const getPaginationMeta = (page = 1, pageSize = 10, totalItems = 0) => {
	const totalPages = Math.ceil(totalItems / pageSize);

	return {
		page,
		pageSize,
		totalItems,
		totalPages,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
	};
};
