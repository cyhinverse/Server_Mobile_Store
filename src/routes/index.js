import userRouter from '../modules/user/user.route.js';
import authRouter from '../modules/auth/auth.route.js';
import cartRouter from '../modules/cart/cart.route.js';
import productRouter from '../modules/product/product.route.js';
import wishListRouter from '../modules/wishlist/wishlist.route.js';
import categoryRouter from '../modules/category/category.route.js';
import promotionRouter from '../modules/Promotion/promotion.route.js';
import brandRouter from '../modules/brand/brand.route.js';
import bannerRouter from '../modules/banner/banner.route.js';
import notificationRouter from '../modules/notification/notification.route.js';
import orderRouter from '../modules/order/order.route.js';
const routes = (app) => {
	app.use('/api/v1/users', userRouter);
	app.use('/api/v1/auth', authRouter);
	app.use('/api/v1/products', productRouter);
	app.use('/api/v1/cart', cartRouter);
	app.use('/api/v1/wishlist', wishListRouter);
	app.use('/api/v1/categories', categoryRouter);
	app.use('/api/v1/promotions', promotionRouter);
	app.use('/api/v1/brands', brandRouter);
	app.use('/api/v1/banners', bannerRouter);
	app.use('/api/v1/notifications', notificationRouter);
	app.use('/api/v1/orders', orderRouter);
};

export default routes;
