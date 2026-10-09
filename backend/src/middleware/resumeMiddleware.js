const path = require("path");
const multer = require("multer");
const fs = require("fs");

const tmpDir = "src/uploads/tmp_resumes"
const uploadDir = "src/uploads/resumes";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
        const uniqName = Date.now() + '-' + Math.round(Math.random() * 1E9); //timesatamp + randomNum.pdf
        cb(null, `resume-${uniqName}${path.extname(file.originalname)}`);
    }
});

const uploadMiddleware = multer({
    storage: storage,
    limits: { fileSize: 10*1024*1024} //10MB
});

module.exports = uploadMiddleware;