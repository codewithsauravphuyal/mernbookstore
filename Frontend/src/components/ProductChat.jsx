import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCreateOrGetChatMutation, useSendMessageMutation } from '../redux/features/chat/chatApi';
import { motion } from 'framer-motion';
import { IoChatbubbleOutline, IoClose, IoPaperPlane, IoImageOutline } from 'react-icons/io5';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { useFetchbookbyIdQuery } from '../redux/features/Books/BookApi';
import PropTypes from 'prop-types';

const ProductChat = (props) => {
  const { productId } = useParams();
  const productFromProps = props.product;
  const { data: fetchedProduct, isLoading: isProductLoading, isError: isProductError } = useFetchbookbyIdQuery(productId, { skip: !!productFromProps });
  const product = productFromProps || fetchedProduct;

  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  const [createOrGetChat] = useCreateOrGetChatMutation();
  const [sendMessage] = useSendMessageMutation();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showProductCard, setShowProductCard] = useState(true);
  const [productInfoSent, setProductInfoSent] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (product && !chatId) {
      createOrGetChat(product._id).unwrap().then(response => {
        setChatId(response.chat._id);
        setMessages(response.chat.messages || []);
      });
    }
  }, [product, chatId, createOrGetChat]);

  useEffect(() => {
    if (product && chatId && messages.length === 0 && !productInfoSent) {
      const sendProductInfo = async () => {
        const productInfo = `Product Inquiry:\n${product.title}\n${product.author ? 'By ' + product.author + '\n' : ''}${product.category ? 'Category: ' + product.category + '\n' : ''}${product.description ? 'Description: ' + product.description.substring(0, 100) + '...' : ''}\n[View Product](${window.location.origin}/books/${product._id})`;
        let imageUrl = product.coverImage?.url || '';
        try {
          await sendMessage({ chatId, content: productInfo, image: imageUrl });
          setProductInfoSent(true);
        } catch { /* ignore duplicate send */ }
      };
      sendProductInfo();
    }
  }, [chatId, product, messages.length, productInfoSent, sendMessage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !imageFile) || !chatId) return;
    let imageUrl = null;
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          throw new Error('Image upload failed');
        }
      } catch {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Image Upload Error',
          text: 'Failed to upload image. Please try again.',
          confirmButtonColor: '#4F46E5',
        });
        return;
      }
    }
    try {
      const response = await sendMessage({ chatId, content: message, image: imageUrl }).unwrap();
      setMessages(prev => [...prev, response.message]);
      setMessage('');
      setImageFile(null);
      setImagePreview(null);
    } catch {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Error',
        text: 'Failed to send message. Please try again.',
        confirmButtonColor: '#4F46E5',
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserName = (sender) => {
    if (sender._id === currentUser?.id) {
      return 'You';
    }
    return sender.firstName && sender.lastName 
      ? `${sender.firstName} ${sender.lastName}`
      : sender.userName || 'Seller';
  };

  const getSenderId = (sender) => {
    if (!sender) return '';
    return (sender._id || sender.id || sender).toString();
  };

  const getUserId = () => (currentUser?.id || currentUser?._id || '').toString();

  if (!product && isProductLoading) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">Loading chat...</div>;
  }
  if (!product || isProductError) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-red-500">Product not found.</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white shadow-lg rounded-xl px-8 py-10 text-center">
          <h2 className="text-2xl font-bold mb-2 text-indigo-700">Please log in to chat</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to use the chat feature.</p>
          <a href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-full transition-colors">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col mt-16">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <IoChatbubbleOutline className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Chat with Admin</h3>
            {product && <p className="text-sm text-indigo-100">{product.title}</p>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Product Card (Left Side) */}
        {product && showProductCard && (
          <div className="w-1/4 bg-white border-r border-gray-200 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">Product Details</h4>
              <button 
                onClick={() => setShowProductCard(false)} 
                className="text-gray-400 hover:text-red-500"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <img 
                src={product.coverImage?.url} 
                alt={product.title} 
                className="w-full h-48 object-contain rounded-lg border mb-4"
              />
              <div className="font-semibold text-xl text-gray-900 mb-2">{product.title}</div>
              {product.price && (
                <div className="text-pink-600 font-bold text-xl mb-4">Rs. {product.price}</div>
              )}
              {product.author && (
                <div className="text-gray-600 mb-2">
                  <span className="font-medium">Author:</span> {product.author}
                </div>
              )}
              {product.category && (
                <div className="text-gray-600 mb-4">
                  <span className="font-medium">Category:</span> {product.category}
                </div>
              )}
              <div className="text-gray-700">
                <span className="font-medium">Description:</span> {product.description}
              </div>
            </div>
          </div>
        )}

        {/* Chat Area (Right Side) */}
        <div className={`${showProductCard ? 'w-3/4' : 'w-full'} flex flex-col bg-white`}>
          {/* Messages List - only this should scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '60vh' }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <IoChatbubbleOutline className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = getSenderId(msg.sender) === getUserId();
                return (
                  <motion.div
                    key={index}
                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar only for admin messages (left side) */}
                      {!isUser && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-sm font-bold text-white">
                          {msg.sender.userName ? msg.sender.userName[0].toUpperCase() : 'A'}
                        </div>
                      )}
                      
                      {/* Message content */}
                      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        {/* Text message bubble */}
                        {msg.content && (
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-sm mb-2 ${
                              isUser
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            {!isUser && (
                              <div className="text-xs font-semibold text-gray-500 mb-1">
                                {getUserName(msg.sender)}
                              </div>
                            )}
                            <p className="text-base whitespace-pre-line leading-relaxed">{msg.content}</p>
                          </div>
                        )}
                        
                        {/* Image message */}
                        {msg.image && (
                          <div className={`mb-2 ${isUser ? 'text-right' : 'text-left'}`}>
                            <img 
                              src={msg.image} 
                              alt="chat-img" 
                              className="max-w-[300px] max-h-[300px] rounded-lg border" 
                            />
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div className={`text-xs ${isUser ? 'text-gray-500 text-right' : 'text-gray-400 text-left'}`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input Bar - stays fixed at the bottom */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="w-full">
              <div className="flex space-x-3 items-center">
                <label className="cursor-pointer">
                  <IoImageOutline className="h-6 w-6 text-indigo-600 hover:text-indigo-700" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition-colors"
                >
                  <IoPaperPlane className="h-5 w-5" />
                </button>
              </div>
              {imagePreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-lg border" />
                  <button 
                    type="button" 
                    onClick={() => { setImageFile(null); setImagePreview(null); }} 
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductChat.propTypes = {
  product: PropTypes.object,
};

export default ProductChat;