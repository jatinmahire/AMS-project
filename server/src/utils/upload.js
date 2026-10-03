const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('./ApiError');

const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.pdf'];
const MAX_SIZE = 700 * 1024;

const AADHAAR_RULE = { types: ['.pdf', '.jpg', '.jpeg'], typeLabel: 'PDF or JPEG', maxSize: 700 * 1024, sizeLabel: '700KB' };

// fieldRules: { [fieldName]: { types, typeLabel, maxSize, sizeLabel } } — fields without a rule
// fall back to the general ALLOWED_TYPES.
function makeUploader(category, fieldRules = {}, maxFileSize = MAX_SIZE) {
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
    const rule = fieldRules[file.fieldname];
    const allowed = rule?.types || ALLOWED_TYPES;
    if (!allowed.includes(ext)) {
      const message = rule
        ? `Only ${rule.typeLabel} files are allowed`
        : `Unsupported file type: ${ext}. Allowed: ${ALLOWED_TYPES.join(', ')}`;
      return cb(new ApiError(400, message, { [file.fieldname]: message }));
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter, limits: { fileSize: maxFileSize } });
}

// Multer's limits.fileSize is per-uploader, so when one form mixes restricted fields (Aadhaar,
// 700KB) with general ones (photo, 5MB) the per-field cap is enforced here, after upload.
function enforceFieldSizes(fieldRules) {
  return (req, res, next) => {
    const uploaded = Object.values(req.files || {}).flat();
    const tooLarge = uploaded.find((f) => fieldRules[f.fieldname]?.maxSize && f.size > fieldRules[f.fieldname].maxSize);
    if (!tooLarge) return next();

    uploaded.forEach((f) => fs.unlink(f.path, () => {}));
    const message = `File must be ${fieldRules[tooLarge.fieldname].sizeLabel} or smaller`;
    next(new ApiError(400, message, { [tooLarge.fieldname]: message }));
  };
}

function fileUrl(category, filename) {
  return `/uploads/${category}/${filename}`;
}

module.exports = { makeUploader, enforceFieldSizes, fileUrl, AADHAAR_RULE };
