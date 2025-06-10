# MERN Bookstore

A full-stack bookstore application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). This project provides a robust platform for browsing, managing, and purchasing books, featuring a responsive user interface, secure authentication, and payment integration.

## Features

- **Book Browsing**: Search and explore a catalog of books with ease.
- **User Authentication**: Secure login and registration using JWT.
- **Payment Integration**: Process payments securely via Khalti.
- **Image Management**: Upload and manage book images with Cloudinary.
- **Responsive Design**: Optimized for desktop and mobile devices.
- **Admin Dashboard**: Manage books, users, and orders (for authorized users).
- **RESTful API**: Scalable backend with well-defined endpoints.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (local or MongoDB Atlas)
- **Authentication**: JSON Web Tokens (JWT)
- **Image Storage**: Cloudinary
- **Payment Gateway**: Khalti
- **Other Tools**: npm/yarn, dotenv for environment variables

## Getting Started

### Prerequisites

Ensure the following are installed before setting up the project:

- **Node.js** (v14 or later)
- **npm** or **yarn**
- **MongoDB** (local installation or a MongoDB Atlas account)
- **Cloudinary** account for image storage
- **Khalti** account for payment integration

### Installation

1. **Clone the Repository**
   ```
   git clone https://github.com/codewithsauravphuyal/mernbookstore.git
   cd mernbookstore
   ```
2.  **Install Frontend Dependencies**
   ```
   cd frontend
   npm install
   ```
3. **Install Backend Dependencies**
   ```
   cd backend 
   npm install
   ```
4. **Environment Setup**
   Create a .env file in the /frontend directory with the following:
   ```env
     VITE_API_BASE_URL=http://localhost:5000
     VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
     REACT_APP_KHALTI_PUBLIC_KEY=your_khalti_public_key
     KHALTI_SECRET_KEY=your_khalti_secret_key
    ```
   Create a .env file in the /backend directory with the following:
   ```env
     DB_URL=your_mongodb_connection_string
     JWT_SECRET_KEY=your_jwt_secret_key
     JWT_EXPIRES_IN=1h
     KHALTI_SECRET_KEY=your_khalti_secret_key
     PORT=5000
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
### Running the Application
  ```

1. Start the Backend Server (Runs on http://localhost:5000) 
  cd backend
  npm start

2. Start the Frontend Development Server (Runs on http://localhost:3000)
  cd frontend
  npm run dev
  ```
### Available Scripts
Frontend
  ```
  In the /frontend directory: 
  npm run dev: Starts the Vite development server
  npm run build: Builds the app for production
   ```
Backend 
   ```
  In the /backend directory: 
  npm start: Starts the server with Node.js 
   ```
### Contributing
Contributions are welcome! To contribute:
  1. Fork the repository
  2. Create a new branch (git checkout -b feature/your-feature)
  3. Commit your changes (git commit -m "Add your feature")
  4. Push to the branch (git push origin feature/your-feature)
  5. Open a pull request
  6. For major changes, please open an issue first to discuss your proposed changes.

### License
This project is licensed under the MIT License. See the LICENSE file for details.
MIT License  
Copyright (c) 2025 Saurav

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in  
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN  
THE SOFTWARE.

# mernbookstore
