import multer from 'multer';

// Use memory storage to process the file in memory before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('[MULTER] Processing incoming file:', file.originalname, 'MIME:', file.mimetype);
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    console.log('[MULTER] File accepted.');
    cb(null, true);
  } else {
    console.error('[MULTER] File rejected. Invalid mimetype:', file.mimetype);
    cb(new Error(`Only image files are allowed! Received: ${file.mimetype}`), false);
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
