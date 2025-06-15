import userRouter from "./user.route.js";
import authRouter from "./auth.route.js"



const routes = (app) => {
    app.use("/api/v1/users", userRouter);
    app.use("/api/v1", authRouter);

}

export default routes;