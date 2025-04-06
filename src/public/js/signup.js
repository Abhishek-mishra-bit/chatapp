const baseUrl = window.location.origin;
const signin = document.getElementById("signin");
signin.addEventListener("click",()=>{
   window.location.href = `${baseUrl}/users/login`;
})

 
 async function submitFormHandler(event){    
    event.preventDefault();
    try{
        const data= {
            name:event.target.name.value,
            email: event.target.email.value,
            phone: event.target.phone.value,
            password: event.target.password.value        
        }
        
        const res = await axios.post(`${baseUrl}/user/signup`, data);
        
        alert("Successfuly signed up");
        window.location.href = `${baseUrl}/users/login`;
    } catch (error) {
        if(error.response && error.response.status === 409) {
            alert(error.response.data.message);
        }else{
        console.error("Error during signup", error);
        alert("Signup failed!");
        }
    }
}