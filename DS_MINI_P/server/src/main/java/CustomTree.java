
import java.util.ArrayList;
import java.util.List;

public class CustomTree {
    public static class TreeNode {
        public String name;
        public List<TreeNode> children;
        public List<String> members;
        
        public TreeNode(String name) {
            this.name = name;
            this.children = new ArrayList<>();
            this.members = new ArrayList<>();
        }
    }
    
    private TreeNode root;
    
    public CustomTree(String rootName) {
        this.root = new TreeNode(rootName);
    }
    
    public TreeNode getRoot() {
        return root;
    }
    
    public TreeNode findNode(TreeNode current, String name) {
        if (current.name.equals(name)) return current;
        for (TreeNode child : current.children) {
            TreeNode found = findNode(child, name);
            if (found != null) return found;
        }
        return null;
    }
    
    public boolean addGroup(String name, String parentName) {
        TreeNode parent = findNode(root, parentName != null ? parentName : "Root");
        if (parent != null) {
            for (TreeNode child : parent.children) {
                if (child.name.equals(name)) return false;
            }
            parent.children.add(new TreeNode(name));
            return true;
        }
        return false;
    }
    
    public boolean addMember(String groupName, String username) {
        TreeNode group = findNode(root, groupName);
        if (group != null && !group.members.contains(username)) {
            group.members.add(username);
            return true;
        }
        return false;
    }
    
    public List<String> getMembers(String groupName) {
        TreeNode group = findNode(root, groupName);
        return group != null ? group.members : new ArrayList<>();
    }
}
