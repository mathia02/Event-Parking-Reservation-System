/* =========================================================
   Event & Parking Reservation System
   Reset Password
   ========================================================= */


let resetToken = null;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeResetPasswordPage();

        initializeResetPasswordForm();

        initializeResetPasswordToggles();
    }
);


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

function initializeResetPasswordPage() {

    resetToken =
        getResetPasswordToken();


    /*
     * User opened page without reset token
     */

    if (!resetToken) {

        showResetTokenError(
            "No password reset token was provided. Please request a new password reset link."
        );

        return;
    }


    /*
     * Valid token exists in URL.
     * Make sure form is visible.
     */

    showResetPasswordForm();
}


/* =========================================================
   GET TOKEN FROM URL
   ========================================================= */

function getResetPasswordToken() {

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
   SHOW RESET PASSWORD FORM
   ========================================================= */

function showResetPasswordForm() {

    const formSection =
        document.getElementById(
            "resetPasswordFormSection"
        );


    const successSection =
        document.getElementById(
            "resetPasswordSuccess"
        );


    const tokenErrorSection =
        document.getElementById(
            "resetPasswordTokenError"
        );


    if (formSection) {

        formSection.classList.remove(
            "hidden"
        );
    }


    if (successSection) {

        successSection.classList.add(
            "hidden"
        );
    }


    if (tokenErrorSection) {

        tokenErrorSection.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   INITIALIZE FORM
   ========================================================= */

function initializeResetPasswordForm() {

    const form =
        document.getElementById(
            "resetPasswordForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleResetPassword
    );
}


/* =========================================================
   HANDLE RESET PASSWORD
   ========================================================= */

async function handleResetPassword(
    event
) {

    event.preventDefault();


    clearResetPasswordMessage();

    clearResetPasswordValidation();


    // =====================================================
    // TOKEN REQUIRED
    // =====================================================

    if (!resetToken) {

        showResetTokenError(
            "This password reset link is invalid."
        );

        return;
    }


    const newPasswordInput =
        document.getElementById(
            "newPassword"
        );


    const confirmPasswordInput =
        document.getElementById(
            "confirmNewPassword"
        );


    if (
        !newPasswordInput ||
        !confirmPasswordInput
    ) {

        showResetPasswordMessage(
            "Reset password form is not configured correctly.",
            "error"
        );

        return;
    }


    const newPassword =
        newPasswordInput.value;


    const confirmPassword =
        confirmPasswordInput.value;


    // =====================================================
    // CLIENT VALIDATION
    // =====================================================

    const valid =
        validateResetPassword(
            newPassword,
            confirmPassword
        );


    if (!valid) {
        return;
    }


    setResetPasswordLoading(
        true
    );


    try {

        /*
         * Backend Endpoint:
         *
         * POST /api/Auth/reset-password
         *
         * Backend DTO:
         *
         * {
         *     token: "...",
         *     newPassword: "...",
         *     confirmPassword: "..."
         * }
         */

        const response =
            await apiPost(
                "/auth/reset-password",
                {
                    token:
                        resetToken,

                    newPassword:
                        newPassword,

                    confirmPassword:
                        confirmPassword
                }
            );


        const message =
            response?.message ||
            response?.data?.message ||
            "Password reset successfully. You can now login with your new password.";


        showResetPasswordSuccess(
            message
        );


        /*
         * Token is one-time use.
         * Clear local copy after success.
         */

        resetToken =
            null;


    } catch (error) {

        console.error(
            "Reset Password Error:",
            error
        );


        handleResetPasswordError(
            error
        );


    } finally {

        setResetPasswordLoading(
            false
        );
    }
}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateResetPassword(
    newPassword,
    confirmPassword
) {

    let valid = true;


    // =====================================================
    // NEW PASSWORD
    // =====================================================

    if (!newPassword) {

        showResetFieldError(
            "newPassword",
            "newPasswordError",
            "New password is required."
        );

        valid = false;

    }
    else if (
        newPassword.length < 8
    ) {

        showResetFieldError(
            "newPassword",
            "newPasswordError",
            "Password must contain at least 8 characters."
        );

        valid = false;
    }


    // =====================================================
    // CONFIRM PASSWORD
    // =====================================================

    if (!confirmPassword) {

        showResetFieldError(
            "confirmNewPassword",
            "confirmNewPasswordError",
            "Please confirm your new password."
        );

        valid = false;

    }
    else if (
        newPassword !==
        confirmPassword
    ) {

        showResetFieldError(
            "confirmNewPassword",
            "confirmNewPasswordError",
            "Passwords do not match."
        );

        valid = false;
    }


    return valid;
}


/* =========================================================
   FIELD ERROR
   ========================================================= */

function showResetFieldError(
    inputId,
    errorId,
    message
) {

    const input =
        document.getElementById(
            inputId
        );


    const errorElement =
        document.getElementById(
            errorId
        );


    if (input) {

        input.classList.add(
            "input-error"
        );
    }


    if (errorElement) {

        errorElement.textContent =
            message;
    }
}


/* =========================================================
   CLEAR VALIDATION
   ========================================================= */

function clearResetPasswordValidation() {

    const inputs =
    [
        "newPassword",
        "confirmNewPassword"
    ];


    inputs.forEach(
        function (inputId) {

            const input =
                document.getElementById(
                    inputId
                );


            if (input) {

                input.classList.remove(
                    "input-error"
                );
            }
        }
    );


    const errors =
    [
        "newPasswordError",
        "confirmNewPasswordError"
    ];


    errors.forEach(
        function (errorId) {

            const errorElement =
                document.getElementById(
                    errorId
                );


            if (errorElement) {

                errorElement.textContent =
                    "";
            }
        }
    );
}


/* =========================================================
   RESET PASSWORD ERROR HANDLING
   ========================================================= */

function handleResetPasswordError(
    error
) {

    const message =
        error?.message ||
        "Unable to reset your password.";


    /*
     * Backend currently returns 400 for:
     *
     * - Invalid reset token
     * - Expired reset token
     * - Already used reset token
     * - DTO validation errors
     */

    if (
        error?.status === 400 ||
        error?.status === 404 ||
        error?.status === 409
    ) {

        const normalizedMessage =
            String(message)
                .toLowerCase();


        /*
         * Password validation error should stay
         * inside the form.
         */

        if (
            normalizedMessage.includes(
                "password"
            ) &&
            !normalizedMessage.includes(
                "reset link"
            ) &&
            !normalizedMessage.includes(
                "token"
            )
        ) {

            showResetPasswordMessage(
                message,
                "error"
            );

            return;
        }


        /*
         * Token invalid / expired / already used.
         */

        showResetTokenError(
            message
        );

        return;
    }


    showResetPasswordMessage(
        message,
        "error"
    );
}


/* =========================================================
   FORM MESSAGE
   ========================================================= */

function showResetPasswordMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "resetPasswordMessage"
        );


    if (!element) {
        return;
    }


    element.className =
        "alert";


    if (
        type === "success"
    ) {

        element.classList.add(
            "alert-success"
        );

    }
    else {

        element.classList.add(
            "alert-error"
        );
    }


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );
}


