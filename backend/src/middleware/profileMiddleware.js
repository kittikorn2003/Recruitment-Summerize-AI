const path = require("path");
const multer = require("multer");
const fs = require("fs")

const uploadDir = "src/uploads/profiles"

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, uploadDir);
    },
    filename: (req,file,cb) => {
        const uniqName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${uniqName}${path.extname(file.originalname)}`);
    }
});

const profileMiddleware = multer({
    storage: storage,
    limits: {fieldSize: 2*1024*1024}
});

module.exports = profileMiddleware;