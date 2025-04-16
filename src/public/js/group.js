const token = localStorage.getItem("token");
const parsed = parseJwt(token);
// const isMe = msg.sender._id === parsed.id;
const baseUrl = window.location.origin;
console.log("group is hitting");


document.addEventListener("DOMContentLoaded", () => {
  getMyGroups();
});

// Open Modal and Load Users
document.getElementById("createGroupBtn").addEventListener("click", async () => {
  try {
    const res = await axios.get("/user/all", {
      headers: { Authorization: token }
    });

    const users = res.data;
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    users.forEach(user => {
      const checkbox = document.createElement("div");
      checkbox.className = "form-check";
      checkbox.innerHTML = `
        <input type="checkbox" class="form-check-input" value="${user._id}" id="user-${user._id}" />
        <label class="form-check-label" for="user-${user._id}">${user.name}</label>
      `;
      userList.appendChild(checkbox);
    });

    // Open modal
    const modal = new bootstrap.Modal(document.getElementById("createGroupModal"));
    modal.show();

  } catch (err) {
    console.error("Failed to load users", err);
    alert("Error loading users");
  }
});

// Handle Group Form Submission
document.getElementById("createGroupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("groupName").value;
  const checkboxes = document.querySelectorAll("#userList input:checked");
  const members = Array.from(checkboxes).map(cb => cb.value);

  try {
    await axios.post("/group/create", { name, members }, {
      headers: { Authorization: token }
    });

    alert("Group created successfully!");
    document.getElementById("createGroupForm").reset();

    // Close modal
    const modalEl = document.getElementById("createGroupModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // Refresh group list
    getMyGroups();

  } catch (err) {
    console.error("Group creation failed", err);
    alert("Error creating group");
  }
});
async function getMyGroups() {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get("/group/mine", {
      headers: { Authorization: token }
    });
    console.log("res.data", res.data)
    const groups = res.data;
    const groupList = document.getElementById("groupList");
    groupList.innerHTML = "";

    groups.forEach(group => {
      const li = document.createElement("li");
      li.textContent = group.name;
      li.className = "group-item";
      li.setAttribute("data-group-id", group._id);

     
      li.addEventListener("click", () => {        
        activeGroupId = group.id;
        console.log(activeGroupId);
        loadGroupMessages(activeGroupId);
        document.querySelectorAll(".group-item").forEach(item => {
          item.classList.remove("active");
        });
        li.classList.add("active");
        
      });

      groupList.appendChild(li);
    });

  } catch (err) {
    console.error("Error fetching groups", err);
    alert("Could not load your groups");
  }
}

let activeGroupId = null;
async function loadGroupMessages(groupId) {
  try {
    const res = await axios.get(`/group/${groupId}/messages`, {
      headers: { Authorization: token }
    });
      
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    const parsedToken = await parseJwt(token);
    const currentUser = parsedToken.id;  

    res.data.forEach(msg => {
      const div = document.createElement("div");
      div.classList.add("message");
      
      const isMe = msg.senderId === currentUser;
      div.classList.add(isMe ? "you" : "other");

      div.textContent = `${msg.senderName}: ${msg.message}`;
      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error("Error loading messages", err);
    alert("Failed to load messages");
  }
}



async function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!message || !activeGroupId) return;

  try {
    await axios.post(`/group/send-message`, {
      message,
      groupId: activeGroupId
    }, {
      headers: { Authorization: token }
    });

    messageInput.value = ""; // Clear input
    loadGroupMessages(activeGroupId); // Reload chat

  } catch (err) {
    console.error("Error sending message", err);
    alert("Could not send message");
  }
}


