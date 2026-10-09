const buildSearchContent = (resume) => {
    
    const personalInfo = `
    ${resume.personal_info?.full_name || ""}
    ${resume.personal_info?.email || ""}
    ${resume.personal_info?.address || ""}
    `

    const career = resume.career_summary || ""

    const skills = (resume.skills || []).join(" ")
     
    const languages = (resume.spoken_languages || []).join(" ")

    const employment = 
        (resume.employment_history || [])
            .map(job => `
                ${job.position || ""}
                ${job.organization || ""}
                ${job.start_year || ""}
                ${job.end_year || ""}
                `)
                .join(" ")
    
    const education = 
        (resume.education || [])
            .map(edu => `
                ${edu.degree || ""}
                ${edu.institution || ""}
                ${edu.year || ""}
                `)
                .join(" ")
    
    const projects =
        (resume.projects_or_research || [])
            .map(project => `
                ${project.title || ""}
                ${project.description || ""}
                ${project.year || ""}
                `)
                .join(" ");

    return `
        ${personalInfo}

        ${career}

        ${skills}

        ${languages}

        ${employment}

        ${education}

        ${projects}
    `
        .replace(/\s+/g, " ")
        .trim();
}
module.exports = buildSearchContent
