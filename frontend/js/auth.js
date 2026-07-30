/**
 * Authentication Script
 * Handles:
 * - User Registration
 * - User Login
 */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", registerUser);

}

async function registerUser(event){

    event.preventDefault();

    const user = {

        name:document.getElementById("name").value,

        email:document.getElementById("email").value,

        password:document.getElementById("password").value,

        role:document.getElementById("role").value

    };

    try{

        const response = await fetch(

            apiUrl(API.endpoints.register),

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(user)

            }

        );

        const data = await response.json();

        if(response.ok){

            alert("Registration successful!");

            window.location.href="login.html";

        }

        else{

            alert(data.message || data.error);

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to connect to the server.");

    }

}