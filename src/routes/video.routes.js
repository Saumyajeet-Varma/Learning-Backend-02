import { Router } from "express"
// ! import video.controllers
import { upload } from "../middlewares/multer.middleware.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const videoRouter = Router();

export default videoRouter