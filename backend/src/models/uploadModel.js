const pool = require("../config/db");

const createResume = async (payload, userId) => {

        const { personal_info,
             file_name, 
             career_summary, 
             skills, 
             spoken_languages, 
             employment_history, 
             education, 
             projects_or_research,
             content,
             embeddingVector
            } = payload;
        
        const values = [
            userId,
            personal_info?.full_name || null,
            personal_info?.email || null,
            personal_info?.address || null,
            file_name,
            career_summary || null,
            skills || [],
            spoken_languages || [],
            JSON.stringify(projects_or_research || []),
            JSON.stringify(education || []),
            JSON.stringify(employment_history || []),
            content,
            `[${embeddingVector.join(",")}]`
            
        ];
        // const convert = `[${embeddingSkill.join(",")}]`;
        // console.log("arr",embeddingSkill);
        // console.log("convert",convert);
        
        const result = await pool.query(
            `
            INSERT INTO resumes (
                user_id,  
                full_name, 
                email, 
                address, 
                file_name, 
                career_summary, 
                skills, 
                spoken_languages, 
                projects_or_research, 
                education, 
                employment_history,
                content,
                search_vector, 
                embedding
            ) 
            VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,to_tsvector('english', $12),$13::vector
            ) 
            RETURNING *`
            ,values
        );
            
            return result.rows[0];

        };

        
// embedding(["node", "python", "css"]);

module.exports = { createResume };




