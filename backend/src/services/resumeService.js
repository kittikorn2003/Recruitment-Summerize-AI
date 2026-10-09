const buildSearchContent = require("../utils/buildSearchContent");
const { createResume } = require("../models/uploadModel");

const saveResume = async (resumeJson, userId) => {
    const content = buildSearchContent(resumeJson);

    const payload = {
        ...resumeJson,
        content
    };

    return await createResume(payload, userId);
};

module.exports = { saveResume };