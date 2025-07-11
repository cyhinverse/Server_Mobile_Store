import userRouter from '../modules/user/user.route.js';
import authRouter from '../modules/auth/auth.route.js';
import cartRouter from '../modules/cart/cart.controller.js';
import productRouter from '../modules/product/product.route.js';
import wishListRouter from '../modules/wishlist/wishlist.controller.js';
import categoryRouter from '../modules/category/category.controller.js';

const routes = (app) => {
	app.use('/api/v1/users', userRouter);
	app.use('/api/v1', authRouter);
	app.use('/api/v1/products', productRouter);
};

export default routes;
