const baseUrl = window.location.origin;

window.addEventListener("DOMContentLoaded",()=>{
    fetchMessage();
    loadMessageFromLocalStorage();

})

async function sendMessage(){
    const token = localStorage.getItem("token")
    const msgInput = document.getElementById("messageInput")
    try{
        const response = await axios.post(`${baseUrl}/message/send`,
            {
                message: msgInput.value
            },
            {
                 headers:{      Authorization:token    }
            }
        );
        msgInput.value="";
        fetchMessage();
          
    }catch(err){
        console.error("Error sending message:", err);

    }
} 
async function fetchMessage() {
    const token = localStorage.getItem("token");
    try{
        const stored = JSON.parse(localStorage.getItem("messages")||"[]");

        const lastMessageId = stored.length > 0 ? stored[stored.length-1]._id : null;

        const response = await axios.get(`${baseUrl}/message/all`,{
            headers:{Authorization:token},
            params:{lastMessageId}

        });
        const newMessages = response.data.messages;
        
        saveMessageToLocalStorage(newMessages);
        loadMessageFromLocalStorage();
        
        
        
    }catch(err){
        console.error("Error fetching expense: " ,err);       
    }
}

function saveMessageToLocalStorage(messages){   
    try{
    const existing = JSON.parse(localStorage.getItem("messages")||"[]");
    const combined = [...existing, ...messages];

    const last10 = combined.slice(-10);
   
    
    localStorage.setItem("messages", JSON.stringify(last10));
    }catch(err){
        console.log("Error in saving localStorage", err);
    }
}

async function loadMessageFromLocalStorage() {   
    const token = localStorage.getItem("token"); 
    try{
        const stored = JSON.parse(localStorage.getItem("messages")|| "[]");

        const parsedToken = await parseJwt(token);
        const currentUser = parsedToken.id;      
       
        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML="";
        stored.forEach(msg => {
            const div = document.createElement("div");
            div.classList.add("message")

            if(msg.userId._id === currentUser){                
                
                div.classList.add("you");
            }else{
                div.classList.add("other")
            }

            div.innerHTML = `${msg.userId.name}:${msg.message}`;
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;

        });
        
    }catch(err){
        console.log("Error to load message from localStorage", err);
        

    }
}
