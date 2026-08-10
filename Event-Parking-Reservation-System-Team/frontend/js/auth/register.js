/* =========================================================
   Event & Parking Reservation System
   Customer Registration
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeRegisterForm();

        initializePasswordToggles();
    }
);


/* =========================================================
   INITIALIZE FORM
   ========================================================= */

function initializeRegisterForm() {

    const registerForm =
        document.getElementById(
            "registerForm"
        );


    if (!registerForm) {
        return;
    }


    registerForm.addEventListener(
        "submit",
        handleRegistration
    );
}


/* =========================================================
   HANDLE REGISTRATION
   ========================================================= */

async function handleRegistration(event) {

    event.preventDefault();


    clearRegisterMessage();

    clearValidationErrors();


    const fullNameInput =
        document.getElementById(
            "fullName"
        );


    const emailInput =
        document.getElementById(
            "email"
        );


    const phoneInput =
        document.getElementById(
            "phone"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const confirmPasswordInput =
        document.getElementById(
            "confirmPassword"
        );


    if (
        !fullNameInput ||
        !emailInput ||
        !phoneInput ||
        !passwordInput ||
        !confirmPasswordInput
    ) {

        showRegisterMessage(
            "Registration form is not configured correctly.",
            "error"
        );

        return;
    }


    /* =====================================================
       GET FORM VALUES
       ===================================================== */

    const fullName =
        fullNameInput.value.trim();


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    const phone =
        phoneInput.value.trim();


    const password =
        passwordInput.value;


    const confirmPassword =
        confirmPasswordInput.value;


    /* =====================================================
       CLIENT VALIDATION
       ===================================================== */

    const isValid =
        validateRegistrationForm(
            fullName,
            email,
            phone,
            password,
            confirmPassword
        );


    if (!isValid) {
        return;
    }


    /* =====================================================
       SPLIT FULL NAME
       Backend requires FirstName + LastName
       ===================================================== */

    const nameParts =
        splitCustomerName(
            fullName
        );


    if (!nameParts) {

        showFieldError(
            "fullName",
            "fullNameError",
            "Please enter both first name and last name."
        );

        return;
    }


    /* =====================================================
       DATA SENT TO BACKEND

       POST /api/Auth/register
       ===================================================== */

    const registrationData =
    {
        firstName:
            nameParts.firstName,

        lastName:
            nameParts.lastName,

        email:
            email,

        phoneNumber:
            phone,

        password:
            password,

        confirmPassword:
            confirmPassword
    };


    setRegisterLoading(
        true
    );


    try {

        const response =
            await apiPost(
                "/auth/register",
                registrationData
            );


        processSuccessfulRegistration(
            response,
            email
        );

    }
    catch (error) {

        handleRegistrationError(
            error
        );

    }
    finally {

        setRegisterLoading(
            false
        );
    }
}


/* =========================================================
   SUCCESSFUL REGISTRATION
   ========================================================= */

function processSuccessfulRegistration(
    response,
    submittedEmail
) {

    const data =
        response?.data ||
        response;


    const customerId =
        data?.customerId ??
        null;


    const email =
        data?.email ||
        submittedEmail;


    const message =
        data?.message ||
        "Registration successful. Please verify your email.";


    const requiresVerification =
        data?.requiresEmailVerification ??
        true;


    /* Save temporary registration information.
       We will use this in the email verification step. */

    sessionStorage.setItem(
        "pendingVerificationEmail",
        email
    );


    if (
        customerId !== null &&
        customerId !== undefined
    ) {

        sessionStorage.setItem(
            "pendingVerificationCustomerId",
            String(customerId)
        );
    }


    showRegisterMessage(
        message,
        "success"
    );


    const form =
        document.getElementById(
            "registerForm"
        );


    if (form) {
        form.reset();
    }


    /*
     * IMPORTANT:
     *
     * Do NOT redirect to login yet.
     *
     * Customer is still:
     * PendingVerification
     *
     * Next step:
     * Real verification process.
     */

    if (requiresVerification) {

        console.log(
            "Registration completed. Email verification is required."
        );
    }
}


/* =========================================================
   SPLIT FULL NAME
   Example:
   "Test Customer"
      ↓
   firstName = Test
   lastName  = Customer

   "Jude Consal Roshni Kulas"
      ↓
   firstName = Jude Consal Roshni
   lastName  = Kulas
   ========================================================= */

function splitCustomerName(
    fullName
) {

    const parts =
        String(fullName)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length < 2) {
        return null;
    }


    const lastName =
        parts.pop();


    const firstName =
        parts.join(" ");


    if (
        firstName.length < 2 ||
        lastName.length < 2
    ) {
        return null;
    }


    return {
        firstName,
        lastName
    };
}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateRegistrationForm(
    fullName,
    email,
    phone,
    password,
    confirmPassword
) {

    let isValid = true;


    /* =====================================================
       FULL NAME
       ===================================================== */

    if (!fullName) {

        showFieldError(
            "fullName",
            "fullNameError",
            "Full name is required."
        );

        isValid = false;

    }
    else {

        const nameParts =
            fullName
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (nameParts.length < 2) {

            showFieldError(
                "fullName",
                "fullNameError",
                "Please enter both first name and last name."
            );

            isValid = false;
        }
    }


    /* =====================================================
       EMAIL
       ===================================================== */

    if (!email) {

        showFieldError(
            "email",
            "emailError",
            "Email address is required."
        );

        isValid = false;

    }
    else if (
        !isValidEmail(
            email
        )
    ) {

        showFieldError(
            "email",
            "emailError",
            "Please enter a valid email address."
        );

        isValid = false;
    }


    /* =====================================================
       PHONE
       ===================================================== */

    if (!phone) {

        showFieldError(
            "phone",
            "phoneError",
            "Phone number is required."
        );

        isValid = false;

    }
    else if (
        !isValidPhone(
            phone
        )
    ) {

        showFieldError(
            "phone",
            "phoneError",
            "Please enter a valid phone number."
        );

        isValid = false;
    }


    /* =====================================================
       PASSWORD
       ===================================================== */

    if (!password) {

        showFieldError(
            "password",
            "passwordError",
            "Password is required."
        );

        isValid = false;

    }
    else if (
        password.length < 8
    ) {

        showFieldError(
            "password",
            "passwordError",
            "Password must contain at least 8 characters."
        );

        isValid = false;
    }


    /* =====================================================
       CONFIRM PASSWORD
       ===================================================== */

    if (!confirmPassword) {

        showFieldError(
            "confirmPassword",
            "confirmPasswordError",
            "Please confirm your password."
        );

        isValid = false;

    }
    else if (
        password !== confirmPassword
    ) {

        showFieldError(
            "confirmPassword",
            "confirmPasswordError",
            "Passwords do not match."
        );

        isValid = false;
    }


    return isValid;
}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailPattern.test(
        email
    );
}


