const express = require("express");
const router = express.Router();
const {
    uploadFile,
    saveFile,
    getResume,
    getResumeById,
    getLatestResumesController,
    summarizeResumeController,
    getMyResumesController,
    getMyResumeByIdController,
    updateMyResumeController,
    updateMyResumeStatusController,
    deleteMyResumeController,
} = require("../controllers/resumeController");
const { searchResume } = require("../controllers/searchController");
const authMiddleware = require("../middleware/authMiddleware");
const resumeMiddleware = require("../middleware/resumeMiddleware");
const { checkResumeAccess } = require("../middleware/abacMiddleware");
const {
    checkPermission,
    checkAnyPermission,
} = require("../middleware/rbacMiddleware");

router.post(
    "/resumes",
    authMiddleware,
    checkPermission("resumes:create"),
    saveFile
);
router.post(
    "/resumes/parse",
    authMiddleware,
    checkPermission("resumes:create"),
    resumeMiddleware.single("file"),
    uploadFile
);
router.get(
    "/resumes/latest",
    authMiddleware,
    checkPermission("resumes:read:all"),
    getLatestResumesController
);
router.get(
    "/resumes/my",
    authMiddleware,
    checkPermission("resumes:read:own"),
    getMyResumesController
);

// GET /resumes/my/:id
router.get(
    "/resumes/my/:id",
    authMiddleware,
    checkPermission("resumes:read:own"),
    getMyResumeByIdController
);

// PUT /resumes/my/:id
router.put(
    "/resumes/my/:id",
    authMiddleware,
    checkPermission("resumes:read:own"),
    updateMyResumeController
);

// PATCH /resumes/my/:id/status
router.patch(
    "/resumes/my/:id/status",
    authMiddleware,
    checkPermission("resumes:read:own"),
    updateMyResumeStatusController
);

// DELETE /resumes/my/:id
router.delete(
    "/resumes/my/:id",
    authMiddleware,
    checkPermission("resumes:read:own"),
    deleteMyResumeController
);
router.get(
    "/resume/:id",
    authMiddleware,
    checkAnyPermission(["resumes:read:own", "resumes:read:by"]),
    checkResumeAccess,
    getResumeById
);
router.get(
    "/resumes",
    authMiddleware,
    checkPermission("resumes:read:all"),
    getResume
);
router.get(
    "/resumes/search",
    authMiddleware,
    checkPermission("resumes:search"),
    searchResume
);
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