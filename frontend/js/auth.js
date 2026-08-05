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

    const button =
    event.target.querySelector("button");

    button.disabled = true;

    button.textContent = "Registering...";

    const user = {

        name:document.getElementById("name").value.trim(),

        email:document.getElementById("email").value.trim(),

        password:document.getElementById("password").value,

        role:document.getElementById("role").value

    };

    try{

        const response = await fetch(

            apiUrl(API.endpoints.register),

            {

                method:"POST",

                headers: jsonHeaders(),

                body:JSON.stringify(user)

            }

        );

        const data = await response.json();

        if(response.ok){

            alert("Account created successfully. Please login.");

            window.location.href="./login.html";

        }

        else{

            alert(data.message || data.error);

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to connect to the server.");

    }

    finally{

        button.disabled = false;

        button.textContent = "Register";

    }

}



/**
 * LOGIN USER
 * 
 * 1. Collect email and password
 * 2. Send credentials to backend
 * 3. Receive JWT token
 * 4. Store token
 * 5. Redirect based on role
 */


const loginForm = document.getElementById("loginForm");


if(loginForm){

    loginForm.addEventListener(
        "submit",
        loginUser
    );

}



async function loginUser(event){

    event.preventDefault();


        const button =
    event.target.querySelector("button");

    button.disabled = true;

    button.textContent = "Logging in...";

    const credentials = {

        email:
        document.getElementById("loginEmail").value.trim(),


        password:
        document.getElementById("loginPassword").value

    };


    try{


        const response = await fetch(

            apiUrl(API.endpoints.login),

            {

                method:"POST",

                headers: jsonHeaders(),


                body:
                JSON.stringify(credentials)

            }

        );



        const data = await response.json();



        if(response.ok){


            /*
            Save JWT token.
            This token will be attached
            to future protected requests.
            */

            localStorage.setItem(
                "token",
                data.token
            );



            /*
            Save user information.
            Useful for dashboards.
            */

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );



            alert(
                "Login successful!"
            );



            /*
            Redirect according to role
            */

            if(data.user.role === "student"){

                window.location.href =
                "../dashboard/student-dashboard.html";

            }


            else if(data.user.role === "instructor"){

                window.location.href =
                "../dashboard/instructor-dashboard.html";

            }

            else{
                alert("Unknown user role.");
            }
        }


        else{

            alert(
                data.message || data.error
            );

        }
    }

    catch(error){

        console.error(error);

        alert(
            "Unable to connect to the server."
        );
    }

    finally{

        button.disabled = false;

        button.textContent = "Login";

    }

}