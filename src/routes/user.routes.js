import { Router } from "express"
import registerUser from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const userRouter = Router();

// http://localhost:8000/api/v1/user/register
userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar", // This should be same in Frontend (name of the input)
            maxCount: 1,
        },
        {
            name: "coverImage", // This should be same in Frontend (name of the input)
            maxCount: 1,
        }
    ]),
    registerUser
)

export default userRouter