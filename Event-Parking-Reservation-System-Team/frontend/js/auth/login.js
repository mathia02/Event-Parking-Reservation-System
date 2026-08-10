/* =========================================================
   Event & Parking Reservation System
   Login
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeLoginForm();

        initializeLoginPasswordToggle();

        initializeResendVerification();

        checkExistingLogin();
    }
);


/* =========================================================
   INITIALIZE LOGIN FORM
   ========================================================= */

function initializeLoginForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        handleLogin
    );
}


/* =========================================================
   HANDLE LOGIN
   ========================================================= */

async function handleLogin(event) {

    event.preventDefault();


    clearLoginMessage();

    hideVerificationWarning();

    clearLoginValidationErrors();


    const emailInput =
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const rememberMeInput =
        document.getElementById(
            "rememberMe"
        );


    if (
        !emailInput ||
        !passwordInput
    ) {

        showLoginMessage(
            "Login form is not configured correctly.",
            "error"
        );

        return;
    }


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    const password =
        passwordInput.value;


    const rememberMe =
        rememberMeInput
            ? rememberMeInput.checked
            : false;


    const valid =
        validateLoginForm(
            email,
            password
        );


    if (!valid) {
        return;
    }


    const loginData =
    {
        email: email,
        password: password
    };


    setLoginLoading(
        true
    );


    try {

        /*
         * Backend:
         *
         * POST /api/Auth/login
         */

        const response =
            await apiPost(
                "/auth/login",
                loginData
            );


        processSuccessfulLogin(
            response,
            rememberMe
        );

    }
    catch (error) {

        handleLoginError(
            error,
            email
        );

    }
    finally {

        setLoginLoading(
            false
        );
    }
}


/* =========================================================
   VALIDATE LOGIN
   ========================================================= */

function validateLoginForm(
    email,
    password
) {

    let valid = true;


    if (!email) {

        showLoginFieldError(
            "email",
            "emailError",
            "Email address is required."
        );

        valid = false;

    }
    else if (
        !isLoginEmailValid(
            email
        )
    ) {

        showLoginFieldError(
            "email",
            "emailError",
            "Please enter a valid email address."
        );

        valid = false;
    }


    if (!password) {

        showLoginFieldError(
            "password",
            "passwordError",
            "Password is required."
        );

        valid = false;
    }


    return valid;
}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isLoginEmailValid(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailPattern.test(
        email
    );
}


/* =========================================================
   SUCCESSFUL LOGIN
   ========================================================= */

function processSuccessfulLogin(
    response,
    rememberMe
) {

    const data =
        response?.data ||
        response;


    if (!data) {

        showLoginMessage(
            "Invalid login response received from the server.",
            "error"
        );

        return;
    }


    // =====================================================
    // TOKEN
    // =====================================================

    const token =
        data.token ||
        data.accessToken ||
        null;


    // =====================================================
    // ROLE
    // =====================================================

    const role =
        data.role ||
        data.userRole ||
        null;


    // =====================================================
    // CUSTOMER ID
    // =====================================================

    const customerId =
        data.customerId ??
        data.userId ??
        null;


    // =====================================================
    // NAME
    // Backend returns:
    // firstName + lastName
    // =====================================================

    const firstName =
        data.firstName ||
        "";


    const lastName =
        data.lastName ||
        "";


    let name =
        `${firstName} ${lastName}`
            .trim();


    if (!name) {

        name =
            data.name ||
            data.fullName ||
            "User";
    }


    // =====================================================
    // EMAIL
    // =====================================================

    const email =
        data.email ||
        document
            .getElementById("email")
            ?.value
            ?.trim() ||
        "";


    // =====================================================
    // TOKEN EXPIRY
    // =====================================================

    const expiresAt =
        data.expiresAt ||
        null;


    // =====================================================
    // VALIDATE RESPONSE
    // =====================================================

    if (!token) {

        showLoginMessage(
            "Login response did not contain an authentication token.",
            "error"
        );


        console.error(
            "Login response:",
            response
        );


        return;
    }


    if (!role) {

        showLoginMessage(
            "Login succeeded but the account role was not returned.",
            "error"
        );


        console.error(
            "Login response:",
            response
        );


        return;
    }


    // =====================================================
    // STORE TOKEN
    // =====================================================

    localStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.TOKEN,
        token
    );


    // =====================================================
    // STORE ROLE
    // =====================================================

    localStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.ROLE,
        role
    );


    // =====================================================
    // STORE CUSTOMER ID
    // =====================================================

    if (
        customerId !== null &&
        customerId !== undefined
    ) {

        localStorage.setItem(
            APP_CONFIG.STORAGE_KEYS.CUSTOMER_ID,
            String(customerId)
        );

    }
    else {

        localStorage.removeItem(
            APP_CONFIG.STORAGE_KEYS.CUSTOMER_ID
        );
    }


    // =====================================================
    // STORE USER
    // =====================================================

    const user =
    {
        customerId: customerId,

        firstName: firstName,

        lastName: lastName,

        name: name,

        email: email,

        role: role,

        expiresAt: expiresAt
    };


    localStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER,
        JSON.stringify(
            user
        )
    );


    // =====================================================
    // REMEMBER ME
    // =====================================================

    localStorage.setItem(
        "eventParkingRememberMe",
        String(
            rememberMe
        )
    );


    showLoginMessage(
        "Login successful. Redirecting...",
        "success"
    );


    redirectUserByRole(
        role
    );
}


