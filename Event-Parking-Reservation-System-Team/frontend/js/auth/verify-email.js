/* =========================================================
   Event & Parking Reservation System
   Email Verification
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeVerificationPage();

        initializeResendForm();
    }
);


/* =========================================================
   START VERIFICATION
   ========================================================= */

function initializeVerificationPage() {

    initializeVerificationButtons();


    const token =
        getVerificationToken();


    // Token இல்லாமல் page open செய்தால்
    if (!token) {

        showVerificationError(
            "No verification token was provided. Please use the verification link sent to your email."
        );

        return;
    }


    verifyEmailToken(
        token
    );
}


/* =========================================================
   GET TOKEN FROM URL

   Example:
   verify-email.html?token=abc123
   ========================================================= */

function getVerificationToken() {

    const parameters =
        new URLSearchParams(
            window.location.search
        );


    const token =
        parameters.get(
            "token"
        );


    if (!token) {
        return null;
    }


    return token.trim();
}


/* =========================================================
   VERIFY EMAIL
   ========================================================= */

async function verifyEmailToken(
    token
) {

    showVerificationLoading();


    try {

        /*
         * Current Backend Endpoint:
         *
         * POST /api/Auth/verify-email
         *
         * Request:
         * {
         *     token: "..."
         * }
         */

        const response =
            await apiPost(
                "/auth/verify-email",
                {
                    token: token
                }
            );


        const message =
            response?.message ||
            response?.data?.message ||
            "Email verified successfully. You can now login.";


        // Registration temporary data no longer needed
        sessionStorage.removeItem(
            "pendingVerificationEmail"
        );


        sessionStorage.removeItem(
            "pendingVerificationCustomerId"
        );


        showVerificationSuccess(
            message
        );


    } catch (error) {

        console.error(
            "Email Verification Error:",
            error
        );


        handleVerificationError(
            error
        );
    }
}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function handleVerificationError(
    error
) {

    const serverMessage =
        error?.message ||
        "";


    let message =
        serverMessage ||
        "This verification link is invalid or has expired.";


    // Bad / expired token
    if (
        error?.status === 400
    ) {

        message =
            serverMessage ||
            "This verification link is invalid or has expired.";
    }


    // Token not found
    if (
        error?.status === 404
    ) {

        message =
            serverMessage ||
            "The verification token could not be found.";
    }


    // Already processed
    if (
        error?.status === 409
    ) {

        message =
            serverMessage ||
            "This verification link has already been used.";
    }


    showVerificationError(
        message
    );
}


/* =========================================================
   STATE MANAGEMENT
   ========================================================= */

function hideAllVerificationStates() {

    const stateIds =
    [
        "verificationLoading",
        "verificationSuccess",
        "verificationError",
        "resendVerificationSection"
    ];


    stateIds.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.classList.add(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showVerificationLoading() {

    hideAllVerificationStates();


    const loading =
        document.getElementById(
            "verificationLoading"
        );


    if (loading) {

        loading.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   SUCCESS STATE
   ========================================================= */

function showVerificationSuccess(
    message
) {

    hideAllVerificationStates();


    const success =
        document.getElementById(
            "verificationSuccess"
        );


    if (success) {

        success.classList.remove(
            "hidden"
        );
    }


    /*
     * HTML-ல் optional message element இருந்தால்
     * அதில் backend message காட்டும்.
     */

    const successMessage =
        document.getElementById(
            "verificationSuccessMessage"
        );


    if (successMessage) {

        successMessage.textContent =
            message ||
            "Email verified successfully. You can now login.";
    }
}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showVerificationError(
    message
) {

    hideAllVerificationStates();


    const errorSection =
        document.getElementById(
            "verificationError"
        );


    const errorMessage =
        document.getElementById(
            "verificationErrorMessage"
        );


    if (errorMessage) {

        errorMessage.textContent =
            message;
    }


    if (errorSection) {

        errorSection.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   BUTTONS
   ========================================================= */

function initializeVerificationButtons() {

    const showResendButton =
        document.getElementById(
            "showResendButton"
        );


    const backButton =
        document.getElementById(
            "backToVerificationError"
        );


    if (showResendButton) {

        showResendButton.addEventListener(
            "click",
            showResendVerificationForm
        );
    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                showVerificationError(
                    "This verification link may be invalid or expired."
                );
            }
        );
    }
}


/* =========================================================
   SHOW RESEND FORM

   Resend backend endpoint will be implemented NEXT.
   ========================================================= */

function showResendVerificationForm() {

    hideAllVerificationStates();


    clearResendMessage();

    clearResendValidation();


    const section =
        document.getElementById(
            "resendVerificationSection"
        );


    if (section) {

        section.classList.remove(
            "hidden"
        );
    }


    /*
     * Automatically fill registered email
     * when available.
     */

    const resendEmailInput =
        document.getElementById(
            "resendEmail"
        );


    const pendingEmail =
        sessionStorage.getItem(
            "pendingVerificationEmail"
        );


    if (
        resendEmailInput &&
        pendingEmail
    ) {

        resendEmailInput.value =
            pendingEmail;
    }
}


/* =========================================================
   INITIALIZE RESEND FORM
   ========================================================= */

function initializeResendForm() {

    const form =
        document.getElementById(
            "resendVerificationForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleResendVerification
    );
}


/* =========================================================
   RESEND VERIFICATION

   NOTE:
   Backend endpoint will be created in next fixed step.
   ========================================================= */

async function handleResendVerification(
    event
) {

    event.preventDefault();


    clearResendMessage();

    clearResendValidation();


    const emailInput =
        document.getElementById(
            "resendEmail"
        );


    if (!emailInput) {

        showResendMessage(
            "Email field could not be found.",
            "error"
        );

        return;
    }


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    if (
        !validateResendEmail(
            email
        )
    ) {

        return;
    }


    setResendLoading(
        true
    );


    try {

        /*
         * NEXT backend endpoint:
         *
         * POST /api/Auth/resend-verification
         */

        await apiPost(
            "/auth/resend-verification",
            {
                email: email
            }
        );


        showResendMessage(
            "A new verification email has been sent. Please check your inbox.",
            "success"
        );


        const form =
            document.getElementById(
                "resendVerificationForm"
            );


        if (form) {

            form.reset();
        }


    } catch (error) {

        showResendMessage(
            error?.message ||
            "Unable to send a new verification email. Please try again.",
            "error"
        );


    } finally {

        setResendLoading(
            false
        );
    }
}


/* =========================================================
   VALIDATE EMAIL
   ========================================================= */

function validateResendEmail(
    email
) {

    const input =
        document.getElementById(
            "resendEmail"
        );


    const errorElement =
        document.getElementById(
            "resendEmailError"
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

function clearResendValidation() {

    const input =
        document.getElementById(
            "resendEmail"
        );


    const errorElement =
        document.getElementById(
            "resendEmailError"
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
   RESEND MESSAGE
   ========================================================= */

function showResendMessage(
    message,
    type
) {

    const messageElement =
        document.getElementById(
            "resendMessage"
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
   CLEAR RESEND MESSAGE
   ========================================================= */

function clearResendMessage() {

    const messageElement =
        document.getElementById(
            "resendMessage"
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
   RESEND BUTTON LOADING
   ========================================================= */

function setResendLoading(
    loading
) {

    const button =
        document.getElementById(
            "resendButton"
        );


    if (!button) {
        return;
    }


    button.disabled =
        loading;


    button.textContent =
        loading
            ? "Sending..."
            : "Send Verification Email";
}