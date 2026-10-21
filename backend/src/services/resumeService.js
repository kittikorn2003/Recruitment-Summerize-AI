const buildSearchContent = require("../utils/buildSearchContent");
const { createResume } = require("../models/uploadModel");
const {getMyResumeById,updateMyResume,} = require("../models/resumeModel");
const { createEmbedding } = require("./aiServices");

const saveResume = async (resumeJson, userId) => {
    const content = buildSearchContent(resumeJson);

    const payload = {
        ...resumeJson,
        content
    };

    return await createResume(payload, userId);
};

const updateMyResumeService = async (resumeId, userId, updates) => {
    // ดึงข้อมูลเดิมของเจ้าของ Resume เท่านั้น
    const existing = await getMyResumeById(resumeId, userId);

    if (!existing) {
        return null;
    }

    // รวมข้อมูลเดิมกับข้อมูลที่ผู้ใช้แก้ไข
    const merged = {
        ...existing,
        ...updates,
        personal_info: {
            full_name: updates.full_name ?? existing.full_name,
            email: updates.email ?? existing.email,
            address: updates.address ?? existing.address,
        },
    };

    // สร้าง content ใหม่จากข้อมูลล่าสุดทั้งหมด
    const content = buildSearchContent(merged);

    // สร้าง Embedding ใหม่จาก content ล่าสุด
    const embedding = await createEmbedding(content);

    // บันทึกข้อมูลและ Search fields ในครั้งเดียว
    return await updateMyResume(resumeId, userId, {
        ...updates,
        content,
        embedding,
    });
};

module.exports = { saveResume, updateMyResumeService };