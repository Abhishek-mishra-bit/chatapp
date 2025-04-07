const baseUrl = window.location.origin;

window.onload=()=>{
    fetchMessage();
}

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
        const response = await axios.get(`${baseUrl}/message/all`,{
            headers:{Authorization:token}
        });
        const messages = response.data.messages;
        
        
        const parsedToken = await parseJwt(token);
        const currentUser = parsedToken.id;
        
       
        

        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML="";
        messages.forEach(msg => {
            const div = document.createElement("div");
            div.classList.add("message")

            if(msg.userId._id === currentUser){                
                
                div.classList.add("you");
            }else{
                div.classList.add("other")
            }

            div.innerHTML = `${msg.userId.name}:${msg.message}`;
            chatBox.appendChild(div);
        });
    }catch(err){
        console.error("Error fetching expense: " ,err);
        

    }
}
