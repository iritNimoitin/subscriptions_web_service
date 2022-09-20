import express from "express";
import controller from "../controllers/user";
import extractJWT from "../../middleware/extractJWT";

const router = express.Router();

router.get("/validate", extractJWT, controller.validateToken);
router.post("/register", controller.register);
router.post("/update/user", extractJWT, controller.updateUser);
router.post("/login", controller.login);
router.get("/get/all", extractJWT, controller.getAllUsers);
router.delete("/delete/user", extractJWT, controller.deleteUser);

export = router;
