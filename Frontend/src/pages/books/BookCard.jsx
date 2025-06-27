import { FiShoppingCart } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

const BookCard = ({ book }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  // Fallback image URL
  const getImageUrl = (coverImage) => {
    if (typeof coverImage === 'string') return coverImage;
    if (coverImage?.url) return coverImage.url;
    return 'https://via.placeholder.com/300x400?text=No+Cover';
  };

  return (
    <div className="w-full max-w-xs bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <Link 
        to={`/books/${book._id}`} 
        className="relative h-100 w-full bg-gray-200 flex items-center justify-center"
      >
        <img
          src={getImageUrl(book.coverImage)}
          alt={book.title || "Book Cover"}
          className="h-[300px] w-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
          }}
        />
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
          {book.title || "Book Title"}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {book.description || "Book Description"}
        </p>
        <p className="text-lg font-semibold text-gray-900 mb-4">
          Rs {book.price || "N/A"}
          {book.oldPrice && (
            <span className="line-through text-gray-500 text-sm ml-2">
              Rs {book.oldPrice}
            </span>
          )}
        </p>
        <button
          onClick={() => handleAddToCart(book)}
          className="w-full py-2 px-4 bg-[#16186b] text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <FiShoppingCart />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

BookCard.propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    coverImage: PropTypes.object,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    oldPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default BookCard;