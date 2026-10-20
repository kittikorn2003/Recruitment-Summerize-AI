
const pdfParse = require("pdf-parse");
const path = require("path");
const { extractResumeData,summarizeResume } = require("../services/aiServices");
const { findResumeById,
        getAllResumeFromDb,
        getLatestResumes,
        countResumes,
        getMyResumes,
        getMyResumeById,
        updateMyResume,
        updateMyResumeStatus,
        deleteMyResume
    } = require("../models/resumeModel")
const { saveResume } = require("../services/resumeService")

const fs = require("fs")
// console.log(pdfParse)
const resumeDir = path.join(__dirname,"../uploads/resumes");
const tmpResumeDir = path.join(__dirname,"../uploads/tmp_resumes")


const uploadFile = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).send("No file upload");
    const pdfFile = fs.readFileSync(req.file.path);
    // console.log("Req File",req.file)
    const fileName = req.file.filename;
    const data = await pdfParse(pdfFile);
    // console.log(data);
    const text = data.text;
    const cleanText = data.text.slice(0,4000);
    const resumeJson = await extractResumeData(cleanText,fileName);
    
    res.json({
        success: true,
        message: "Resume processed successfully",
        data: resumeJson
    });

    } catch (err) {
        console.error("Server Error:",err);
        res.status(500).json({ error: err.message 
        });
    }
}
const saveFile = async (req,res) => {
    try{
        const userId = req.user.id;
        const resumeJson = req.body;
        if (!resumeJson || !resumeJson.file_name) {
            return res.status(400).json({
                message: "No data provided or missing file name" 
            });
        }

        const filename = resumeJson.file_name;
        // console.log(filename);
        const tmpResumePath = path.join(tmpResumeDir,filename);
        const resumePath = path.join(resumeDir,filename);
        // console.log("tmp",tmpResumePath);
        // console.log("resume",resumePath);

        await fs.promises.rename(tmpResumePath,resumePath);

        const saveData = await saveResume(resumeJson,userId);
        res.json({
            success: true,
            message: "Resume processed and saved",
            data: saveData
        });
        
    }catch (err){
        console.error("Server Error:", err);
        res.status(500).json({
            error: err.message
        })
    }
}


const getResumeById = async (req, res) => {
    try{
        const resumeId = req.params.id;
        const resume = await findResumeById(resumeId)
        
        if(!resume){
            return res.status(404).json({
                message: "Resume not found"
            })
        }
        res.status(200).json(resume)
    }catch (err){
        console.log(err)
        res.status(500).json({
            message: "Server Error"
        })
    }
}
const getResume = async (req,res) => {
    try{
        const resume = await getAllResumeFromDb()
        if(!resume){
            return res.status(404).json({
                message:"Resume not found"
            })
        }
        res.status(200).json(resume)
    }catch (err){
        console.log(err)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

const getLatestResumesController = async (req, res) => {
    try {
        const limit = Number(req.query.limit ?? "6");
        const page = Number(req.query.page ?? "1");

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "limit must be an integer between 1 and 100",
            });
        }

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                success: false,
                message: "page must be an integer >= 1",
            });
        }

        const offset = (page - 1) * limit;

        const [data, total] = await Promise.all([
            getLatestResumes(limit, offset),
            countResumes(),
        ]);

        return res.status(200).json({ data, total, page, limit,totalPages: Math.ceil(total / limit),
            
        });
    } catch (error) {
        console.error("Get latest resumes error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve latest resumes",
        });
    }
};

const summarizeResumeController = async (req, res) => {
    try {
        const resumeId = Number(req.params.id);

        if (!Number.isInteger(resumeId) || resumeId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID",
            });
        }

        const resume = await findResumeById(resumeId);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found",
            });
        }

        const summary = await summarizeResume(resume);

        return res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        console.error("Summarize resume error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to summarize resume",
        });
    }
};

// GET /api/resumes/my
const getMyResumesController = async (req, res) => {
    try {
        const resumes = await getMyResumes(req.user.id);

        return res.status(200).json({
            success: true,
            data: resumes,
        });
    } catch (error) {
        console.error("Get my resumes error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve your resumes",
        });
    }
};


// GET /api/resumes/my/:id
const getMyResumeByIdController = async (req, res) => {
    try {
        const resumeId = Number(req.params.id);

        if (!Number.isInteger(resumeId) || resumeId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID",
            });
        }

        const resume = await getMyResumeById(
            resumeId,
            req.user.id
        );

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: resume,
        });
    } catch (error) {
        console.error("Get my resume error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve resume",
        });
    }
};


// PUT /api/resumes/my/:id
const updateMyResumeController = async (req, res) => {
    try {
        const resumeId = Number(req.params.id);

        if (!Number.isInteger(resumeId) || resumeId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID",
            });
        }

        // รับเฉพาะฟิลด์ที่อนุญาตให้แก้ไข
        const allowedFields = [
            "full_name",
            "email",
            "address",
            "career_summary",
            "skills",
            "spoken_languages",
            "education",
            "employment_history",
            "projects_or_research",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided",
            });
        }

        const updatedResume = await updateMyResume(
            resumeId,
            req.user.id,
            updates
        );

        if (!updatedResume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resume updated successfully",
            data: updatedResume,
        });
    } catch (error) {
        console.error("Update my resume error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update resume",
        });
    }
};


// PATCH /api/resumes/my/:id/status
const updateMyResumeStatusController = async (req, res) => {
    try {
        const resumeId = Number(req.params.id);
        const { is_active } = req.body;

        if (!Number.isInteger(resumeId) || resumeId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID",
            });
        }

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_active must be a boolean",
            });
        }

        const resume = await updateMyResumeStatus(
            resumeId,
            req.user.id,
            is_active
        );

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: is_active
                ? "Resume enabled successfully"
                : "Resume disabled successfully",
            data: resume,
        });
    } catch (error) {
        console.error("Update resume status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update resume status",
        });
    }
};


// DELETE /api/resumes/my/:id
const deleteMyResumeController = async (req, res) => {
    try {
        const resumeId = Number(req.params.id);

        if (!Number.isInteger(resumeId) || resumeId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID",
            });
        }

        const deletedResume = await deleteMyResume(
            resumeId,
            req.user.id
        );

        if (!deletedResume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resume deleted successfully",
        });
    } catch (error) {
        console.error("Delete my resume error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete resume",
        });
    }
};

module.exports = {
    uploadFile,
    getResumeById,
    getResume,
    saveFile,
    getLatestResumesController,
    summarizeResumeController,
    getMyResumesController,
    getMyResumeByIdController,
    updateMyResumeController,
    updateMyResumeStatusController,
    deleteMyResumeController,
};