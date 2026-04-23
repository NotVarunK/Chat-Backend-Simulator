export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`message-wrapper ${isOwn ? 'own' : 'other'}`}>
      <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
        {!isOwn && message.isGroup && <div className="message-sender">{message.sender}</div>}
        <div className="message-content">{message.content}</div>
      </div>
    </div>
  );
}
