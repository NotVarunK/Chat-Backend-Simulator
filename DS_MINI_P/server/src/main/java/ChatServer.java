import org.java_websocket.server.WebSocketServer;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import com.google.gson.Gson;

import java.net.InetSocketAddress;
import java.time.Instant;
import java.util.*;

public class ChatServer extends WebSocketServer {

    // Custom Data Structures
    private CustomHashMap<String, WebSocket> connections = new CustomHashMap<>();
    private CustomHashMap<WebSocket, String> socketUserMap = new CustomHashMap<>();
    private CustomHashMap<String, String> loginTimes = new CustomHashMap<>();
    private CustomHashMap<String, CustomQueue<Message>> offlineQueue = new CustomHashMap<>();
    private CustomHashMap<String, CustomLinkedList<Message>> chatHistory = new CustomHashMap<>();
    private CustomHashMap<String, List<String>> contacts = new CustomHashMap<>();
    private CustomTree groups = new CustomTree("Root");
    
    private Gson gson = new Gson();

    public ChatServer(int port) {
        super(new InetSocketAddress(port));
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("New connection: " + conn.getRemoteSocketAddress());
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        handleDisconnect(conn);
    }

    @Override
    public void onMessage(WebSocket conn, String messageAsString) {
        try {
            String[] parts = messageAsString.split(":");
            String command = parts[0];
            String currentUser = socketUserMap.get(conn);

            switch (command) {
                case "LOGIN":
                    if (parts.length > 1) handleLogin(conn, parts[1]);
                    break;
                case "SEND":
                    handleSend(conn, currentUser, parts);
                    break;
                case "HISTORY":
                    String user2 = parts.length > 2 ? parts[2] : parts[1];
                    sendResponse(conn, "HISTORY_REPLY", Map.of("user", user2, "history", getHistoryList(currentUser, user2)));
                    break;
                case "ADD_CONTACT":
                    addContact(currentUser, parts[1]);
                    getContacts(conn, currentUser);
                    break;
                case "GET_CONTACTS":
                    getContacts(conn, currentUser);
                    break;
                case "ADMIN_DATA":
                    if ("admin".equals(currentUser)) {
                        broadcastAdminData();
                        sendAdminHistory(conn);
                    }
                    break;
                case "TYPING":
                    WebSocket receiverWs = connections.get(parts[1]);
                    if (receiverWs != null) {
                        sendResponse(receiverWs, "TYPING", Map.of("sender", currentUser));
                    }
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        ex.printStackTrace();
    }

    @Override
    public void onStart() {
        System.out.println("WebSocket server running on port " + getPort());
    }

    // --- Core Logic ---

    private void handleLogin(WebSocket ws, String username) {
        if (connections.containsKey(username)) {
            sendResponse(ws, "ERROR", Map.of("message", "Username already taken."));
            return;
        }

        connections.put(username, ws);
        socketUserMap.put(ws, username);
        loginTimes.put(username, Instant.now().toString());

        if (!contacts.containsKey(username)) contacts.put(username, new ArrayList<>());

        sendResponse(ws, "LOGIN_SUCCESS", Map.of("username", username));

        // Send queued offline messages
        if (offlineQueue.containsKey(username)) {
            CustomQueue<Message> queue = offlineQueue.get(username);
            while (!queue.isEmpty()) {
                sendResponse(ws, "RECEIVE_MSG", Map.of("message", queue.dequeue()));
            }
        }

        broadcastStatus(username, true);
        broadcastAdminData();
    }

    private void handleDisconnect(WebSocket ws) {
        String username = socketUserMap.get(ws);
        if (username != null) {
            connections.remove(username);
            socketUserMap.remove(ws);
            loginTimes.remove(username);
            broadcastStatus(username, false);
            broadcastAdminData();
        }
    }

    private void handleSend(WebSocket conn, String sender, String[] parts) {
        String receiver = parts[1];
        String content = String.join(":", Arrays.copyOfRange(parts, 2, parts.length));
        Message msg = new Message(sender, receiver, content, Instant.now().toString(), false);

        // Save History
        String key = getConversationKey(sender, receiver);
        if (!chatHistory.containsKey(key)) chatHistory.put(key, new CustomLinkedList<>());
        chatHistory.get(key).add(msg);

        // Update contacts implicitly
        addContact(sender, receiver);
        addContact(receiver, sender);

        // Route Message
        if (connections.containsKey(receiver)) {
            sendResponse(connections.get(receiver), "RECEIVE_MSG", Map.of("message", msg));
        } else {
            if (!offlineQueue.containsKey(receiver)) offlineQueue.put(receiver, new CustomQueue<>());
            offlineQueue.get(receiver).enqueue(msg);
        }

        // Confirm to sender
        sendResponse(conn, "MSG_DELIVERED", Map.of("message", msg));
        broadcastAdminData();
    }

    private void addContact(String user, String target) {
        if (!contacts.containsKey(user)) contacts.put(user, new ArrayList<>());
        if (!contacts.get(user).contains(target)) contacts.get(user).add(target);
    }

    private void broadcastStatus(String username, boolean isOnline) {
        String jsonMsg = gson.toJson(Map.of("type", "STATUS_UPDATE", "username", username, "isOnline", isOnline));
        for (WebSocket client : connections.values()) {
            client.send(jsonMsg);
        }
    }

    private void getContacts(WebSocket ws, String username) {
        List<Map<String, Object>> contactData = new ArrayList<>();
        List<String> userContacts = contacts.get(username);
        
        if (userContacts != null) {
            for (String c : userContacts) {
                Map<String, Object> data = new HashMap<>();
                data.put("username", c);
                data.put("isOnline", connections.containsKey(c));
                
                List<Message> history = getHistoryList(username, c);
                data.put("lastMessage", history.isEmpty() ? null : history.get(history.size() - 1));
                
                contactData.add(data);
            }
        }
        sendResponse(ws, "CONTACTS_REPLY", Map.of("contacts", contactData));
    }

    private void broadcastAdminData() {
        if (!connections.containsKey("admin")) return;
        
        AdminPayload payload = new AdminPayload();
        payload.tree = groups.getRoot();
        
        for (String user : connections.keys()) {
            payload.connections.add(new ConnectionData(user, loginTimes.get(user)));
            payload.hashMap.add(new HashMapData(user, connections.get(user).getRemoteSocketAddress().toString()));
        }
        
        for (String user : offlineQueue.keys()) {
            CustomQueue<Message> q = offlineQueue.get(user);
            if (!q.isEmpty()) {
                String content = q.peek().content;
                payload.queue.add(new QueueData(user, q.size(), content.length() > 20 ? content.substring(0, 20) : content));
            }
        }
        
        sendResponse(connections.get("admin"), "ADMIN_DATA_REPLY", Map.of("payload", payload));
    }

    private void sendAdminHistory(WebSocket ws) {
        List<Map<String, Object>> allHistory = new ArrayList<>();
        for (String key : chatHistory.keys()) {
            allHistory.add(Map.of(
                "users", key.split("_"),
                "messages", chatHistory.get(key).toList()
            ));
        }
        sendResponse(ws, "ADMIN_HISTORY_REPLY", Map.of("payload", allHistory));
    }

    // --- Helper Methods & Classes ---

    private void sendResponse(WebSocket ws, String type, Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>(data);
        response.put("type", type);
        ws.send(gson.toJson(response));
    }

    private String getConversationKey(String u1, String u2) {
        String[] arr = {u1, u2};
        Arrays.sort(arr);
        return arr[0] + "_" + arr[1];
    }
    
    private List<Message> getHistoryList(String u1, String u2) {
        CustomLinkedList<Message> list = chatHistory.get(getConversationKey(u1, u2));
        return list != null ? list.toList() : new ArrayList<>();
    }

    // Admin Dashboard POJOs
    static class AdminPayload {
        List<ConnectionData> connections = new ArrayList<>();
        List<HashMapData> hashMap = new ArrayList<>();
        List<QueueData> queue = new ArrayList<>();
        CustomTree.TreeNode tree;
    }
    static class ConnectionData {
        String username, timeConnected, status = "Online";
        ConnectionData(String u, String t) { username = u; timeConnected = t; }
    }
    static class HashMapData {
        String username, socketId, status = "Online";
        HashMapData(String u, String s) { username = u; socketId = s; }
    }
    static class QueueData {
        String username, preview; int count;
        QueueData(String u, int c, String p) { username = u; count = c; preview = p; }
    }

    public static void main(String[] args) {
        new ChatServer(8080).start();
    }
}
