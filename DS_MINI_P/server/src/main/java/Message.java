
public class Message {
    public String sender;
    public String receiver;
    public String content;
    public String timestamp;
    public boolean isGroup;

    public Message(String sender, String receiver, String content, String timestamp, boolean isGroup) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = timestamp;
        this.isGroup = isGroup;
    }
}
