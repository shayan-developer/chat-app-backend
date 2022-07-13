import { Router } from "express";
import { setAvatar ,getContacts } from "../controllers/chat.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.post("/setAvatar/:userId",isAuth, setAvatar);
router.get("/contacts",isAuth, getContacts);


export default router;
