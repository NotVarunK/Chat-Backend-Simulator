import { useState } from 'react';

export default function AdminDashboard({ adminData, adminHistory }) {
  const [activeTab, setActiveTab] = useState('connections');

  if (!adminData) return <div className="admin-dashboard loading">Loading admin data...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <div className="admin-tabs">
          <button className={activeTab === 'connections' ? 'active' : ''} onClick={() => setActiveTab('connections')}>Connections</button>
          <button className={activeTab === 'hashmap' ? 'active' : ''} onClick={() => setActiveTab('hashmap')}>HashMap</button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History</button>
          <button className={activeTab === 'queue' ? 'active' : ''} onClick={() => setActiveTab('queue')}>Queue</button>
          <button className={activeTab === 'tree' ? 'active' : ''} onClick={() => setActiveTab('tree')}>Groups</button>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'connections' && (
          <div className="admin-section">
            <h3>Live Connections ({adminData.connections.length})</h3>
            <div className="card-grid">
              {adminData.connections.map(c => (
                <div key={c.username} className="admin-card">
                  <div className="card-header">
                    <span className="username">{c.username}</span>
                    <span className="status online">Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hashmap' && (
          <div className="admin-section">
            <h3>HashMap Viewer</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Socket ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {adminData.hashMap.map(h => (
                  <tr key={h.username}>
                    <td>{h.username}</td>
                    <td>{h.socketId}</td>
                    <td><span className="status online">{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="admin-section">
             <h3>Message History Explorer</h3>
             {adminHistory.length === 0 ? <p>No history found.</p> : (
                <div className="history-list">
                  {adminHistory.map((h, i) => (
                    <div key={i} className="history-item">
                      <h4>{h.users.join(' ↔ ')} ({h.messages.length} msgs)</h4>
                      <div className="mini-chat">
                        {h.messages.slice(-3).map((m, j) => (
                           <div key={j} className="mini-msg">
                             <span className="mini-sender">{m.sender}:</span> {m.content}
                           </div>
                        ))}
                        {h.messages.length > 3 && <div className="mini-msg more">...</div>}
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="admin-section">
             <h3>Queue Monitor</h3>
             {adminData.queue.length === 0 ? <p>No offline messages queued.</p> : (
                <div className="card-grid">
                  {adminData.queue.map(q => (
                    <div key={q.username} className="admin-card">
                       <div className="card-header">
                         <span className="username">{q.username}</span>
                         <span className="badge">{q.count}</span>
                       </div>
                       <div className="card-body">
                         <p className="preview">"{q.preview}..."</p>
                       </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        )}

        {activeTab === 'tree' && (
          <div className="admin-section">
             <h3>Group Tree Viewer</h3>
             <pre className="tree-view">{JSON.stringify(adminData.tree, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
