const token = getToken();

if (!token) {

    window.location.href =
        "../auth/login.html";

}


const user =
    JSON.parse(
        localStorage.getItem("user")
    );


if (
    user &&
    user.role !== "instructor"
) {

    window.location.href =
        "../dashboard/student-dashboard.html";

}


document
    .getElementById("courseForm")
    .addEventListener(
        "submit",
        createCourse
    );


async function createCourse(e) {

    e.preventDefault();


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    const title =
        document.getElementById(
            "title"
        ).value.trim();


    const description =
        document.getElementById(
            "description"
        ).value.trim();


    const imageInput =
        document.getElementById(
            "courseImage"
        );


    const image =
        imageInput.files[0];


    // ----------------------------
    // VALIDATE TITLE
    // ----------------------------

    if (!title) {

        showToast(
            "Course title is required.",
            "warning"
        );

        return;

    }


    // ----------------------------
    // VALIDATE IMAGE
    // ----------------------------

    if (image) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (
            !allowedTypes.includes(
                image.type
            )
        ) {

            showToast(
                "Only JPG, PNG, and WEBP images are allowed.",
                "warning"
            );

            return;

        }


        const maxSize =
            5 * 1024 * 1024;


        if (
            image.size > maxSize
        ) {

            showToast(
                "Course thumbnail must not exceed 5 MB.",
                "warning"
            );

            return;

        }

    }


    // ----------------------------
    // BUILD FORM DATA
    // ----------------------------

    const formData =
        new FormData();


    formData.append(
        "title",
        title
    );


    formData.append(
        "description",
        description
    );


    // Image is optional
    if (image) {

        formData.append(
            "image",
            image
        );

    }


    // Disable only after
    // validation passes
    button.disabled =
        true;

    button.textContent =
        "Creating...";


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.courses
                ),
                {
                    method: "POST",

                    // IMPORTANT:
                    // Do not set Content-Type here.
                    // Browser sets multipart/form-data
                    // automatically.
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        formData
                }
            );


        await handleApiResponse(
            response
        );


        setFlashToast(
            "Course created successfully!",
            "success"
        );


        window.location.href =
            "../dashboard/instructor-dashboard.html";

    }

    catch (error) {

        console.error(error);


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to create course.",
                "error"
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Create Course";

    }

}