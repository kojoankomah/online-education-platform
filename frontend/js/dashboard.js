/**
 * STUDENT DASHBOARD
 *
 * Responsibilities:
 *
 * 1. Check authentication
 * 2. Load logged-in user
 * 3. Display user information
 * 4. Handle logout
 *
 */


// Get stored JWT token

const token = localStorage.getItem("token");


// If no token exists,
// user is not authenticated

if(!token){

    window.location.href =
    "../auth/login.html";

}



// Retrieve saved user data

const user =
JSON.parse(
    localStorage.getItem("user")
);



if(user){


    document.getElementById(
        "studentName"
    ).textContent =
    user.name;


}



// Logout functionality

const logoutBtn =
document.getElementById("logoutBtn");



logoutBtn.addEventListener(
"click",
()=>{


    /*
    Remove authentication data
    */

    localStorage.removeItem("token");

    localStorage.removeItem("user");



    /*
    Return user to login
    */

    window.location.href =
    "../auth/login.html";


});