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



function requireAuth(){

    const token = getToken();

    if(!token){

        window.location.href =
        "../auth/login.html";

    }

}



function logout(){

    localStorage.removeItem("token");

    window.location.href =
    "../auth/login.html";

}