/* =========================================================
   PHONE VALIDATION
   ========================================================= */

function isValidPhone(phone) {

    /*
       Examples:
       0771234567
       +94771234567
       077 123 4567
       077-123-4567
    */


    const cleanedPhone =
        phone.replace(
            /[\s-]/g,
            ""
        );


    const phonePattern =
        /^\+?[0-9]{9,15}$/;


    return phonePattern.test(
        cleanedPhone
    );
}


/* =========================================================
   DISPLAY FIELD ERROR
   ========================================================= */

function showFieldError(
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

function clearValidationErrors() {

    const fields =
    [
        "fullName",
        "email",
        "phone",
        "password",
        "confirmPassword"
    ];


    fields.forEach(
        function (fieldId) {

            const input =
                document.getElementById(
                    fieldId
                );


            if (input) {

                input.classList.remove(
                    "input-error"
                );


                input.classList.remove(
                    "input-success"
                );
            }
        }
    );


    const errors =
    [
        "fullNameError",
        "emailError",
        "phoneError",
        "passwordError",
        "confirmPasswordError"
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
   REGISTER MESSAGE
   ========================================================= */

function showRegisterMessage(
    message,
    type
) {

    const messageElement =
        document.getElementById(
            "registerMessage"
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
   CLEAR REGISTER MESSAGE
   ========================================================= */

function clearRegisterMessage() {

    const messageElement =
        document.getElementById(
            "registerMessage"
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
   API ERROR HANDLING
   ========================================================= */

function handleRegistrationError(
    error
) {

    console.error(
        "Registration Error:",
        error
    );


    let message =
        error?.message ||
        "Unable to create your account.";


    /* Duplicate email */

    if (
        error?.status === 409
    ) {

        message =
            error?.message ||
            "An account with this email already exists.";
    }


    /* Validation error */

    if (
        error?.status === 400
    ) {

        message =
            error?.message ||
            "Please check your details and try again.";
    }


    showRegisterMessage(
        message,
        "error"
    );
}


/* =========================================================
   BUTTON LOADING STATE
   ========================================================= */

function setRegisterLoading(
    isLoading
) {

    const registerButton =
        document.getElementById(
            "registerButton"
        );


    if (!registerButton) {
        return;
    }


    registerButton.disabled =
        isLoading;


    registerButton.textContent =
        isLoading
            ? "Creating Account..."
            : "Create Account";
}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

function initializePasswordToggles() {

    setupPasswordToggle(
        "password",
        "passwordToggle"
    );


    setupPasswordToggle(
        "confirmPassword",
        "confirmPasswordToggle"
    );
}


function setupPasswordToggle(
    inputId,
    buttonId
) {

    const passwordInput =
        document.getElementById(
            inputId
        );


    const toggleButton =
        document.getElementById(
            buttonId
        );


    if (
        !passwordInput ||
        !toggleButton
    ) {
        return;
    }


    toggleButton.addEventListener(
        "click",
        function () {

            const hidden =
                passwordInput.type ===
                "password";


            passwordInput.type =
                hidden
                    ? "text"
                    : "password";


            toggleButton.textContent =
                hidden
                    ? "Hide"
                    : "Show";
        }
    );
}