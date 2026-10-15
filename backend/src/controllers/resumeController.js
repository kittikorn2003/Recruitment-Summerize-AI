
const pdfParse = require("pdf-parse");
const path = require("path");
const { extractResumeData } = require("../services/aiServices");
const { findResumeById,getAllResumeFromDb,getLatestResumes,countResumes   } = require("../models/resumeModel")
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

module.exports = { uploadFile,getResumeById,getResume,saveFile,getLatestResumesController, };