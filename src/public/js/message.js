const baseUrl = window.location.origin;
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
        console.log("message saved", response.data);
        


    }catch(err){
        console.error("Error sending message:", err);

    }


}