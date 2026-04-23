
import java.util.ArrayList;
import java.util.List;

public class CustomLinkedList<T> {
    private static class Node<T> {
        T data;
        Node<T> next;
        public Node(T data) {
            this.data = data;
        }
    }
    
    private Node<T> head, tail;
    private int size;
    
    public void add(T data) {
        Node<T> node = new Node<>(data);
        if (head == null) {
            head = node;
            tail = node;
        } else {
            tail.next = node;
            tail = node;
        }
        size++;
    }
    
    public List<T> toList() {
        List<T> list = new ArrayList<>();
        Node<T> curr = head;
        while (curr != null) {
            list.add(curr.data);
            curr = curr.next;
        }
        return list;
    }

    public int size() {
        return size;
    }
}
