import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../redux/features/user/UserApi';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  
  const {
    data: profileData,
    isLoading,
    error,
    refetch
  } = useGetUserProfileQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profileData?.user) {
      const user = profileData.user;
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('phone', user.phone || '');
      setValue('street', user.shippingAddress?.street || '');
      setValue('city', user.shippingAddress?.city || '');
      setValue('state', user.shippingAddress?.state || '');
      setValue('country', user.shippingAddress?.country || 'Nepal');
      setValue('zipcode', user.shippingAddress?.zipcode || '');
    }
  }, [profileData, setValue]);

  const onSubmit = async (data) => {
    try {
      const profileUpdate = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          zipcode: data.zipcode
        }
      };

      await updateProfile(profileUpdate).unwrap();
      
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        showConfirmButton: false,
        timer: 1500,
      });

      setIsEditing(false);
      refetch();
    } catch (error) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Update Failed',
        text: error.data?.message || 'Failed to update profile. Please try again.',
        confirmButtonColor: '#4F46E5',
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading profile. Please try again.</p>
        </div>
      </div>
    );
  }

  const user = profileData?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 px-4">
      <motion.div
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-3xl md:text-4xl font-extrabold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            My Profile
          </motion.h1>
          {!isEditing && (
            <motion.button
              onClick={handleEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Edit Profile
            </motion.button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <motion.div
            className="bg-gray-50 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  {...register("firstName", { required: "First name is required" })}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    isEditing 
                      ? 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  {...register("lastName", { required: "Last name is required" })}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    isEditing 
                      ? 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register("phone", { 
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number"
                    }
                  })}
                  type="tel"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    isEditing 
                      ? 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                  placeholder="98XXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            className="bg-gray-50 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  {...register("street", { required: "Street address is required" })}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    isEditing 
                      ? 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                  placeholder="Enter your street address"
                />
                {errors.street && (
                  <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  {...register("city", { required: "City is required" })}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    isEditing 
                      ? 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                  placeholder="Kathmandu"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  {...register("state", { required: "State is required" })}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    isEditing 
                      ? 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                  placeholder="Bagmati"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <input
                  {...register("country", { required: "Country is required" })}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    isEditing 
                      ? 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                  placeholder="Nepal"
                />
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zipcode
                </label>
                <input
                  {...register("zipcode", { 
                    required: "Zipcode is required",
                    pattern: {
                      value: /^[0-9]{5}$/,
                      message: "Please enter a valid 5-digit zipcode"
                    }
                  })}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    isEditing 
                      ? 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                  placeholder="44600"
                />
                {errors.zipcode && (
                  <p className="text-red-500 text-sm mt-1">{errors.zipcode.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          {isEditing && (
            <motion.div
              className="flex justify-end space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default UserProfile; 