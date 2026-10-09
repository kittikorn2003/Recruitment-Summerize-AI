const buildSearchContent = require("../utils/buildSearchContent");
const {createResume} = require("../models/uploadModel")
const { HfInference } = require("@huggingface/inference");
const huggingface = new HfInference(process.env.HF_API_KEY);

const embedding = async (text) => {
    const result = await huggingface.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
    });
    // console.log(text);
    // console.log(getEmbedding);
    // const result = Array.isArray(result[0]) ? result[0] : result;
    // console.log("result",result.length);
    return Array.isArray(result[0]) ? result[0] : result;
};

const saveResume = async (resumeJson,userId) => {
    
    const content = buildSearchContent(resumeJson);

    // const embeddingVector = await embedding(resumeJson.skills);
    const embeddingVector = await embedding(content);

    const payload = {...resumeJson,content,embeddingVector};

    return await createResume (payload,userId);
}

module.exports = { saveResume,embedding }
