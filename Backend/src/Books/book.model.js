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
      enum: ["Islam", "Philosophy", "Novels", "Science", "Self-Help"],
    },
    publicationDate: {
      type: Date,
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