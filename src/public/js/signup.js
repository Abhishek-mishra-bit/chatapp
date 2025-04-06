const baseUrl = window.location.origin;

 
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
         alert("User signed up successfully!");
    } catch (error) {
        console.error("Error during signup", error);
        alert("Signup failed!");
    }
}