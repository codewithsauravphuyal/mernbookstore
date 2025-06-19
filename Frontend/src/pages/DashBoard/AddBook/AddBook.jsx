import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import InputField from './InputField';
import SelectField from './SelectField';
import { useAddBookMutation } from '../../../redux/features/Books/BookApi';
import Swal from 'sweetalert2';
import axios from 'axios';
import getBaseUrl from '../../../utils/getBaseUrl';

const AddBook = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: '',
      author: '',
      publicationDate: '',
      description: '',
      category: '',
      oldPrice: '',
      newPrice: '',
      trending: false,
    },
  });
  const [addBook, { isLoading }] = useAddBookMutation();
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToCloudinary = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    try {
      setUploading(true);
      let coverImage = { public_id: '', url: '' };
      const imageInput = document.querySelector('input[type="file"]');
      if (imageInput.files[0]) {
        const url = await uploadImageToCloudinary(imageInput.files[0]);
        coverImage = { public_id: url.split('/').pop().split('.')[0], url };
      }

      const newBookData = {
        title: data.title,
        author: data.author || 'Unknown Author',
        category: data.category,
        publicationDate: data.publicationDate ? Number(data.publicationDate) : undefined, // Convert to Number
        price: Number(data.newPrice),
        coverImage,
        trending: data.trending === 'on',
        description: data.description,
        oldPrice: Number(data.oldPrice),
      };

      await addBook(newBookData).unwrap();
      Swal.fire({
        title: 'Book Added',
        text: 'Your book was uploaded successfully!',
        icon: 'success',
        confirmButtonColor: '#4F46E5',
      });
      reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Add book error:', error);
      let errorMessage = 'Failed to add book. Please try again.';
      if (error.status === 401 || error.status === 403) {
        errorMessage = 'You must be logged in as an admin to add a book.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid book data. Please check all required fields.';
      }
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setUploading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Choose A Category', disabled: true },
    // Fiction
    { value: 'General Fiction', label: 'General Fiction' },
    { value: 'Historical Fiction', label: 'Historical Fiction' },
    { value: 'Mystery & Thriller', label: 'Mystery & Thriller' },
    { value: 'Science Fiction', label: 'Science Fiction' },
    { value: 'Fantasy', label: 'Fantasy' },
    { value: 'Romance', label: 'Romance' },
    { value: 'Horror', label: 'Horror' },
    { value: 'Nepali Folk Tales', label: 'Nepali Folk Tales' },
    { value: 'Nepali Historical Fiction', label: 'Nepali Historical Fiction' },
    // Non-Fiction
    { value: 'Biography & Memoir', label: 'Biography & Memoir' },
    { value: 'Self-Help', label: 'Self-Help' },
    { value: 'History', label: 'History' },
    { value: 'Business', label: 'Business' },
    { value: 'Health & Wellness', label: 'Health & Wellness' },
    { value: 'Science & Technology', label: 'Science & Technology' },
    { value: 'Religion & Spirituality', label: 'Religion & Spirituality' },
    { value: 'Nepali Culture & Heritage', label: 'Nepali Culture & Heritage' },
    { value: 'Mountaineering & Adventure', label: 'Mountaineering & Adventure' },
    // Children & Young Adult
    { value: 'Children’s Books', label: 'Children’s Books' },
    { value: 'Young Adult (YA)', label: 'Young Adult (YA)' },
    { value: 'Educational', label: 'Educational' },
    { value: 'Nepali Children’s Stories', label: 'Nepali Children’s Stories' },
    // Special Interest
    { value: 'Classics', label: 'Classics' },
    { value: 'Poetry', label: 'Poetry' },
    { value: 'Graphic Novels', label: 'Graphic Novels' },
    { value: 'Cookbooks', label: 'Cookbooks' },
    { value: 'Art & Photography', label: 'Art & Photography' },
    { value: 'Nepali Literature', label: 'Nepali Literature' },
    { value: 'Travel & Tourism', label: 'Travel & Tourism' },
    // Religion
    { value: 'Hinduism', label: 'Hinduism' },
    { value: 'Buddhism', label: 'Buddhism' },
    { value: 'Islam', label: 'Islam' },
    { value: 'Christianity', label: 'Christianity' },
    { value: 'Other Religions', label: 'Other Religions' },
    { value: 'Nepali Spiritual Traditions', label: 'Nepali Spiritual Traditions' },
    // Academic
    { value: 'Textbooks', label: 'Textbooks' },
    { value: 'Reference Books', label: 'Reference Books' },
    { value: 'Research & Essays', label: 'Research & Essays' },
  ];

  return (
    <div className="relative bg-gray-50 overflow-hidden">
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          className="relative bg-white rounded-2xl shadow-xl p-10 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="text-indigo-600">Add a New</span> Book to Our Collection
          </motion.h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <InputField
              label="Book Title"
              name="title"
              placeholder="Enter book title"
              register={register}
              error={errors.title}
              validation={{ required: 'Title is required' }}
            />
            <InputField
              label="Author"
              name="author"
              placeholder="Enter author name"
              register={register}
              error={errors.author}
              validation={{ required: 'Author is required' }}
            />
            <InputField
              label="Publication Year"
              name="publicationDate"
              type="number"
              placeholder="Enter publication year (e.g., 2025)"
              register={register}
              error={errors.publicationDate}
              validation={{
                pattern: {
                  value: /^\d{4}$/,
                  message: 'Enter a valid 4-digit year',
                },
              }}
            />
            <InputField
              label="Description"
              name="description"
              placeholder="Enter book description"
              type="textarea"
              register={register}
              error={errors.description}
            />
            <SelectField
              label="Category"
              name="category"
              options={categoryOptions}
              register={register}
              error={errors.category}
              validation={{
                required: 'Category is required',
                validate: (value) => value !== '' || 'Please select a valid category',
              }}
            />
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <input
                type="checkbox"
                {...register('trending')}
                className="w-6 h-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-colors duration-300"
              />
              <label className="text-base font-medium text-gray-700">Mark as Trending</label>
            </motion.div>
            <InputField
              label="Old Price"
              name="oldPrice"
              type="number"
              placeholder="Old Price"
              register={register}
              error={errors.oldPrice}
            />
            <InputField
              label="New Price"
              name="newPrice"
              type="number"
              placeholder="New Price"
              register={register}
              error={errors.newPrice}
              validation={{ required: 'New Price is required' }}
            />
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <label className="block text-base font-medium text-gray-700">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-base text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-300"
              />
              {imagePreview && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-indigo-500/10 mix-blend-overlay"></div>
                  </div>
                </motion.div>
              )}
            </motion.div>
            <motion.button
              type="submit"
              disabled={isLoading || uploading}
              className="w-full py-4 px-6 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {isLoading || uploading ? 'Uploading...' : 'Add Book'}
            </motion.button>
          </form>
        </motion.div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-200 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};

export default AddBook;