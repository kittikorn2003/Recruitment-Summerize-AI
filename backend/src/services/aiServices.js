// ตัวนี้ตัว test debug ค่อยลบ
// require("dotenv").config({
//     path: "../.env"
// });
const { response, text } = require("express");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const checkModels = async () => {
//     try {
//         const models = await groq.models.list();

//         console.log(
//             models.data.map(model => model.id)
//         );
//     } catch (error) {
//         console.error("Model List Error:", error);
//     }
// };
// checkModels();
const extractResumeData = async (text,filename) => {
    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            {
                role: "user",
                content: `Extract data EXACTLY from the resume below.
Return ONLY valid JSON in this structure, NOTE: Do not include spoken languages inside skills. Put them in languages array only. No explanation:
{
  "personal_info": { "full_name": "", "email": "", "address": "" },
  "career_summary": "",
  "skills": [],
  "spoken_languages": [],
  "employment_history": [{ "position": "", "organization": "", "start_year": "", "end_year": "" }],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "projects_or_research": [{ "title": "", "description": "", "year": "" }],
}
Resume:
${text}`,
            },
        ],
        response_format: { type: "json_object" },
    });
    // console.log(response_format)
    // console.log(text)
    console.log(response.choices[0].message.content);
    const result = JSON.parse(response.choices[0].message.content);
    result.file_name = filename;
    console.log(result);

    return result;
};
// console.log(response)

module.exports = { extractResumeData };