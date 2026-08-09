/**
 * ===========================================
 * API Configuration
 * -------------------------------------------
 * All backend URLs are defined here.
 * If the backend URL changes (e.g., after
 * deployment), only this file needs updating.
 * ===========================================
 */

const API = {
    BASE_URL: "http://localhost:5000/api",

    endpoints: {
        login: "/auth/login",
        register: "/auth/register",
        studentDashboard: "/dashboard/student",
        instructorDashboard: "/dashboard/instructor",
        courses: "/courses",
        lessons: "/lessons",
        quizzes: "/quizzes",
        progress: "/progress"
    }
};

/**
 * Build a full API URL.
 * Example:
 * apiUrl(API.endpoints.login)
 * → http://localhost:5000/api/auth/login
 */
function apiUrl(endpoint) {
    return `${API.BASE_URL}${endpoint}`;
}

/**
 * Retrieve the saved JWT token.
 */
function getToken() {
    return localStorage.getItem("token");
}

/**
 * Standard headers for authenticated requests.
 */
function authHeaders() {

    return {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json"
    };

}


async function handleApiResponse(response){

    let data = {};

    try{

        data = await response.json();

    }
    catch(error){

        data = {};

    }


    // Invalid or expired session
    if(response.status === 401){

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert(
            data.message ||
            data.error ||
            "Your session has expired. Please log in again."
        );

        window.location.href =
        "../auth/login.html";

        throw new Error(
            "Authentication required"
        );
    }


    // Other failed requests
    if(!response.ok){

        throw new Error(
            data.message ||
            data.error ||
            "Request failed"
        );

    }


    return data;
}



/// Standard headers for JSON requests
function jsonHeaders(){

    return {

        "Content-Type":
        "application/json"

    };

}



//Reusable response handler (Ensure the user is authenticated)
async function handleApiResponse(response){

    let data = {};

    try{

        data = await response.json();

    }
    catch(error){

        data = {};

    }


    // Invalid or expired session
    if(response.status === 401){

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert(
            data.message ||
            data.error ||
            "Your session has expired. Please log in again."
        );

        window.location.href =
        "../auth/login.html";

        const error = new Error(
            "Authentication required"
        );

        error.status = 401;

        throw error;
    }


    // Other failed requests
    if(!response.ok){

        const error = new Error(
            data.message ||
            data.error ||
            "Request failed"
        );

        error.status = response.status;

        throw error;
    }


    return data;
}


/// Ensure the user is authenticated
function requireAuth(){

    const token = getToken();

    if(!token){

        window.location.href =
        "../auth/login.html";

    }

}



function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
    "../auth/login.html";
}