/* =========================================================
   ROLE BASED REDIRECT
   ========================================================= */

function redirectUserByRole(role) {

    const normalizedRole =
        String(role)
            .trim()
            .toLowerCase();


    setTimeout(
        function () {

            // CUSTOMER

            if (
                normalizedRole ===
                "customer"
            ) {

                window.location.href =
                    "../customer/dashboard.html";

                return;
            }


            // ADMIN

            if (
                normalizedRole === "admin" ||
                normalizedRole === "administrator"
            ) {

                window.location.href =
                    "../admin/dashboard.html";

                return;
            }


            showLoginMessage(
                "Your account role is not recognized.",
                "error"
            );

        },
        700
    );
}


/* =========================================================
   LOGIN ERROR HANDLING
   ========================================================= */

function handleLoginError(
    error,
    email
) {

    console.error(
        "Login Error:",
        error
    );


    const serverMessage =
        String(
            error?.message ||
            ""
        );


    const normalizedMessage =
        serverMessage
            .toLowerCase();


    let message =
        serverMessage ||
        "Unable to login. Please try again.";


    // =====================================================
    // 401 - INVALID EMAIL / PASSWORD
    // =====================================================

    if (
        error?.status === 401
    ) {

        showLoginMessage(
            serverMessage ||
            "Invalid email or password.",
            "error"
        );

        return;
    }


    // =====================================================
    // EMAIL NOT VERIFIED
    //
    // Current backend returns 400.
    // Future backend may return 403.
    // Support both.
    // =====================================================

    if (
        (
            error?.status === 400 ||
            error?.status === 403
        ) &&
        (
            normalizedMessage.includes(
                "verify"
            ) ||
            normalizedMessage.includes(
                "verified"
            ) ||
            normalizedMessage.includes(
                "verification"
            )
        )
    ) {

        showVerificationWarning(
            email
        );


        showLoginMessage(
            serverMessage ||
            "Please verify your email before logging in.",
            "error"
        );


        return;
    }


    // =====================================================
    // INACTIVE / BLOCKED / DISABLED ACCOUNT
    // =====================================================

    if (
        (
            error?.status === 400 ||
            error?.status === 403
        ) &&
        (
            normalizedMessage.includes(
                "inactive"
            ) ||
            normalizedMessage.includes(
                "not active"
            ) ||
            normalizedMessage.includes(
                "deactivated"
            ) ||
            normalizedMessage.includes(
                "disabled"
            ) ||
            normalizedMessage.includes(
                "blocked"
            )
        )
    ) {

        showLoginMessage(
            serverMessage ||
            "This account is currently unavailable. Please contact the administrator.",
            "error"
        );


        return;
    }


    // =====================================================
    // GENERAL 400
    // =====================================================

    if (
        error?.status === 400
    ) {

        message =
            serverMessage ||
            "Please check your login details.";
    }


    // =====================================================
    // GENERAL 403
    // =====================================================

    if (
        error?.status === 403
    ) {

        message =
            serverMessage ||
            "You do not have permission to access this account.";
    }


    showLoginMessage(
        message,
        "error"
    );
}


