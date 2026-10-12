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
            r.created_at
        FROM resumes r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE
            (
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
            r.created_at
        FROM resumes r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC, r.id DESC
        LIMIT $1 OFFSET $2;
        `,
        [limit, offset]
    );

    return result.rows;
};

const countResumes = async () => {
    const result = await pool.query(`SELECT COUNT(*)::int AS total FROM resumes`);
    return result.rows[0].total;
};

module.exports = {
    findResumeById,getAllResumeFromDb,searchResume,getLatestResumes,countResumes,
};