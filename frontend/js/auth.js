/**
 * Authentication Script
 *
 * Handles:
 * - User registration
 * - User login
 */


/**
 * Handle responses from public
 * authentication endpoints.
 *
 * Unlike handleApiResponse(),
 * this does NOT redirect on 401.
 */
async function handleAuthResponse(response) {

    let data = {};

    try {

        data =
            await response.json();

    }

    catch (error) {

        data = {};

    }


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
 * REGISTER USER
 */
const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        registerUser
    );

}



/**
 * Register a new user
 */
async function registerUser(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const email =
        document.getElementById(
            "email"
        ).value.trim();


    // Do not trim passwords
    const password =
        document.getElementById(
            "password"
        ).value;


    const role =
        document.getElementById(
            "role"
        ).value;


    // Validate before disabling button
    if (
        !name ||
        !email ||
        !password ||
        !role
    ) {

        alert(
            "Please complete all required fields."
        );

        return;

    }


    if (
        !["student", "instructor"]
            .includes(role)
    ) {

        alert(
            "Please select a valid role."
        );

        return;

    }


    const button =
        event.target.querySelector(
            "button"
        );


    button.disabled =
        true;

    button.textContent =
        "Registering...";


    const user = {
        name,
        email,
        password,
        role
    };


    try {

        const response = await fetch(
            apiUrl(
                API.endpoints.register
            ),
            {
                method: "POST",

                headers:
                    jsonHeaders(),

                body:
                    JSON.stringify(
                        user
                    )
            }
        );


        await handleAuthResponse(
            response
        );


        alert(
            "Account created successfully. Please login."
        );


        window.location.href =
            "./login.html";

    }

    catch (error) {

        console.error(error);


        if (error.status) {

            alert(
                error.message ||
                "Registration failed."
            );

        }

        else {

            alert(
                "Unable to connect to the server."
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Register";

    }

}



/**
 * LOGIN USER
 */
const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        loginUser
    );

}



/**
 * Login an existing user
 */
async function loginUser(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    // Do not trim passwords
    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    // Validate before disabling button
    if (
        !email ||
        !password
    ) {

        alert(
            "Please enter your email and password."
        );

        return;

    }


    const button =
        event.target.querySelector(
            "button"
        );


    button.disabled =
        true;

    button.textContent =
        "Logging in...";


    const credentials = {
        email,
        password
    };


    try {

        const response = await fetch(
            apiUrl(
                API.endpoints.login
            ),
            {
                method: "POST",

                headers:
                    jsonHeaders(),

                body:
                    JSON.stringify(
                        credentials
                    )
            }
        );


        const data =
            await handleAuthResponse(
                response
            );


        // Validate expected login response
        if (
            !data.token ||
            !data.user
        ) {

            throw new Error(
                "Invalid login response from server."
            );

        }


        /*
         * Store JWT token.
         * Protected requests use this token.
         */
        localStorage.setItem(
            "token",
            data.token
        );


        /*
         * Store basic user information.
         */
        localStorage.setItem(
            "user",
            JSON.stringify(
                data.user
            )
        );


        // Redirect according to role
        if (
            data.user.role ===
            "student"
        ) {

            alert(
                "Login successful!"
            );


            window.location.href =
                "../dashboard/student-dashboard.html";

        }

        else if (
            data.user.role ===
            "instructor"
        ) {

            alert(
                "Login successful!"
            );


            window.location.href =
                "../dashboard/instructor-dashboard.html";

        }

        else {

            // Do not leave an invalid
            // authenticated session behind
            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            throw new Error(
                "Unknown user role."
            );

        }

    }

    catch (error) {

        console.error(error);


        if (error.status) {

            alert(
                error.message ||
                "Login failed."
            );

        }

        else {

            alert(
                error.message ===
                "Unknown user role." ||
                error.message ===
                "Invalid login response from server."
                    ? error.message
                    : "Unable to connect to the server."
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Login";

    }

}