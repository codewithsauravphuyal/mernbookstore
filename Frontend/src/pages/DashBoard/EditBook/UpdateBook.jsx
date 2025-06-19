import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import {
  useFetchbookbyIdQuery,
  useUpdateBookMutation,
} from "../../../redux/features/Books/BookApi";
import getBaseUrl from "../../../utils/getBaseUrl";
import Loading from "../../../components/Loading";
import InputField from "../AddBook/InputField";
import SelectField from "../AddBook/SelectField";

const UpdateBook = () => {
  const { id } = useParams();
  const { data: bookData, isLoading, isError, refetch } = useFetchbookbyIdQuery(id);
  const [updateBook] = useUpdateBookMutation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (bookData) {
      setValue("title", bookData.title);
      setValue("author", bookData.author);
      setValue("category", bookData.category);
      setValue("publicationYear", bookData.publicationYear || "");
      setValue("price", bookData.price);
      setValue("description", bookData.description);
      setValue("trending", bookData.trending);
      setValue("oldPrice", bookData.oldPrice);
      setValue("coverImage", bookData.coverImage?.url || "");
    }
  }, [bookData, setValue]);

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(`${getBaseUrl()}/api/books/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUploading(false);
      return response.data.imageUrl;
    } catch (error) {
      setUploading(false);
      throw new Error(error.response?.data?.message || "Failed to upload image");
    }
  };

  const onSubmit = async (data) => {
    let coverImageUrl = data.coverImage || bookData.coverImage?.url;

    if (coverImageFile) {
      try {
        coverImageUrl = await handleFileUpload(coverImageFile);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
        return;
      }
    }

    const updateBookData = {
      title: data.title,
      author: data.author,
      category: data.category,
      publicationDate: data.publicationYear ? Number(data.publicationYear) : undefined,
      price: Number(data.price),
      coverImage: { url: coverImageUrl },
      description: data.description,
      trending: data.trending,
      oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
    };

    try {
      await updateBook({ id, ...updateBookData }).unwrap();
      Swal.fire({
        title: "Book Updated",
        text: "Your book was updated successfully!",
        icon: "success",
        confirmButtonColor: "#4F46E5",
      });
      refetch();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.data?.message || "Failed to update book",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleFileChange = (e) => {
    setCoverImageFile(e.target.files[0]);
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

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-center text-red-600 text-lg font-medium">Error fetching book data</div>;

  return (
    <div className="relative bg-gray-50">
      <div className="max-w-full mx-auto px-8 sm:px-8 lg:px-12">
        <div className="relative bg-white rounded-2xl shadow-xl p-10 md:p-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-10 text-center">
            <span className="text-indigo-600">Update</span> Book Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <InputField
              label="Book Title"
              name="title"
              placeholder="Enter book title"
              register={register}
              error={errors.title}
              rules={{ required: "Book title is required" }}
            />

            <InputField
              label="Authors"
              name="author"
              placeholder="Enter author name"
              register={register}
              error={errors.author}
              rules={{ required: "Author is required" }}
            />

            <SelectField
              label="Category"
              name="category"
              options={categoryOptions}
              register={register}
              error={errors.category}
              rules={{
                required: "Category is required",
                validate: (value) => value !== "" || "Please select a valid category",
              }}
            />

            <InputField
              label="Publication Year"
              name="publicationYear"
              type="number"
              placeholder="Enter publication year (e.g., 2025)"
              register={register}
              error={errors.publicationYear}
              rules={{
                pattern: {
                  value: /^\d{4}$/,
                  message: "Enter a valid 4-digit year",
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

            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                {...register("trending")}
                className="w-6 h-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-base font-medium text-gray-700">Mark as trending</label>
            </div>

            <InputField
              label="Old Price"
              name="oldPrice"
              type="number"
              placeholder="Old Price"
              register={register}
              error={errors.oldPrice}
              rules={{ min: { value: 0, message: "Price cannot be negative" }}}
            />

            <InputField
              label="Price"
              name="price"
              type="number"
              placeholder="Enter price"
              register={register}
              error={errors.price}
              rules={{ 
                required: "Price is required", 
                min: { 
                  value: 0, 
                  message: "Price cannot be negative" 
                }
              }}
            />

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              <InputField
                label="Or Enter Cover Image URL"
                name="coverImage"
                type="text"
                placeholder="Enter cover image URL"
                register={register}
                error={errors.coverImage}
                rules={{
                  validate: (value) =>
                    !value || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(value) || "Invalid image URL",
                }}
              />
              {bookData.coverImage?.url && (
                <img
                  src={bookData.coverImage.url}
                  alt="Current cover"
                  className="mt-4 h-32 w-32 object-cover rounded"
                />
              )}
              {uploading && <p className="text-gray-500 text-sm mt-2">Uploading image...</p>}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 px-6 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 disabled:bg-gray-400"
            >
              Update Book
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateBook;