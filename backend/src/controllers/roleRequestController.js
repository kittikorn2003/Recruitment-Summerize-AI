const fs = require("fs");
const path = require("path");
const UPLOAD_DIR = path.resolve("src/uploads/role_evidence");
const roleRequestService = require("../services/roleRequestService");

const createRoleRequest = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Evidence file is required",
            });
        }

        const reason = req.body.reason?.trim();

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Reason is required",
            });
        }

        const result = await roleRequestService.createRoleRequest({
            userId: req.user.id,
            evidenceFilename: req.file.filename,
            reason,
        });

        return res.status(201).json({
            success: true,
            message: "HR access request submitted successfully",
            data: result,
        });

    } catch (err) {

        console.error("Create role request error:", err);

        if (err.code === "ROLE_REQUEST_PENDING") {
            return res.status(409).json({
                success: false,
                message: "You already have a pending request awaiting review",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


const getMyRoleRequest = async (req, res) => {
    try {

        const result = await roleRequestService.getMyRoleRequest(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (err) {

        console.error("Get my role request error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const getAllRoleRequests = async (req, res) => {

    try {

        const result =
            await roleRequestService.getAllRoleRequests();

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (err) {

        console.error(
            "Get all role requests error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
const getRoleRequestById = async (req, res) => {
    try {

        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role request ID",
            });
        }

        const result =
            await roleRequestService.getRoleRequestById(requestId);

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (err) {

        console.error(
            "Get role request by ID error:",
            err
        );

        if (err.code === "ROLE_REQUEST_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Role request not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
const getRoleRequestEvidence = async (req, res) => {
    try {

        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role request ID",
            });
        }

        const filename =
            await roleRequestService.getRoleRequestEvidence(requestId);

        const evidencePath = path.resolve(
            "src/uploads/role_evidence",
            filename
        );

        if (!fs.existsSync(evidencePath)) {
            return res.status(404).json({
                success: false,
                message: "Evidence file not found",
            });
        }

        return res.sendFile(evidencePath);

    } catch (err) {

        console.error(
            "Get role request evidence error:",
            err
        );

        if (err.code === "ROLE_REQUEST_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Role request not found",
            });
        }

        if (err.code === "EVIDENCE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Evidence not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const reviewRoleRequest = async (req, res) => {

    try {

        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role request ID",
            });
        }

        const { status, reject_reason } = req.body;

        const result =
            await roleRequestService.reviewRoleRequest({
                requestId,
                adminId: req.user.id,
                status,
                rejectReason: reject_reason?.trim(),
            });

        return res.status(200).json({
            success: true,
            message:
                status === "approved"
                    ? "HR request approved successfully"
                    : "HR request rejected successfully",
            data: result,
        });

    } catch (err) {

        console.error(
            "Review role request error:",
            err
        );

        if (err.code === "INVALID_STATUS") {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected",
            });
        }

        if (err.code === "REJECT_REASON_REQUIRED") {
            return res.status(400).json({
                success: false,
                message: "Reject reason is required",
            });
        }

        if (err.code === "ROLE_REQUEST_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Role request not found",
            });
        }

        if (err.code === "REQUEST_ALREADY_REVIEWED") {
            return res.status(409).json({
                success: false,
                message: "This role request has already been reviewed",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const cancelRoleRequest = async (req, res) => {

    try {

        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role request ID",
            });
        }

        const isAdmin = req.user.role === "admin";

        const cancelledRequest =
            await roleRequestService.cancelRoleRequest(
                requestId,
                req.user.id,
                isAdmin
            );

        if (!cancelledRequest) {

            return res.status(404).json({
                success: false,
                message:
                    "Role request not found, already processed, or you do not have permission to cancel it",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Role request cancelled successfully",
            data: cancelledRequest,
        });

    } catch (err) {

        console.error("Cancel role request error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const revokeHrRole = async (req, res) => {
    try {
        const targetUserId = Number(req.params.id);

        if (!Number.isInteger(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const result = await roleRequestService.revokeHrRole({
            targetUserId,
            adminId: req.user.id,
        });

        return res.status(200).json({
            success: true,
            message: "HR access revoked successfully",
            data: result,
        });

    } catch (err) {

        console.error("Revoke HR role error:", err);

        if (err.code === "CANNOT_REVOKE_SELF") {
            return res.status(403).json({
                success: false,
                message: "You cannot revoke your own role",
            });
        }

        if (err.code === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (err.code === "USER_NOT_HR") {
            return res.status(409).json({
                success: false,
                message: "This user does not currently have HR access",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

module.exports = {
    createRoleRequest,
    getMyRoleRequest,
    getAllRoleRequests,
    getRoleRequestById,
    getRoleRequestEvidence,
    reviewRoleRequest,
    cancelRoleRequest,
    revokeHrRole,
};