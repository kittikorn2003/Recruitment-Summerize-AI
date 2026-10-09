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

const searchResume = async (keyword, languages = []) => {
    const params = [keyword];

    let languageFilter = "";

    if (languages.length > 0) {
        params.push(languages);
        languageFilter = `
            AND r.spoken_languages && $${params.length}::text[]
        `;
    }

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
            CASE
                WHEN $1 = '' THEN 0
                ELSE ts_rank(
                    r.search_vector,
                    plainto_tsquery('english', $1)
                ) * 100
            END AS hybrid_score
        FROM resumes r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE
            (
                $1 = ''
                OR r.search_vector @@ plainto_tsquery('english', $1)
            )
            ${languageFilter}
        ORDER BY
            hybrid_score DESC,
            r.id DESC
        LIMIT 5;
        `,
        params
    );

    return result.rows;
};

module.exports = {
    findResumeById,getAllResumeFromDb,searchResume
};