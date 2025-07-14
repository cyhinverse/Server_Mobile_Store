import userRouter from '../modules/user/user.route.js';
import authRouter from '../modules/auth/auth.route.js';
import cartRouter from '../modules/cart/cart.controller.js';
import productRouter from '../modules/product/product.route.js';
import wishListRouter from '../modules/wishlist/wishlist.controller.js';
import categoryRouter from '../modules/category/category.controller.js';
import variantRouter from '../modules/variant/variant.route.js';

const routes = (app) => {
	app.use('/api/v1/users', userRouter);
	app.use('/api/v1/auth', authRouter);
	app.use('/api/v1/products', productRouter);
	app.use('/api/v1/variants', variantRouter);
	// app.use('/api/v1/cart', cartRouter);
	// app.use('/api/v1/wishlist', wishListRouter);
	// app.use('/api/v1/categories', categoryRouter);
};

export default routes;
