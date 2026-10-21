
const { searchResume } = require("../models/resumeModel");
const { createEmbedding } = require("./aiServices");

const searchResumeService = async (
    keyword,
    languages = [],
    limit = 7,
    offset = 0
) => {
    const cleanKeyword = keyword?.trim() || "";

    if (!cleanKeyword && languages.length === 0) {
        throw new Error("Keyword or language filter is required");
    }

    // ไม่ต้องสร้าง Query Embedding หากค้นหาด้วยภาษาอย่างเดียว
    let queryEmbedding = null;

    if (cleanKeyword) {
        queryEmbedding = await createEmbedding(cleanKeyword);
    }

    return await searchResume(
        cleanKeyword,
        languages,
        limit,
        offset,
        queryEmbedding
    );
};

module.exports = { searchResumeService };
