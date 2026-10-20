const pool = require("../config/db")

const findResumeById = async (id) => {
    const result = await pool.query(
        "SELECT * FROM resumes WHERE id=$1",
        [id]
    );
    return result.rows[0];
}
const getAllResumeFromDb = async () => {
    const result = await pool.query(
        "SELECT resumes.id,resumes.full_name,resumes.skills,resumes.spoken_languages,resumes.career_summary,users.username,users.profile_image,file_name FROM resumes LEFT JOIN users ON resumes.user_id = users.id"   
    )
    return result.rows;
}

const searchResume = async (
    keyword,
    languages = [],
    limit = 7,
    offset = 0
) => {
    const params = [keyword];
    let languageFilter = "";

    if (languages.length > 0) {
        params.push(languages);
        languageFilter = `
            AND r.spoken_languages && $${params.length}::text[]
        `;
    }

    params.push(limit);
    const limitParam = `$${params.length}`;

    params.push(offset);
    const offsetParam = `$${params.length}`;

    const result = await pool.query(
        `
        SELECT
            r.id,
            r.full_name,
            r.skills,
            r.file_name,
            r.spoken_languages,
            r.career_summary,
            u.username,
            u.profile_image,
            r.created_at,
            r.address,
            r.education
        FROM resumes r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE
            r.is_active = TRUE

            AND (
                $1 = ''
                OR r.search_vector @@ plainto_tsquery('english', $1)
            )
            ${languageFilter}
        ORDER BY r.created_at DESC, r.id DESC
        LIMIT ${limitParam}
        OFFSET ${offsetParam};
        `,
        params
    );

    return result.rows;
};
const getLatestResumes = async (limit = 6, offset = 0) => {
    const result = await pool.query(
        `
        SELECT
            r.id,
            r.full_name,
            r.skills,
            r.file_name,
            r.spoken_languages,
            r.career_summary,
            u.username,
            u.profile_image,
            r.created_at,
            r.address,
            r.education
        FROM resumes r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.is_active = TRUE
        ORDER BY r.created_at DESC, r.id DESC
        LIMIT $1 OFFSET $2;
        `,
        [limit, offset]
    );

    return result.rows;
};

const countResumes = async () => {
    const result = await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM resumes
        WHERE is_active = TRUE
    `);

    return result.rows[0].total;
};

// Get all resumes belonging to the logged-in user
const getMyResumes = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            full_name,
            email,
            file_name,
            career_summary,
            skills,
            spoken_languages,
            education,
            employment_history,
            projects_or_research,
            is_active,
            created_at
        FROM resumes
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC;
        `,
        [userId]
    );

    return result.rows;
};

// Get one resume belonging to the logged-in user
const getMyResumeById = async (resumeId, userId) => {
    const result = await pool.query(
        `
        SELECT *
        FROM resumes
        WHERE id = $1
          AND user_id = $2;
        `,
        [resumeId, userId]
    );

    return result.rows[0] || null;
};


// Update editable resume fields
const updateMyResume = async (resumeId, userId, updates) => {
    const allowedFields = [
        "full_name",
        "email",
        "address",
        "career_summary",
        "skills",
        "spoken_languages",
        "education",
        "employment_history",
        "projects_or_research",
    ];

    const fields = Object.keys(updates).filter(
        (field) => allowedFields.includes(field)
    );

    if (fields.length === 0) {
        return null;
    }

    const values = fields.map((field) => updates[field]);

    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

    values.push(resumeId, userId);

    const result = await pool.query(
        `
        UPDATE resumes
        SET ${setClause}
        WHERE id = $${values.length - 1}
          AND user_id = $${values.length}
        RETURNING *;
        `,
        values
    );

    return result.rows[0] || null;
};


// Enable or disable a resume
const updateMyResumeStatus = async (resumeId, userId, isActive) => {
    const result = await pool.query(
        `
        UPDATE resumes
        SET is_active = $1
        WHERE id = $2
          AND user_id = $3
        RETURNING id, is_active;
        `,
        [isActive, resumeId, userId]
    );

    return result.rows[0] || null;
};


// Delete a resume owned by the logged-in user
const deleteMyResume = async (resumeId, userId) => {
    const result = await pool.query(
        `
        DELETE FROM resumes
        WHERE id = $1
          AND user_id = $2
        RETURNING id, file_name;
        `,
        [resumeId, userId]
    );

    return result.rows[0] || null;
};

module.exports = {
    findResumeById,
    getAllResumeFromDb,
    searchResume,
    getLatestResumes,
    countResumes,
    getMyResumes,
    getMyResumeById,
    updateMyResume,
    updateMyResumeStatus,
    deleteMyResume,
};