/* =========================================================
   CLEAR MESSAGE
   ========================================================= */

function clearResetPasswordMessage() {

    const element =
        document.getElementById(
            "resetPasswordMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        "";


    element.className =
        "alert hidden";
}


/* =========================================================
   SUCCESS STATE
   ========================================================= */

function showResetPasswordSuccess(
    message
) {

    const formSection =
        document.getElementById(
            "resetPasswordFormSection"
        );


    const successSection =
        document.getElementById(
            "resetPasswordSuccess"
        );


    const tokenErrorSection =
        document.getElementById(
            "resetPasswordTokenError"
        );


    if (formSection) {

        formSection.classList.add(
            "hidden"
        );
    }


    if (tokenErrorSection) {

        tokenErrorSection.classList.add(
            "hidden"
        );
    }


    if (successSection) {

        successSection.classList.remove(
            "hidden"
        );
    }


    /*
     * Optional success message element.
     */

    const successMessage =
        document.getElementById(
            "resetPasswordSuccessMessage"
        );


    if (successMessage) {

        successMessage.textContent =
            message ||
            "Password reset successfully. You can now login.";
    }
}


/* =========================================================
   TOKEN ERROR STATE
   ========================================================= */

function showResetTokenError(
    message
) {

    const formSection =
        document.getElementById(
            "resetPasswordFormSection"
        );


    const successSection =
        document.getElementById(
            "resetPasswordSuccess"
        );


    const tokenErrorSection =
        document.getElementById(
            "resetPasswordTokenError"
        );


    const messageElement =
        document.getElementById(
            "resetTokenErrorMessage"
        );


    if (formSection) {

        formSection.classList.add(
            "hidden"
        );
    }


    if (successSection) {

        successSection.classList.add(
            "hidden"
        );
    }


    if (messageElement) {

        messageElement.textContent =
            message;
    }


    if (tokenErrorSection) {

        tokenErrorSection.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   BUTTON LOADING
   ========================================================= */

function setResetPasswordLoading(
    loading
) {

    const button =
        document.getElementById(
            "resetPasswordButton"
        );


    if (!button) {
        return;
    }


    button.disabled =
        loading;


    button.textContent =
        loading
            ? "Resetting Password..."
            : "Reset Password";
}


/* =========================================================
   PASSWORD TOGGLES
   ========================================================= */

function initializeResetPasswordToggles() {

    setupResetPasswordToggle(
        "newPassword",
        "newPasswordToggle"
    );


    setupResetPasswordToggle(
        "confirmNewPassword",
        "confirmNewPasswordToggle"
    );
}


function setupResetPasswordToggle(
    inputId,
    buttonId
) {

    const input =
        document.getElementById(
            inputId
        );


    const button =
        document.getElementById(
            buttonId
        );


    if (
        !input ||
        !button
    ) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            const hidden =
                input.type ===
                "password";


            input.type =
                hidden
                    ? "text"
                    : "password";


            button.textContent =
                hidden
                    ? "Hide"
                    : "Show";
        }
    );
}