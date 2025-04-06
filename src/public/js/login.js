const baseUrl = window.location.origin;

const signup = document.getElementById("signup");
signup.addEventListener("click",()=>{
   window.location.href = `${baseUrl}/user/signup`;
})

async function submitFormHandler(event){
    console.log("submitFormHandler called");
    
    event.preventDefault();
    try{
        const data= {
            email: event.target.email.value,
            password: event.target.password.value        
        }
        
        const res = await axios.post(`${baseUrl}/users/login`, data);
        console.log("Response:", res);
        const token = res.data.token;
        localStorage.setItem("token", token);
        
        alert("Successfuly logged in");
        window.location.href = `${baseUrl}/chat/chatwindow`;
    } catch (error) {
        if(error.response && error.response.status === 404) {
            alert(error.response.data.message);
        }else if(error.response && error.response.status === 401) {
            alert(error.response.data.message);
        }
        else{
        console.error("Error during login", error);
        alert("Login failed!");
        }
    }
}