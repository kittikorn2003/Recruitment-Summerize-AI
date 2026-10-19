const { response, text } = require("express");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    console.log(response.choices[0].message.content);
    const result = JSON.parse(response.choices[0].message.content);
    result.file_name = filename;
    console.log(result);

    return result;
};


const summarizeResume = async (resume) => {
  const resumeContent = {
    full_name: resume.full_name ?? "",
    email: resume.email ?? "",
    career_summary: resume.career_summary ?? "",
    skills: resume.skills ?? [],
    spoken_languages: resume.spoken_languages ?? [],
    employment_history: resume.employment_history ?? [],
    education: resume.education ?? [],
    projects_or_research: resume.projects_or_research ?? [],
  };

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content: `
You are a resume summarization assistant for an HR recruitment system.

Write a clear, professional resume summary in plain text.
Do not return JSON or wrap the response in Markdown code fences.
Accuracy requirements:
- Use only facts explicitly present in the provided resume data.
- Do not infer language proficiency, skill levels, seniority,
  achievements, or qualifications.
- Do not add technologies merely because they are mentioned
  in related projects unless they appear in the provided data.
- Distinguish academic projects from professional employment.
- For missing information, say:
  "Not provided in the available resume data."
- Do not assume missing information means the candidate
  lacks that qualification or experience.
- Keep the summary concise and avoid repeating information.

Use these headings:
Professional Overview
Key Skills
Work Experience
Education
Languages
Projects
Missing Information

Use readable paragraphs and bullet points where appropriate.
Summarize only information explicitly supported by the resume data.
Do not invent skills, experience, qualifications, achievements, or personal details.
If a section has no information, write "Not provided".
Do not make hiring decisions or infer protected personal characteristics.
Return only the plain-text summary.
        `.trim(),
      },
      {
        role: "user",
        content: JSON.stringify(resumeContent),
      },
    ],
  });

  return response.choices[0].message.content.trim();
};


module.exports = {
    extractResumeData,
    summarizeResume,
};



