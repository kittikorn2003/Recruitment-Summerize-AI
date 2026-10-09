const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { checkPermission,checkAnyPermission } = require("../middleware/rbacMiddleware");

const {
    createRoleRequest,
    getMyRoleRequest,
    getAllRoleRequests,
    getRoleRequestById,
    getRoleRequestEvidence,
    reviewRoleRequest,
    cancelRoleRequest,
    revokeHrRole, 
} = require("../controllers/roleRequestController");

const uploadEvidence = require("../middleware/uploadEvidence");
const { handleUploadError } = require("../middleware/handleUploadError");

// POST /api/role-requests
router.post(
    "/role-requests",
    authMiddleware,
    checkPermission("role_requests:create"),
    uploadEvidence.single("evidence"),
    handleUploadError,
    createRoleRequest
);

// GET /api/role-requests/me
router.get(
    "/role-requests/me",
    authMiddleware,
    checkPermission("role_requests:read:own"),
    getMyRoleRequest
);

router.get(
    "/role-requests",
    authMiddleware,
    checkPermission("role_requests:read"),
    getAllRoleRequests
);

router.get(
    "/role-requests/:id/evidence",
    authMiddleware,
    checkPermission("role_requests:read"),
    getRoleRequestEvidence
);

router.get(
    "/role-requests/:id",
    authMiddleware,
    checkPermission("role_requests:read"),
    getRoleRequestById
);

router.patch(
    "/role-requests/:id",
    authMiddleware,
    checkPermission("role_requests:review"),
    reviewRoleRequest
);

router.delete(
    "/role-requests/:id",
    authMiddleware,
    checkAnyPermission([
        "role_requests:cancel:own",
        "role_requests:cancel:any",
    ]),
    cancelRoleRequest
);

router.patch(
    "/users/:id/revoke-hr",
    authMiddleware,
    checkPermission("role_requests:revoke"),
    revokeHrRole
);

module.exports = router;