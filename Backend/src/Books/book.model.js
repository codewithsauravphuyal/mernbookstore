const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
    },
    coverImage: {
      public_id: String,
      url: String,
    },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    publicationDate: {
      type: Number,
    },
    description: {
      type: String,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);

// Update average rating and review count after a review is saved
bookSchema.statics.updateBookRating = async function (bookId) {
  const reviews = await mongoose.model('Review').find({ book: bookId });
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  await this.findByIdAndUpdate(bookId, {
    averageRating: Number(averageRating.toFixed(1)),
    reviewCount,
  });
};

module.exports = mongoose.model("Book", bookSchema);