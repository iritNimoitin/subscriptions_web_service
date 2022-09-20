import express from "express";
import controller from "../controllers/movie";
import extractJWT from "../../middleware/extractJWT";

const router = express.Router();

router.get("/get/all", extractJWT, controller.getAllMovies);
router.post("/add/movie", extractJWT, controller.addMovie);
router.post("/update/movie", extractJWT, controller.updateMovie);
router.delete("/delete/movie", extractJWT, controller.deleteMovie);

export = router;
