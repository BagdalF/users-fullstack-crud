import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrUserProfile,
  updateCurrUserProfile,
  deleteUser,
  getUserById,
  updateUserById,
} from "../controllers/userController.js";
import { authenticate, authAdmin } from "../middlewares/authMid.js";

const router = express.Router();

router.route("/").get(authenticate, authAdmin, getAllUsers);
router.post("/register", createUser);
router.post("/auth", loginUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(authenticate, getCurrUserProfile)
  .put(authenticate, updateCurrUserProfile);
router
  .route("/:id")
  .delete(authenticate, authAdmin, deleteUser)
  .get(authenticate, authAdmin, getUserById)
  .put(authenticate, authAdmin, updateUserById);

export default router;
