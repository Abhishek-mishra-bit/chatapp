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
        
        alert("Successfuly logged in");
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