import userRouter from '../modules/user/user.route.js';
import authRouter from '../modules/auth/auth.route.js';

const routes = (app) => {
	app.use('/api/v1/users', userRouter);
	app.use('/api/v1', authRouter);
};

export default routes;
