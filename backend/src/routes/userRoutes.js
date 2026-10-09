const express = require("express")
const router = express.Router()

const { getMe,updateProfile,changPassword,uploadProfileImage } = require("../controllers/userController")
const authMiddleware = require("../middleware/authMiddleware")
const profileMiddleware = require("../middleware/profileMiddleware")

router.get("/me", authMiddleware, getMe);
router.patch("/me",authMiddleware, updateProfile);
router.patch("/me/password",authMiddleware, changPassword);
router.patch("/me/profile-image",authMiddleware,profileMiddleware.single("file"),uploadProfileImage)

module.exports = router;