/* =========================================================
   Event & Parking Reservation System
   Forgot Password
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeForgotPasswordForm();
    }
);


/* =========================================================
   INITIALIZE FORM
   ========================================================= */

function initializeForgotPasswordForm() {

    const form =
        document.getElementById(
            "forgotPasswordForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleForgotPassword
    );
}


/* =========================================================
   HANDLE SUBMIT
   ========================================================= */

async function handleForgotPassword(
    event
) {

    event.preventDefault();


    clearForgotPasswordMessage();

    clearForgotPasswordValidation();


    const emailInput =
        document.getElementById(
            "email"
        );


    if (!emailInput) {

        showForgotPasswordMessage(
            "Forgot password form is not configured correctly.",
            "error"
        );

        return;
    }


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    if (
        !validateForgotPasswordEmail(
            email
        )
    ) {

        return;
    }


    setForgotPasswordLoading(
        true
    );


    try {

        /*
         * Backend Endpoint:
         *
         * POST /api/Auth/forgot-password
         *
         * Request:
         *
         * {
         *     email: "customer@gmail.com"
         * }
         */

        const response =
            await apiPost(
                "/auth/forgot-password",
                {
                    email: email
                }
            );


        /*
         * Backend intentionally returns
         * a generic message for security.
         */

        const message =
            response?.message ||
            response?.data?.message ||
            "If an active account exists for this email, a password reset link has been sent.";


        showForgotPasswordMessage(
            message,
            "success"
        );


        const form =
            document.getElementById(
                "forgotPasswordForm"
            );


        if (form) {

            form.reset();
        }


    } catch (error) {

        console.error(
            "Forgot Password Error:",
            error
        );


        showForgotPasswordMessage(
            error?.message ||
            "Unable to process your request. Please try again.",
            "error"
        );


    } finally {

        setForgotPasswordLoading(
            false
        );
    }
}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function validateForgotPasswordEmail(
    email
) {

    const input =
        document.getElementById(
            "email"
        );


    const errorElement =
        document.getElementById(
            "emailError"
        );


    if (!email) {

        if (input) {

            input.classList.add(
                "input-error"
            );
        }


        if (errorElement) {

            errorElement.textContent =
                "Email address is required.";
        }


        return false;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        if (input) {

            input.classList.add(
                "input-error"
            );
        }


        if (errorElement) {

            errorElement.textContent =
                "Please enter a valid email address.";
        }


        return false;
    }


    return true;
}


/* =========================================================
   CLEAR VALIDATION
   ========================================================= */

function clearForgotPasswordValidation() {

    const input =
        document.getElementById(
            "email"
        );


    const errorElement =
        document.getElementById(
            "emailError"
        );


    if (input) {

        input.classList.remove(
            "input-error"
        );
    }


    if (errorElement) {

        errorElement.textContent =
            "";
    }
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showForgotPasswordMessage(
    message,
    type
) {

    const messageElement =
        document.getElementById(
            "forgotPasswordMessage"
        );


    if (!messageElement) {
        return;
    }


    messageElement.className =
        "alert";


    if (
        type === "success"
    ) {

        messageElement.classList.add(
            "alert-success"
        );

    }
    else {

        messageElement.classList.add(
            "alert-error"
        );
    }


    messageElement.textContent =
        message;


    messageElement.classList.remove(
        "hidden"
    );
}


/* =========================================================
   CLEAR MESSAGE
   ========================================================= */

function clearForgotPasswordMessage() {

    const messageElement =
        document.getElementById(
            "forgotPasswordMessage"
        );


    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        "";


    messageElement.className =
        "alert hidden";
}


/* =========================================================
   BUTTON LOADING
   ========================================================= */

function setForgotPasswordLoading(
    loading
) {

    const button =
        document.getElementById(
            "forgotPasswordButton"
        );


    if (!button) {
        return;
    }


    button.disabled =
        loading;


    button.textContent =
        loading
            ? "Sending..."
            : "Send Reset Link";
}