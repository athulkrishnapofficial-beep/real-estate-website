const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs'); // For file deletion

const app = express();
const port = 3001; // Port for the backend server

// Enable CORS for your frontend (adjust origin if needed in production)
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to parse JSON bodies (needed for the delete endpoint)
app.use(express.json());

// --- Multer Configuration for File Storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp + original filename
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
// ----------------------------------------

// --- API Endpoints ---

// POST /upload - Handles single image upload
app.post('/upload', upload.single('propertyImage'), (req, res) => {
  if (!req.file) {
    console.error("No file received in upload request.");
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Construct the URL where the file can be accessed
  // IMPORTANT: Use localhost during development. Replace with your actual server URL in production.
  const fileUrl = `${req.protocol}://localhost:${port}/uploads/${req.file.filename}`;
  console.log("File uploaded successfully:", fileUrl);
  res.status(200).json({
    message: 'File uploaded successfully',
    url: fileUrl // Send the accessible URL back to the frontend
  });
});

// POST /delete - Handles file deletion
app.post('/delete', (req, res) => {
  const { imageUrl } = req.body; // Expecting { "imageUrl": "http://..." }

  if (!imageUrl) {
    console.error("Delete request received without imageUrl.");
    return res.status(400).json({ message: 'No image URL provided.' });
  }

  try {
    // Extract filename from the URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    if (!filename) {
        console.error("Could not extract filename from URL:", imageUrl);
        return res.status(400).json({ message: 'Invalid image URL format.' });
    }

    // Construct the full path to the file on the server
    const filePath = path.join(__dirname, 'uploads', filename);
    console.log("Attempting to delete file:", filePath);

    // Check if file exists and delete it
    fs.unlink(filePath, (err) => {
      if (err) {
        // If file not found, it might have already been deleted, which is okay.
        if (err.code === 'ENOENT') {
          console.warn("File not found for deletion (maybe already deleted):", filePath);
          return res.status(200).json({ message: 'File not found, assumed deleted.' });
        }
        // Other errors during deletion
        console.error("Error deleting file:", err);
        // Still send a success response to frontend if Firestore delete worked
        return res.status(500).json({ message: 'Error deleting file on server.' });
      }
      console.log("File deleted successfully:", filePath);
      res.status(200).json({ message: 'File deleted successfully.' });
    });

  } catch (error) {
    console.error("Error processing delete request:", error);
    res.status(500).json({ message: 'Internal server error during delete request.' });
  }
});
// --------------------

// Start the server
app.listen(port, () => {
  console.log(`Node.js image upload server running at http://localhost:${port}`);
});