const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const resumeDir = path.join(uploadsDir, 'resumes');
const imageDir = path.join(uploadsDir, 'images');

[uploadsDir, resumeDir, imageDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => {
    const uniqueName = `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed.'), false);
  }
};

const resumeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'), false);
  }
};

const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadResume = multer({ storage: resumeStorage, fileFilter: resumeFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { uploadImage, uploadResume };
