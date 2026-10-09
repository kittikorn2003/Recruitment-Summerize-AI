const { getResumeById } = require("../controllers/resumeController");
const { findResumeById } = require("../models/resumeModel");

const checkResumeAccess = async (req, res, next) => {
    try {
        const resumeId = req.params.id;
        const user = req.user;

        const resume = await findResumeById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        const isOwner = resume.user_id === user.id;
       
        // console.log(user)
        // console.log(isOwner)
        // console.log(resume.user_id)
        // console.log(user.id)
        const isFinder = user.role === "hr" || user.role === "admin";

        if (!isOwner && !isFinder) {
            return res.status(403).json({ message: "Access denied: No permission"})
        }

        req.resumeData = resume;
        next();

    } catch(err){
        res.status(500).json({ message: "Server Error"});
    }
}

module.exports = {
    checkResumeAccess
}