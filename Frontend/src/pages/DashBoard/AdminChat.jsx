import { useEffect, useState } from 'react';
import { useGetChatsQuery, useSendMessageMutation } from '../../redux/features/chat/chatApi';
import { useAuth } from '../../context/AuthContext';
import { IoSend } from 'react-icons/io5';

const AdminChat = () => {
  const { currentUser } = useAuth();
  const { data, isLoading, isError, refetch } = useGetChatsQuery();
  const [sendMessage] = useSendMessageMutation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (data?.chats?.length && !selectedChat) {
      setSelectedChat(data.chats[0]);
    }
  }, [data, selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    setSending(true);
    try {
      const response = await sendMessage({ chatId: selectedChat._id, content: message }).unwrap();
      // Optimistically update messages in selectedChat
      setSelectedChat(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), response.message],
      }));
      refetch();
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const getSenderId = (sender) => (sender?._id || sender?.id || sender || '').toString();
  const getCurrentUserId = () => (currentUser?.id || currentUser?._id || '').toString();

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading chats...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load chats.</div>;

  return (
    <div className="flex h-[80vh] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat List */}
      <div className="w-1/6 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 font-bold text-lg border-b">Chats</div>
        {data.chats.length === 0 ? (
          <div className="p-4 text-gray-500">No chats found.</div>
        ) : (
          data.chats.map((chat) => (
            <div
              key={chat._id}
              className={`p-4 cursor-pointer border-b hover:bg-indigo-50 ${selectedChat?._id === chat._id ? 'bg-indigo-100' : ''}`}
              onClick={() => handleSelectChat(chat)}
            >
              <div className="font-semibold text-gray-800 line-clamp-1">{chat.buyer?.userName || 'User'}</div>
              <div className="text-xs text-gray-500 line-clamp-1">{chat.product?.title || 'Product'}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(chat.lastMessage).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b flex items-center gap-4">
              <div className="font-bold text-lg">{selectedChat.buyer?.userName || 'User'}</div>
              <div className="text-xs text-gray-500">{selectedChat.product?.title}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {selectedChat.messages.length === 0 ? (
                <div className="text-center text-gray-400">No messages yet.</div>
              ) : (
                selectedChat.messages.map((msg, idx) => {
                  const isAdmin = getSenderId(msg.sender) === getCurrentUserId();
                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      {/* User message container */}
                      <div className={`flex max-w-[80%] ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar only for user messages */}
                        {!isAdmin && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center text-xs font-bold text-white">
                            {selectedChat.buyer?.userName ? selectedChat.buyer.userName[0].toUpperCase() : 'U'}
                          </div>
                        )}
                        
                        {/* Message content */}
                        <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                          {/* Text message */}
                          {msg.content && (
                            <div
                              className={`px-4 py-2 rounded-2xl shadow-sm mb-1 ${
                                isAdmin
                                  ? 'bg-indigo-500 text-white rounded-br-none'
                                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p className="text-base whitespace-pre-line leading-relaxed">{msg.content}</p>
                            </div>
                          )}
                          
                          {/* Image message */}
                          {msg.image && (
                            <div className="mb-1">
                              <img 
                                src={msg.image} 
                                alt="chat-img" 
                                className="max-w-[220px] max-h-[220px] rounded-lg" 
                              />
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          <div className={`text-xs ${isAdmin ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full flex items-center gap-2 disabled:bg-gray-400"
              >
                <IoSend />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat to view messages.</div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;