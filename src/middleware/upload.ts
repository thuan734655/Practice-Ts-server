import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = "resources/images";
const uploadPath = path.join(__dirname, "../", uploadDir);

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const getRelativePath = (absolutePath: string): string => {
    return path.relative(path.join(__dirname, ".."), absolutePath).replace(/\\/g, "/");
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);

        const relativeFilePath = getRelativePath(path.join(uploadPath, fileName));

        if (!req.body) req.body = {};
        req.body[file.fieldname ] = relativeFilePath;

        cb(null, fileName);
    },
});

 const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, 
});

export default upload;
