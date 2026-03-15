import multer from 'multer';
import fs from 'fs';

const TEMP_UPLOAD_DIR = './public/temp';

const storage  = multer.diskStorage({
    destination: function(req, res, cb){
       fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
       cb(null, TEMP_UPLOAD_DIR); 
    },

    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});


export const upload = multer(
    {
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 5MB
        fileFilter: function(req, file, cb){
            const filetypes = /jpeg|jpg|png/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(file.originalname.toLowerCase());
            if (mimetype && extname) {
                return cb(null, true);
            }
            cb("Error: File upload only supports the following filetypes - " + filetypes);
        }
    }
);
