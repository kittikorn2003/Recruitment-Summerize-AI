const { searchResume } = require("../models/resumeModel")
const { embedding } = require("./resumeService")

const searchResumeService = async (keyword,languages = []) => {

    // if(!keyword?.trim()) {
    //     throw new Error("Keyword required")
    // }
    const queryEmbedding = await embedding(keyword)
    return await searchResume(keyword,queryEmbedding,languages);
}

module.exports = { searchResumeService }