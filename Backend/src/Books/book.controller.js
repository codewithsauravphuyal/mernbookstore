const Book = require("./book.model");
const { uploadImage } = require("../utils/cloudinary");

// Post a new book
const postABook = async (req, res) => {
  try {
    const { title, author, category, publicationDate, price, description, trending, oldPrice, coverImage, quantity } = req.body;
    let coverImageUrl = coverImage?.url;

    // Validate required fields
    if (!title || !author || !category || !price) {
      return res.status(400).json({ message: "Title, author, category, and price are required" });
    }

    // Validate category against allowed values
    const validCategories = [
      // Fiction
      "General Fiction",
      "Historical Fiction",
      "Mystery & Thriller",
      "Science Fiction",
      "Fantasy",
      "Romance",
      "Horror",
      "Nepali Folk Tales",
      "Nepali Historical Fiction",
      // Non-Fiction
      "Biography & Memoir",
      "Self-Help",
      "History",
      "Business",
      "Health & Wellness",
      "Science & Technology",
      "Religion & Spirituality",
      "Nepali Culture & Heritage",
      "Mountaineering & Adventure",
      // Children & Young Adult
      "Children's Books",
      "Young Adult (YA)",
      "Educational",
      "Nepali Children's Stories",
      // Special Interest
      "Classics",
      "Poetry",
      "Graphic Novels",
      "Cookbooks",
      "Art & Photography",
      "Nepali Literature",
      "Travel & Tourism",
      // Religion
      "Hinduism",
      "Buddhism",
      "Islam",
      "Christianity",
      "Other Religions",
      "Nepali Spiritual Traditions",
      // Academic
      "Textbooks",
      "Reference Books",
      "Research & Essays",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${validCategories.join(", ")}` });
    }

    // Upload image if provided via file upload
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      coverImageUrl = result.secure_url;
    }

    // Validate cover image
    if (!coverImageUrl) {
      return res.status(400).json({ message: "Cover image URL is required" });
    }

    const book = new Book({
      title,
      author,
      category,
      publicationDate: publicationDate ? Number(publicationDate) : undefined, // Convert to Number
      price: Number(price),
      coverImage: { 
        url: coverImageUrl, 
        public_id: coverImage?.public_id || coverImageUrl.split('/').pop().split('.')[0] 
      },
      description,
      trending: trending === "true" || trending === true,
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      quantity: quantity ? Number(quantity) : 0,
    });

    await book.save();
    res.status(201).json({ message: "Book created successfully", book });
  } catch (error) {
    console.error("Error creating book:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create book", error: error.message });
  }
};

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().lean();
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
};

// Get single book by ID
const getSingleBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ message: "Failed to fetch book", error: error.message });
  }
};

// Update a book
const UpdateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, category, publicationDate, price, description, trending, oldPrice, quantity } = req.body;
    let coverImageUrl = req.body.coverImage?.url;

    console.log('Update request received:', {
      id,
      quantity,
      quantityType: typeof quantity,
      hasQuantity: 'quantity' in req.body
    });

    // Upload image if provided
    if (req.file && req.file.buffer) {
      const result = await uploadImage(req.file.buffer);
      coverImageUrl = result.secure_url;
    }

    if (!coverImageUrl && !req.body.coverImage?.url) {
      return res.status(400).json({ message: "Cover image URL is required" });
    }

    const updateData = {
      title,
      author,
      category,
      publicationDate: publicationDate ? Number(publicationDate) : undefined, // Convert to Number
      price: Number(price),
      coverImage: coverImageUrl ? { url: coverImageUrl } : undefined,
      description,
      trending: trending === "true" || trending === true,
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
    };

    // Handle quantity separately - allow 0 as valid value
    if ('quantity' in req.body) {
      updateData.quantity = Number(quantity);
    }

    // Remove undefined fields (but not 0 values)
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('Final update data:', updateData);

    const book = await Book.findByIdAndUpdate(id, updateData, { new: true });
    if (!book) return res.status(404).json({ message: "Book not found" });
    
    console.log('Book updated successfully:', {
      id: book._id,
      title: book.title,
      quantity: book.quantity
    });
    
    res.status(200).json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Failed to update book", error: error.message });
  }
};

// Delete a book
const deleteABook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Failed to delete book", error: error.message });
  }
};

module.exports = {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
};