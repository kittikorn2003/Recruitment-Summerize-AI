const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const uploadDir = "src/uploads/role_evidence";

const ALLOWED_MIME = [
    "application/pdf",
    "image/jpeg",
    "image/png",
];

const ALLOWED_EXTENSIONS = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
];

const MAX_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName = crypto.randomUUID();

        const ext = path
            .extname(file.originalname)
            .toLowerCase();

        cb(null, `evidence-${uniqueName}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {

    // console.log("FILE INFO:");
    // console.log("originalname:", file.originalname);
    // console.log("mimetype:", file.mimetype);

    const ext = path
        .extname(file.originalname)
        .toLowerCase();

    // MIME ถูกต้อง
    const validMime = ALLOWED_MIME.includes(file.mimetype);

    // extension ถูกต้อง
    const validExtension = ALLOWED_EXTENSIONS.includes(ext);

    if (!validExtension) {
        return cb(new Error(
            "Unsupported file extension (only .pdf, .jpg, .jpeg, .png allowed)"
        ));
    }

    /*
     * application/octet-stream สามารถเกิดขึ้นได้จาก
     * client บางตัว เช่น Postman
     *
     * ดังนั้นยอมรับเฉพาะกรณีที่ extension ถูกต้อง
     */
    if (!validMime && file.mimetype !== "application/octet-stream") {
        return cb(new Error("Unsupported file type"));
    }

    cb(null, true);
};

const uploadEvidence = multer({
    storage,
    limits: {
        fileSize: MAX_SIZE,
    },
    fileFilter,
});

module.exports = uploadEvidence;