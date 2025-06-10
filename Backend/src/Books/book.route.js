const express = require("express");
const router = express.Router();
const { postABook, getAllBooks, getSingleBook, UpdateBook, deleteABook } = require("./book.controller");
const { uploadImage } = require("../utils/cloudinary.js");
const upload = require("../middleware/upload");
const { authenticateAdmin } = require("../middleware/auth");

// Image upload endpoint (admin only)
router.post("/upload/image", authenticateAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    const result = await uploadImage(req.file.buffer);
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
});

// Book routes
router.post("/create", authenticateAdmin, upload.single("image"), postABook);
router.get("/", getAllBooks);
router.get("/:id", getSingleBook);
router.put("/edit/:id", authenticateAdmin, upload.single("image"), UpdateBook);
router.delete("/:id", authenticateAdmin, deleteABook);

module.exports = router;