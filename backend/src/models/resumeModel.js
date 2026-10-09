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
const searchResume = async (keyword, queryEmbedding, languages = []) => {
    const params = [`[${queryEmbedding.join(",")}]`, keyword];

    let languageFilter = '';
    if (languages && languages.length > 0) {
        params.push(languages);
        languageFilter = `AND r.spoken_languages && $3::text[]`;
    }
    
    console.log('languages received:', languages); 
    console.log('languageFilter:', languageFilter);
    console.log('params:', params);

    const result = await pool.query(
        `WITH keyword_search AS (
            SELECT 
                id, 
                ROW_NUMBER() OVER (
                    ORDER BY ts_rank(search_vector, plainto_tsquery($2)) DESC
                ) as rank
            FROM resumes
            WHERE search_vector @@ plainto_tsquery($2)
            LIMIT 50
        ),

        vector_search AS (
            SELECT 
                id, 
                ROW_NUMBER() OVER (
                    ORDER BY embedding <-> $1::vector
                ) as rank
            FROM resumes
            LIMIT 50
        )

        SELECT 
            r.id,
            r.full_name,
            r.skills,
            r.file_name,
            r.spoken_languages,
            r.career_summary,
            u.username,
            u.profile_image,
            COALESCE(1.0 / (60.0 + k.rank), 0.0) + COALESCE(1.0 / (60.0 + v.rank), 0.0) AS hybrid_score
        FROM resumes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN keyword_search k ON r.id = k.id
        LEFT JOIN vector_search v ON r.id = v.id
        WHERE (k.id IS NOT NULL OR v.id IS NOT NULL)
        ${languageFilter}
        ORDER BY hybrid_score DESC
        LIMIT 5;
        `,
        params
    )
    return result.rows;
}

module.exports = {
    findResumeById,getAllResumeFromDb,searchResume
};