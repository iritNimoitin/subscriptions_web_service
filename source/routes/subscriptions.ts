import express from "express";
import controller from "../controllers/subscriptions";
import extractJWT from "../../middleware/extractJWT";

const router = express.Router();

router.post("/add/member", extractJWT, controller.addMember);
router.post("/update/member", extractJWT, controller.updateMember);

export = router;
