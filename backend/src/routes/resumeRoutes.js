const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile,saveFile,getResume,getResumeById } = require("../controllers/resumeController");
const { extractResumeData } = require("../services/aiServices");
const { searchResume } = require("../controllers/searchController")
const authMiddleware = require("../middleware/authMiddleware")
const resumeMiddleware = require("../middleware/resumeMiddleware")
const { checkResumeAccess } = require("../middleware/abacMiddleware")

const {hasPermission,checkPermission,checkAnyPermission,checkRole} = require("../middleware/rbacMiddleware")

router.post("/resumes", authMiddleware,checkPermission("resumes:create"),saveFile);
router.post("/resumes/parse", authMiddleware,checkPermission("resumes:create"),resumeMiddleware.single("file"),uploadFile);
router.get("/resume/:id", authMiddleware,checkAnyPermission(["resumes:read:own","resumes:read:by"]),checkResumeAccess,getResumeById);
router.get("/resume",authMiddleware,checkPermission("resumes:read:all"),getResume);
router.get("/resumes/search",authMiddleware,searchResume);


module.exports = router;