
import java.util.ArrayList;
import java.util.List;

public class CustomHashMap<K, V> {
    private static class Entry<K, V> {
        K key;
        V value;
        Entry<K, V> next;
        
        public Entry(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }
    
    private Entry<K, V>[] buckets;
    private int size;
    
    @SuppressWarnings("unchecked")
    public CustomHashMap(int capacity) {
        buckets = new Entry[capacity];
    }
    
    public CustomHashMap() {
        this(16);
    }
    
    private int getIndex(K key) {
        return Math.abs(key.hashCode() % buckets.length);
    }
    
    public void put(K key, V value) {
        int index = getIndex(key);
        Entry<K, V> current = buckets[index];
        
        while (current != null) {
            if (current.key.equals(key)) {
                current.value = value;
                return;
            }
            current = current.next;
        }
        
        Entry<K, V> newEntry = new Entry<>(key, value);
        newEntry.next = buckets[index];
        buckets[index] = newEntry;
        size++;
    }
    
    public V get(K key) {
        int index = getIndex(key);
        Entry<K, V> current = buckets[index];
        
        while (current != null) {
            if (current.key.equals(key)) {
                return current.value;
            }
            current = current.next;
        }
        return null;
    }
    
    public void remove(K key) {
        int index = getIndex(key);
        Entry<K, V> current = buckets[index];
        Entry<K, V> prev = null;
        
        while (current != null) {
            if (current.key.equals(key)) {
                if (prev == null) {
                    buckets[index] = current.next;
                } else {
                    prev.next = current.next;
                }
                size--;
                return;
            }
            prev = current;
            current = current.next;
        }
    }

    public boolean containsKey(K key) {
        return get(key) != null;
    }

    public List<K> keys() {
        List<K> keyList = new ArrayList<>();
        for (Entry<K, V> bucket : buckets) {
            Entry<K, V> current = bucket;
            while (current != null) {
                keyList.add(current.key);
                current = current.next;
            }
        }
        return keyList;
    }

    public List<V> values() {
        List<V> valList = new ArrayList<>();
        for (Entry<K, V> bucket : buckets) {
            Entry<K, V> current = bucket;
            while (current != null) {
                valList.add(current.value);
                current = current.next;
            }
        }
        return valList;
    }
    
    public int size() {
        return size;
    }
}
