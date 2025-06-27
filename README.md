# BookHauls - Online Book Store

A modern e-commerce platform for buying and selling books, built with React, Node.js, and MongoDB.

## Features

- **User Authentication**: Secure login and registration system
- **Admin Book Management**: Only admins can add, edit, and manage book inventory
- **Shopping Cart**: Add books to cart and manage quantities
- **Order Management**: Track orders and manage order status
- **Payment Integration**: Process payments securely via eSewa
- **Admin Dashboard**: Comprehensive admin panel for store management
- **User Profiles**: Manage user information and order history
- **Product Reviews**: Rate and review books
- **Real-time Chat**: Chat with admins about products
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- **React** with Vite
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for image storage
- **Payment Gateway**: eSewa

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- **eSewa** account for payment integration
- Cloudinary account for image storage

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd romilimbu
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

3. Set up environment variables:

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ESEWA_SECRET_KEY=your_esewa_secret_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_ESEWA_PUBLIC_KEY=your_esewa_public_key
```

4. Start the development servers:

```bash
# Start backend server
cd Backend
npm run dev

# Start frontend server (in a new terminal)
cd Frontend
npm run dev
```

## Payment Setup

### eSewa Integration

1. Create an eSewa merchant account
2. Get your public and secret keys from the eSewa dashboard
3. Add the keys to your environment variables
4. The payment integration is configured to work with eSewa's test environment

**Test Credentials:**
- Use eSewa's test environment for development
- For production, use real eSewa merchant credentials

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Add new book (**Admin only**)
- `PUT /api/books/:id` - Update book (**Admin only**)
- `DELETE /api/books/:id` - Delete book (**Admin only**)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user orders
- `PUT /api/orders/status/:id` - Update order status (**Admin only**)
- `POST /api/orders/verify-esewa` - Verify eSewa payment

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Deployment

### Backend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
