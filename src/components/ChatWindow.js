import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import initiationMessages from '../initiation_messages.json';

function ChatWindow({ match, onClose, onViewProfile, saveChatMessageToDB, getChatMessagesFromDB }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const hasInitializedRef = useRef(false);
  // Load messages from IndexedDB when component mounts
useEffect(() => {
  const loadMessages = async () => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    try {
      const savedMessages = await getChatMessagesFromDB(match.name);

      if (savedMessages.length > 0) {
        const formattedMessages = savedMessages.map((msg, index) => ({
          ...msg,
          id: index + 1,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(formattedMessages);
      } else {
        const initialMessage = {
          id: 1,
          text: initiationMessages[Math.floor(Math.random() * initiationMessages.length)],
          sender: 'them',
          timestamp: new Date(Date.now() - 3600000)
        };
        setMessages([initialMessage]);
        await saveChatMessageToDB(match.name, {
          text: initialMessage.text,
          sender: 'them'
        });
      }
    } catch (error) {
      console.error('Error loading messages from IndexedDB:', error);
      const initialMessage = {
        id: 1,
        text: initiationMessages[Math.floor(Math.random() * initiationMessages.length)],
        sender: 'them',
        timestamp: new Date(Date.now() - 3600000)
      };
      setMessages([initialMessage]);
      await saveChatMessageToDB(match.name, {
        text: initialMessage.text,
        sender: 'them'
      });
    }
  };

  loadMessages();
}, [match.name]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add user message to chat
      const userMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'me',
        timestamp: new Date()
      };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      // Save user message to IndexedDB
      saveChatMessageToDB(match.name, {
        text: message,
        sender: 'me'
      });
      
      // Clear input
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-window">
        {/* Chat Header */}
        <div className="chat-header">
          <button className="back-btn" onClick={onClose}>
            <ArrowLeft size={20} />
          </button>
          <div className="chat-user-info" onClick={onViewProfile}>
            <img 
              src={match.profileData.mainPhoto} 
              alt={match.name} 
              className="chat-avatar"
            />
            <div className="chat-user-details">
              <h3>{match.profileData.name}</h3>
              <span className="online-status">Online</span>
            </div>
          </div>
          <div className="chat-actions">
            {/* Placeholder for more actions */}
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={msg.sender === 'me' ? 'message sent' : 'message received'}>
              <div className="message-bubble">
                <p>{msg.text}</p>
                <small className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          ))}
        </div>
        
        {/* Message Input */}
        <div className="message-input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="message-input"
          />
          <button 
            onClick={handleSendMessage}
            className="send-btn"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;

