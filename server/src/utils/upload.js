const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('./ApiError');

const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.pdf'];
const MAX_SIZE = 5 * 1024 * 1024;

function makeUploader(category) {
  const destDir = path.join(__dirname, '..', '..', 'uploads', category);
  fs.mkdirSync(destDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      return cb(new ApiError(400, `Unsupported file type: ${ext}. Allowed: ${ALLOWED_TYPES.join(', ')}`));
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
}

function fileUrl(category, filename) {
  return `/uploads/${category}/${filename}`;
}

module.exports = { makeUploader, fileUrl };
