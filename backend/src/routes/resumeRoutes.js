const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile,saveFile,getResume,getResumeById,getLatestResumesController,summarizeResumeController } = require("../controllers/resumeController");
const { extractResumeData } = require("../services/aiServices");
const { searchResume } = require("../controllers/searchController")
const authMiddleware = require("../middleware/authMiddleware")
const resumeMiddleware = require("../middleware/resumeMiddleware")
const { checkResumeAccess } = require("../middleware/abacMiddleware")

const {hasPermission,checkPermission,checkAnyPermission,checkRole} = require("../middleware/rbacMiddleware")

router.post("/resumes", authMiddleware,checkPermission("resumes:create"),saveFile);
router.post("/resumes/parse", authMiddleware,checkPermission("resumes:create"),resumeMiddleware.single("file"),uploadFile);
router.get("/resumes/latest", authMiddleware, checkPermission("resumes:read:all"), getLatestResumesController);
router.get("/resume/:id", authMiddleware,checkAnyPermission(["resumes:read:own","resumes:read:by"]),checkResumeAccess,getResumeById);
router.get("/resumes",authMiddleware,checkPermission("resumes:read:all"),getResume);
router.get("/resumes/search",authMiddleware,checkPermission("resumes:search"),searchResume);
router.post(
    "/resumes/:id/summarize",
    (req, res, next) => {
        console.log("SUMMARIZE ROUTE HIT:", req.params.id);
        next();
    },
    authMiddleware,
    checkPermission("resumes:search"),
    summarizeResumeController
);

module.exports = router;