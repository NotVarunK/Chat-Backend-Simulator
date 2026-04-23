import { useChat } from './hooks/useChat';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  const {
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
  } = useChat();

  if (!isConnected) {
    return <div className="loading-screen">Connecting to server...</div>;
  }

  if (!currentUser) {
    return <Login onLogin={login} error={loginError} />;
  }

  return (
    <div className="app-container">
      {currentUser !== 'admin' ? (
        <>
          <Sidebar 
            currentUser={currentUser}
            contacts={contacts}
            activeContact={activeContact}
            selectContact={selectContact}
            unreadCounts={unreadCounts}
            typingUsers={typingUsers}
            addContact={addContact}
          />
          <div className="main-area">
            <ChatWindow 
              currentUser={currentUser}
              activeContact={activeContact}
              messages={messages}
              onSendMessage={sendChatMessage}
              isTyping={typingUsers[activeContact]}
              contacts={contacts}
              sendTyping={sendTyping}
            />
          </div>
        </>
      ) : (
        <div className="main-area admin-only-view">
          <AdminDashboard 
             adminData={adminData} 
             adminHistory={adminHistory} 
          />
        </div>
      )}
    </div>
  );
}

export default App;