/* =========================================================
   FIELD ERROR
   ========================================================= */

function showLoginFieldError(
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
   CLEAR VALIDATION ERRORS
   ========================================================= */

function clearLoginValidationErrors() {

    const inputs =
    [
        "email",
        "password"
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
        "emailError",
        "passwordError"
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
   LOGIN MESSAGE
   ========================================================= */

function showLoginMessage(
    message,
    type
) {

    const messageElement =
        document.getElementById(
            "loginMessage"
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
   CLEAR LOGIN MESSAGE
   ========================================================= */

function clearLoginMessage() {

    const messageElement =
        document.getElementById(
            "loginMessage"
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

function setLoginLoading(
    loading
) {

    const button =
        document.getElementById(
            "loginButton"
        );


    if (!button) {

        return;
    }


    button.disabled =
        loading;


    button.textContent =
        loading
            ? "Logging in..."
            : "Login";
}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

function initializeLoginPasswordToggle() {

    const passwordInput =
        document.getElementById(
            "password"
        );


    const toggleButton =
        document.getElementById(
            "passwordToggle"
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

            const currentlyHidden =
                passwordInput.type ===
                "password";


            passwordInput.type =
                currentlyHidden
                    ? "text"
                    : "password";


            toggleButton.textContent =
                currentlyHidden
                    ? "Hide"
                    : "Show";
        }
    );
}


/* =========================================================
   VERIFICATION WARNING
   ========================================================= */

function showVerificationWarning(
    email
) {

    const warning =
        document.getElementById(
            "verificationWarning"
        );


    if (!warning) {

        return;
    }


    warning.dataset.email =
        email;


    warning.classList.remove(
        "hidden"
    );
}


function hideVerificationWarning() {

    const warning =
        document.getElementById(
            "verificationWarning"
        );


    if (!warning) {

        return;
    }


    warning.classList.add(
        "hidden"
    );
}


/* =========================================================
   RESEND VERIFICATION
   ========================================================= */

function initializeResendVerification() {

    const button =
        document.getElementById(
            "resendVerificationButton"
        );


    if (!button) {

        return;
    }


    button.addEventListener(
        "click",
        resendVerificationEmail
    );
}


async function resendVerificationEmail() {

    const warning =
        document.getElementById(
            "verificationWarning"
        );


    const button =
        document.getElementById(
            "resendVerificationButton"
        );


    const email =
        warning?.dataset?.email;


    if (!email) {

        showLoginMessage(
            "Please enter your email address first.",
            "error"
        );

        return;
    }


    if (!button) {

        return;
    }


    button.disabled =
        true;


    button.textContent =
        "Sending...";


    try {

        /*
         * Backend endpoint:
         *
         * POST /api/Auth/resend-verification
         *
         * Backend endpoint இன்னும் create செய்யவில்லை.
         * Next authentication step-ல் செய்வோம்.
         */

        await apiPost(
            "/auth/resend-verification",
            {
                email: email
            }
        );


        showLoginMessage(
            "Verification email sent. Please check your inbox.",
            "success"
        );

    }
    catch (error) {

        showLoginMessage(
            error?.message ||
            "Unable to resend the verification email.",
            "error"
        );

    }
    finally {

        button.disabled =
            false;


        button.textContent =
            "Resend verification email";
    }
}


/* =========================================================
   CHECK EXISTING LOGIN
   ========================================================= */

function checkExistingLogin() {

    const token =
        localStorage.getItem(
            APP_CONFIG.STORAGE_KEYS.TOKEN
        );


    const role =
        localStorage.getItem(
            APP_CONFIG.STORAGE_KEYS.ROLE
        );


    if (
        token &&
        role
    ) {

        redirectUserByRole(
            role
        );
    }
}