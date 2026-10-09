const { searchResume } = require("../models/resumeModel");

const searchResumeService = async (keyword, languages = []) => {
    const cleanKeyword = keyword?.trim() || "";

    if (!cleanKeyword && languages.length === 0) {
        throw new Error("Keyword or language filter is required");
    }

    return await searchResume(cleanKeyword, languages);
};

module.exports = { searchResumeService };