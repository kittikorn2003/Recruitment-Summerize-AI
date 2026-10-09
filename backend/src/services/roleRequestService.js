const db = require("../config/db");

const createRoleRequest = async ({
    userId,
    evidenceFilename,
    reason,
}) => {

    const existing = await db.query(
        `
        SELECT id
        FROM role_requests
        WHERE user_id = $1
          AND status = 'pending'
        LIMIT 1
        `,
        [userId]
    );

    if (existing.rows.length > 0) {
        const error = new Error(
            "Pending role request already exists"
        );

        error.code = "ROLE_REQUEST_PENDING";

        throw error;
    }

    const result = await db.query(
        `
        INSERT INTO role_requests (
            user_id,
            requested_role,
            evidence_url,
            reason,
            status
        )
        VALUES (
            $1,
            'hr',
            $2,
            $3,
            'pending'
        )
        RETURNING
            id,
            requested_role,
            status,
            reason,
            created_at
        `,
        [
            userId,
            evidenceFilename,
            reason,
        ]
    );

    return result.rows[0];
};


const getMyRoleRequest = async (userId) => {

    const result = await db.query(
        `
        SELECT
            id,
            requested_role,
            reason,
            status,
            reject_reason,
            created_at,
            reviewed_at
        FROM role_requests
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};

const getAllRoleRequests = async () => {

    const result = await db.query(`
        SELECT
            rr.id,
            rr.user_id,
            u.username,
            u.email,
            rr.requested_role,
            rr.reason,
            rr.status,
            rr.reject_reason,
            rr.reviewed_by,
            rr.reviewed_at,
            rr.created_at
        FROM role_requests rr
        JOIN users u
            ON rr.user_id = u.id
        ORDER BY rr.created_at DESC
    `);

    return result.rows;
};

const getRoleRequestById = async (requestId) => {
    const result = await db.query(
        `
        SELECT
            rr.id,
            rr.user_id,
            u.username,
            u.email,
            rr.requested_role,
            rr.reason,
            rr.status,
            rr.reject_reason,
            rr.reviewed_by,
            rr.reviewed_at,
            rr.created_at
        FROM role_requests rr
        JOIN users u
            ON rr.user_id = u.id
        WHERE rr.id = $1
        `,
        [requestId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Role request not found");
        error.code = "ROLE_REQUEST_NOT_FOUND";
        throw error;
    }

    return result.rows[0];
};

const getRoleRequestEvidence = async (requestId) => {
    const result = await db.query(
        `
        SELECT
            evidence_url
        FROM role_requests
        WHERE id = $1
        `,
        [requestId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Role request not found");
        error.code = "ROLE_REQUEST_NOT_FOUND";
        throw error;
    }

    if (!result.rows[0].evidence_url) {
        const error = new Error("Evidence not found");
        error.code = "EVIDENCE_NOT_FOUND";
        throw error;
    }

    return result.rows[0].evidence_url;
};

const reviewRoleRequest = async ({
    requestId,
    adminId,
    status,
    rejectReason,
}) => {

    if (!["approved", "rejected"].includes(status)) {
        const error = new Error("Invalid status");
        error.code = "INVALID_STATUS";
        throw error;
    }

    if (status === "rejected" && !rejectReason) {
        const error = new Error("Reject reason is required");
        error.code = "REJECT_REASON_REQUIRED";
        throw error;
    }

    const client = await db.connect();

    try {

        await client.query("BEGIN");

        // 1. Lock request
        const requestResult = await client.query(
            `
            SELECT
                id,
                user_id,
                requested_role,
                status
            FROM role_requests
            WHERE id = $1
            FOR UPDATE
            `,
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            const error = new Error("Role request not found");
            error.code = "ROLE_REQUEST_NOT_FOUND";
            throw error;
        }

        const request = requestResult.rows[0];

        // 2. ต้องเป็น pending เท่านั้น
        if (request.status !== "pending") {
            const error = new Error(
                "This role request has already been reviewed"
            );

            error.code = "REQUEST_ALREADY_REVIEWED";

            throw error;
        }

        // 3. Update role request
        const updatedRequest = await client.query(
            `
            UPDATE role_requests
            SET
                status = $1,
                reviewed_by = $2,
                reviewed_at = NOW(),
                reject_reason = $3
            WHERE id = $4
            RETURNING
                id,
                user_id,
                requested_role,
                status,
                reject_reason,
                reviewed_by,
                reviewed_at,
                created_at
            `,
            [
                status,
                adminId,
                status === "rejected"
                    ? rejectReason
                    : null,
                requestId,
            ]
        );

        // 4. ถ้า approve → เปลี่ยน user role
        if (status === "approved") {

            await client.query(
                `
                UPDATE users
                SET role = $1
                WHERE id = $2
                `,
                [
                    request.requested_role,
                    request.user_id,
                ]
            );
        }

        // 5. Log role change
        if (status === "approved") {

            await client.query(
                `
                INSERT INTO role_change_logs (
                    user_id,
                    old_role,
                    new_role,
                    changed_by,
                    source
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
                `,
                [
                    request.user_id,
                    "user",
                    request.requested_role,
                    adminId,
                    "role_request",
                ]
            );
        }

        await client.query("COMMIT");

        return updatedRequest.rows[0];

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }
};

const cancelRoleRequest = async (requestId, userId, isAdmin = false) => {

    let query;
    let values;

    if (isAdmin) {

        query = `
            UPDATE role_requests
            SET
                status = 'cancelled',
                reviewed_by = $2,
                reviewed_at = NOW()
            WHERE id = $1
              AND status = 'pending'
            RETURNING
                id,
                user_id,
                requested_role,
                status,
                reason,
                reviewed_by,
                reviewed_at,
                created_at
        `;

        values = [requestId, userId];

    } else {

        query = `
            UPDATE role_requests
            SET
                status = 'cancelled',
                reviewed_at = NOW()
            WHERE id = $1
              AND user_id = $2
              AND status = 'pending'
            RETURNING
                id,
                user_id,
                requested_role,
                status,
                reason,
                reviewed_at,
                created_at
        `;

        values = [requestId, userId];
    }

    const result = await db.query(query, values);

    return result.rows[0] || null;
};

const revokeHrRole = async ({ targetUserId, adminId }) => {

    if (targetUserId === adminId) {
        const error = new Error("Cannot revoke your own role");
        error.code = "CANNOT_REVOKE_SELF";
        throw error;
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // ล็อกแถว user ไว้ กันแก้ role ซ้อนกันตอนมี admin หลายคน
        const userResult = await client.query(
            `
            SELECT id, role
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [targetUserId]
        );

        if (userResult.rows.length === 0) {
            const error = new Error("User not found");
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        const targetUser = userResult.rows[0];

        if (targetUser.role !== "hr") {
            const error = new Error("User does not currently have HR access");
            error.code = "USER_NOT_HR";
            throw error;
        }

        // 1. เปลี่ยน role กลับเป็น user
        const updatedUser = await client.query(
            `
            UPDATE users
            SET role = 'user'
            WHERE id = $1
            RETURNING id, username, email, role
            `,
            [targetUserId]
        );

        // 2. บันทึก audit log
        await client.query(
            `
            INSERT INTO role_change_logs (
                user_id,
                old_role,
                new_role,
                changed_by,
                source
            )
            VALUES ($1, 'hr', 'user', $2, 'admin_revoke')
            `,
            [targetUserId, adminId]
        );

        await client.query("COMMIT");

        return updatedUser.rows[0];

    } catch (err) {

        await client.query("ROLLBACK");
        throw err;

    } finally {
        client.release();
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