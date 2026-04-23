
import java.util.ArrayList;
import java.util.List;

public class CustomQueue<T> {
    private static class Node<T> {
        T data;
        Node<T> next;
        public Node(T data) {
            this.data = data;
        }
    }
    
    private Node<T> head, tail;
    private int size;
    
    public void enqueue(T data) {
        Node<T> node = new Node<>(data);
        if (tail != null) {
            tail.next = node;
        }
        tail = node;
        if (head == null) {
            head = tail;
        }
        size++;
    }
    
    public T dequeue() {
        if (head == null) return null;
        T data = head.data;
        head = head.next;
        if (head == null) tail = null;
        size--;
        return data;
    }
    
    public T peek() {
        if (head == null) return null;
        return head.data;
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    public int size() {
        return size;
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
}
