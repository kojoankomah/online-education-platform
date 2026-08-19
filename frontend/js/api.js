/**
 * ===========================================
 * API Configuration
 * ===========================================
 *
 * All backend URLs are defined here.
 * If the backend URL changes after deployment,
 * only BASE_URL needs to be updated.
 */

const API = {

    BASE_URL:
        "https://eduplatform-api-7nax.onrender.com/api",

    endpoints: {

        login:
            "/auth/login",

        register:
            "/auth/register",

        studentDashboard:
            "/dashboard/student",

        instructorDashboard:
            "/dashboard/instructor",

        courses:
            "/courses",

        lessons:
            "/lessons",

        quizzes:
            "/quizzes",

        progress:
            "/progress",

        chapters:
            "/chapters",

        chapterContent:
            "/chapter-content"

    }

};



/**
 * Build a full API URL.
 *
 * Example:
 * apiUrl(API.endpoints.login)
 *
 * Result:
 * http://localhost:5000/api/auth/login
 */
function apiUrl(endpoint) {

    return `${API.BASE_URL}${endpoint}`;

}



/**
 * Retrieve the saved JWT token.
 */
function getToken() {

    return localStorage.getItem(
        "token"
    );

}



/**
 * Standard headers for
 * authenticated JSON requests.
 */
function authHeaders() {

    return {

        "Authorization":
            `Bearer ${getToken()}`,

        "Content-Type":
            "application/json"

    };

}



/**
 * Standard headers for
 * public JSON requests.
 */
function jsonHeaders() {

    return {

        "Content-Type":
            "application/json"

    };

}



/**
 * Handle responses from protected
 * backend API endpoints.
 */
async function handleApiResponse(response) {

    let data = {};


    try {

        data =
            await response.json();

    }

    catch (error) {

        // Some successful responses
        // may not contain JSON.
        data = {};

    }


    /**
     * Invalid or expired session
     */
    if (response.status === 401) {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        setFlashToast(
            data.message ||
            data.error ||
            "Your session has expired. Please log in again.",
            "warning"
        );


        window.location.href =
            "../auth/login.html";


        const error =
            new Error(
                "Authentication required"
            );


        error.status = 401;


        throw error;

    }


    /**
     * Other unsuccessful requests
     */
    if (!response.ok) {

        const error =
            new Error(
                data.message ||
                data.error ||
                "Request failed."
            );


        error.status =
            response.status;


        throw error;

    }


    return data;

}



/**
 * Ensure that a user has
 * an authentication token.
 */
function requireAuth() {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "../auth/login.html";

    }

}



/**
 * Log the current user out.
 */
function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "../auth/login.html";

}