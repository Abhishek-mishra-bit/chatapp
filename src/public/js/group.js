const baseUrl = window.location.origin;
const socket = io(window.location.origin);
const token = localStorage.getItem("token");
const parsed = parseJwt(token);
document.getElementById("createGroupBtn").addEventListener("click", async () => createGroup());
document.getElementById("addMemberBtn").addEventListener("click", () => addMembers());
document.getElementById("searchUserInput").addEventListener("input",(e)=> searchUserInput(e));
document.getElementById("confirmAddMembers").addEventListener("click",()=> confirmAddMembers());
document.getElementById("manageMembersBtn").addEventListener("click",()=>manageMembersBtn());
document.addEventListener("DOMContentLoaded", () => {
  getMyGroups();
});

// Open Modal and Load Users
async function createGroup() { 

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
};

// Handle Group Form Submission
document.getElementById("createGroupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("groupName").value;
  const checkboxes = document.querySelectorAll("#userList input:checked");
  const members = Array.from(checkboxes).map(cb => cb.value);

  try {
    const response = await axios.post("/group/create", { name, members }, {
      headers: { Authorization: token }
    });

    console.log("response create is", response);
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

    
    // 🔁 Join the socket room
    socket.emit("join-group", groupId);
    
    const adminCheck = await axios.get(`/group/${groupId}/is-admin`, {
      headers: { Authorization: token }
    });

    document.getElementById("addMemberBtn").style.display = adminCheck.data.isAdmin ? "inline-block" : "none";
    document.getElementById("manageMembersBtn").style.display = adminCheck.data.isAdmin ? "inline-block" : "none";


    res.data.forEach(msg => {
      const div = document.createElement("div");
      div.classList.add("message");
      
      const isMe = msg.senderId === currentUser;
      div.classList.add(isMe ? "you" : "other");

      div.textContent = `${msg.senderName}: ${msg.message}`;
      chatBox.appendChild(div);
    });

     // ✅ Real-time socket message listener
     socket.off("new-message").on("new-message", (data) => {
      if (data.groupId === groupId) {
        const div = document.createElement("div");
        div.classList.add("message");

        const isMe = data.senderId === currentUser;
        div.classList.add(isMe ? "you" : "other");

        div.textContent = `${data.senderName}: ${data.message}`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    });


    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error("Error loading messages", err);
    alert("Failed to load messages");
  }
}



async function sendMessage(e) {
  e.preventDefault();

  const messageInput = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");
  const message = messageInput.value.trim();
  const file = fileInput.files[0];

  if (!message && !file) return; // nothing to send

  const formData = new FormData();
  formData.append("groupId", activeGroupId);
  if (message) formData.append("message", message);
  if (file) formData.append("file", file);

  try {
    await axios.post(`/group/send-message`, formData, {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data"
      }
    });

    messageInput.value = "";
    fileInput.value = "";

  } catch (err) { 
    console.error("Error sending message", err);
    alert("Could not send message");
  }
}


async function addMembers(){  
  const modal = new bootstrap.Modal(document.getElementById("addMemberModal"));
  modal.show();
};


 async function searchUserInput(e) {
 
  const query = e.target.value.trim();
  if (!query || !activeGroupId) return;

  try {
    const res = await axios.get(`/group/search-users?q=${query}&groupId=${activeGroupId}`, {
      headers: { Authorization: token }
    });

    const results = res.data;
    const container = document.getElementById("searchResults");
    container.innerHTML = "";

    results.forEach(user => {
      const div = document.createElement("div");
      div.className = "form-check";
      div.innerHTML = `
        <input type="checkbox" class="form-check-input" value="${user._id}" id="add-${user._id}" />
        <label class="form-check-label" for="add-${user._id}">${user.name} (${user.email})</label>
      `;
      container.appendChild(div);
    })
  }catch (err) {
    console.error("User search error", err);
  }
};

 async function confirmAddMembers() {
  const checked = document.querySelectorAll("#searchResults input:checked");
  const selectedIds = Array.from(checked).map(cb => cb.value);

  for (let userId of selectedIds) {
    try {
      await axios.post(`/group/${activeGroupId}/add-member`, { userId }, {
        headers: { Authorization: token }
      });
    } catch (err) {
      console.error(`Failed to add ${userId}`, err);
    }
  }

  alert("Selected users added.");
  const modal = bootstrap.Modal.getInstance(document.getElementById("addMemberModal"));
  modal.hide();
  document.getElementById("searchUserInput").value = "";
  document.getElementById("searchResults").innerHTML = "";
};

// Show the modal when "Manage Members" is clicked
 async function manageMembersBtn() {
  const memberList = document.getElementById("memberList");
  memberList.innerHTML = "";

  try {
    const res = await axios.get(`/group/${activeGroupId}/members`, {
      headers: { Authorization: token }
    });

    const parsedToken = await parseJwt(token);
    
    const currentUserId = parsedToken.id;
    

    const members = res.data;
    
    members.forEach(member => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center bg-dark text-light border-info";
    
      const left = document.createElement("span");
      left.innerHTML = `<strong>${member.name}</strong> (${member.email}) ${member.isAdmin ? '<span class="badge bg-success ms-2">Admin</span>' : ''}`;
    
      const right = document.createElement("span");

      
      // Make sure we only show buttons for OTHER members
      const isMe = member.userId === currentUserId;

      if (!isMe) {
        const adminBtn = document.createElement("button");
        adminBtn.className = `btn btn-sm ${member.isAdmin ? 'btn-danger' : 'btn-success'}`;
        adminBtn.textContent = member.isAdmin ? 'Remove Admin' : 'Make Admin';
        adminBtn.addEventListener("click", () => toggleAdmin(member.userId, !member.isAdmin));

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-outline-danger ms-2";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => removeMember(member.userId));

        right.appendChild(adminBtn);
        right.appendChild(removeBtn);
      }
      const nameLabel = isMe ? "<strong>you</strong>" : `<strong>${member.name}</strong>`;
      left.innerHTML = `${nameLabel} (${member.email}) ${member.isAdmin ? '<span class="badge bg-success ms-2">Admin</span>' : ''}`;

    
      li.appendChild(left);
      li.appendChild(right);
      memberList.appendChild(li);
    });
    
    

    const modal = new bootstrap.Modal(document.getElementById("manageMembersModal"));
    modal.show();

  } catch (err) {
    console.error("Error loading members", err);
    alert("Failed to load members");
  }
};

// Toggle admin status
async function toggleAdmin(userId, makeAdmin) {
  try {
    await axios.patch(`/group/${activeGroupId}/update-admin`, {
      userId,
      makeAdmin
    }, {
      headers: { Authorization: token }
    });

    alert(`User ${makeAdmin ? 'promoted to' : 'demoted from'} admin.`);
    manageMembersBtn();
    } catch (err) {
    console.error("Failed to update admin status", err);
    alert("Failed to update admin status");
  }
}

async function removeMember(userId) {
  if (!confirm("Are you sure you want to remove this member from the group?")) return;

  try {
    await axios.delete(`/group/${activeGroupId}/remove-member`, {
      headers: { Authorization: token },
      data: { userId }
    });

    alert("User removed from group.");
    document.getElementById("manageMembersBtn").click(); // Reload modal
  } catch (err) {
    console.error("Failed to remove user", err);
    alert("Error removing user");
  }
}


