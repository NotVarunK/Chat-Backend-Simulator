import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export function useChat() {
  const { isConnected, lastMessage, sendMessage } = useWebSocket('ws://localhost:8080');
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [adminData, setAdminData] = useState(null);
  const [adminHistory, setAdminHistory] = useState([]);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'ERROR':
        if (!currentUser) setLoginError(lastMessage.message);
        break;
      case 'LOGIN_SUCCESS':
        setCurrentUser(lastMessage.username);
        setLoginError('');
        sendMessage('GET_CONTACTS');
        if (lastMessage.username === 'admin') {
          sendMessage('ADMIN_DATA');
        }
        break;
      case 'CONTACTS_REPLY':
        setContacts(lastMessage.contacts);
        break;
      case 'STATUS_UPDATE':
        setContacts(prev => prev.map(c => 
          c.username === lastMessage.username ? { ...c, isOnline: lastMessage.isOnline } : c
        ));
        break;
      case 'RECEIVE_MSG': {
        const msg = lastMessage.message;
        const isCurrentConversation = activeContact && 
          (msg.sender === activeContact || msg.receiver === activeContact || msg.receiver === currentUser && msg.sender === currentUser);
          
        if (isCurrentConversation) {
          setMessages(prev => {
              // Avoid duplicates if same timestamp and content
              if (prev.find(p => p.timestamp === msg.timestamp && p.content === msg.content)) return prev;
              return [...prev, msg]
          });
        } else {
          const otherUser = msg.sender === currentUser ? msg.receiver : msg.sender;
          setUnreadCounts(prev => ({
            ...prev,
            [otherUser]: (prev[otherUser] || 0) + 1
          }));
        }
        sendMessage('GET_CONTACTS');
        break;
      }
      case 'MSG_DELIVERED': {
        const sentMsg = lastMessage.message;
        if (activeContact && (sentMsg.receiver === activeContact || sentMsg.sender === activeContact)) {
           setMessages(prev => {
               if (prev.find(p => p.timestamp === sentMsg.timestamp && p.content === sentMsg.content)) return prev;
               return [...prev, sentMsg]
           });
           sendMessage('GET_CONTACTS');
        }
        break;
      }
      case 'HISTORY_REPLY':
        setMessages(lastMessage.history);
        break;
      case 'ADMIN_DATA_REPLY':
        setAdminData(lastMessage.payload);
        break;
      case 'ADMIN_HISTORY_REPLY':
        setAdminHistory(lastMessage.payload);
        break;
      case 'TYPING':
        setTypingUsers(prev => ({ ...prev, [lastMessage.sender]: true }));
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [lastMessage.sender]: false }));
        }, 3000);
        break;
      default:
        break;
    }
  }, [lastMessage, currentUser, activeContact, sendMessage]);

  const login = useCallback((username) => {
    sendMessage(`LOGIN:${username}`);
  }, [sendMessage]);

  const selectContact = useCallback((username) => {
    setActiveContact(username);
    setUnreadCounts(prev => ({ ...prev, [username]: 0 }));
    sendMessage(`HISTORY:${username}`);
  }, [sendMessage]);

  const sendChatMessage = useCallback((content) => {
    if (activeContact) {
      sendMessage(`SEND:${activeContact}:${content}`);
    }
  }, [activeContact, sendMessage]);

  const addContact = useCallback((username) => {
    sendMessage(`ADD_CONTACT:${username}`);
  }, [sendMessage]);
  
  const sendTyping = useCallback(() => {
     if (activeContact) {
         sendMessage(`TYPING:${activeContact}`);
     }
  }, [activeContact, sendMessage]);

  // Request admin data periodically if admin
  useEffect(() => {
     let interval;
     if (currentUser === 'admin') {
         interval = setInterval(() => {
             sendMessage('ADMIN_DATA');
         }, 5000);
     }
     return () => clearInterval(interval);
  }, [currentUser, sendMessage]);

  return {
    isConnected,
    currentUser,
    loginError,
    contacts,
    activeContact,
    messages,
    unreadCounts,
    typingUsers,
    adminData,
    adminHistory,
    login,
    selectContact,
    sendChatMessage,
    addContact,
    sendTyping
  };
}
