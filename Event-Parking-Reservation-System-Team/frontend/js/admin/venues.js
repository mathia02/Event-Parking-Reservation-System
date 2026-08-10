/* =========================================================
   Event & Parking Reservation System
   Admin Venue Management
   ========================================================= */


let venues = [];

let editingVenueId = null;


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        initializeVenueForm();

        initializeVenueButtons();

        await loadVenues();
    }
);


/* =========================================================
   INITIALIZE FORM
   ========================================================= */

function initializeVenueForm() {

    const form =
        document.getElementById(
            "venueForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleVenueSubmit
    );
}


/* =========================================================
   INITIALIZE BUTTONS
   ========================================================= */

function initializeVenueButtons() {

    const cancelButton =
        document.getElementById(
            "cancelVenueEditButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshVenuesButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            resetVenueForm
        );
    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadVenues
        );
    }
}


/* =========================================================
   LOAD VENUES
   GET /api/Venues
   ========================================================= */

async function loadVenues() {

    showVenueLoading(
        true
    );


    clearVenueMessage();


    try {

        const response =
            await apiGet(
                "/venues"
            );


        venues =
            Array.isArray(response)
                ? response
                : response?.data || [];


        renderVenueTable();

    }
    catch (error) {

        console.error(
            "Load Venues Error:",
            error
        );


        showVenueMessage(
            error?.message ||
            "Unable to load venues.",
            "error"
        );

    }
    finally {

        showVenueLoading(
            false
        );
    }
}


/* =========================================================
   RENDER VENUES
   ========================================================= */

function renderVenueTable() {

    const tableBody =
        document.getElementById(
            "venueTableBody"
        );


    const emptyState =
        document.getElementById(
            "venueEmpty"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        "";


    if (
        !venues ||
        venues.length === 0
    ) {

        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );
        }


        return;
    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );
    }


    venues.forEach(
        function (venue) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML =
                `
                <td>
                    ${escapeVenueHtml(venue.id)}
                </td>

                <td>
                    <strong>
                        ${escapeVenueHtml(venue.name)}
                    </strong>
                </td>

                <td>
                    ${escapeVenueHtml(venue.address)}
                </td>

                <td>
                    ${escapeVenueHtml(venue.totalCapacity)}
                </td>

                <td>
                    <div class="table-actions">

                        <button
                            type="button"
                            class="btn btn-sm btn-secondary"
                            data-action="edit"
                            data-id="${venue.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            data-action="delete"
                            data-id="${venue.id}"
                        >
                            Delete
                        </button>

                    </div>
                </td>
                `;


            tableBody.appendChild(
                row
            );
        }
    );


    initializeVenueTableActions();
}


/* =========================================================
   TABLE ACTIONS
   ========================================================= */

function initializeVenueTableActions() {

    const actionButtons =
        document.querySelectorAll(
            "#venueTableBody button[data-action]"
        );


    actionButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const action =
                        button.dataset.action;


                    const venueId =
                        Number(
                            button.dataset.id
                        );


                    if (
                        action === "edit"
                    ) {

                        startVenueEdit(
                            venueId
                        );

                        return;
                    }


                    if (
                        action === "delete"
                    ) {

                        deleteVenue(
                            venueId
                        );
                    }
                }
            );
        }
    );
}


/* =========================================================
   HANDLE CREATE / UPDATE
   ========================================================= */

async function handleVenueSubmit(
    event
) {

    event.preventDefault();


    clearVenueMessage();

    clearVenueValidation();


    const venueNameInput =
        document.getElementById(
            "venueName"
        );


    const venueAddressInput =
        document.getElementById(
            "venueAddress"
        );


    const venueCapacityInput =
        document.getElementById(
            "venueCapacity"
        );


    if (
        !venueNameInput ||
        !venueAddressInput ||
        !venueCapacityInput
    ) {

        showVenueMessage(
            "Venue form is not configured correctly.",
            "error"
        );

        return;
    }


    const name =
        venueNameInput.value
            .trim();


    const address =
        venueAddressInput.value
            .trim();


    const totalCapacity =
        Number(
            venueCapacityInput.value
        );


    const valid =
        validateVenueForm(
            name,
            address,
            totalCapacity
        );


    if (!valid) {
        return;
    }


    const venueData =
    {
        name:
            name,

        address:
            address,

        totalCapacity:
            totalCapacity
    };


    setVenueFormLoading(
        true
    );


    try {

        // =================================================
        // CREATE
        // =================================================

        if (
            editingVenueId === null
        ) {

            await apiPost(
                "/venues",
                venueData
            );


            showVenueMessage(
                "Venue created successfully.",
                "success"
            );
        }

        // =================================================
        // UPDATE
        // =================================================

        else {

            await apiPut(
                `/venues/${editingVenueId}`,
                venueData
            );


            showVenueMessage(
                "Venue updated successfully.",
                "success"
            );
        }


        resetVenueForm(
            false
        );


        await loadVenues();

    }
    catch (error) {

        console.error(
            "Save Venue Error:",
            error
        );


        showVenueMessage(
            error?.message ||
            "Unable to save venue.",
            "error"
        );

    }
    finally {

        setVenueFormLoading(
            false
        );
    }
}


/* =========================================================
   VALIDATE FORM
   ========================================================= */

function validateVenueForm(
    name,
    address,
    totalCapacity
) {

    let valid =
        true;


    // Venue Name

    if (!name) {

        showVenueFieldError(
            "venueName",
            "venueNameError",
            "Venue name is required."
        );


        valid =
            false;
    }


    // Address

    if (!address) {

        showVenueFieldError(
            "venueAddress",
            "venueAddressError",
            "Venue address is required."
        );


        valid =
            false;
    }


    // Capacity

    if (
        !Number.isInteger(
            totalCapacity
        ) ||
        totalCapacity <= 0
    ) {

        showVenueFieldError(
            "venueCapacity",
            "venueCapacityError",
            "Venue capacity must be greater than zero."
        );


        valid =
            false;
    }


    return valid;
}


/* =========================================================
   START EDIT
   ========================================================= */

function startVenueEdit(
    venueId
) {

    const venue =
        venues.find(
            function (item) {

                return Number(item.id)
                    === Number(venueId);
            }
        );


    if (!venue) {

        showVenueMessage(
            "Venue could not be found.",
            "error"
        );

        return;
    }


    editingVenueId =
        venue.id;


    const idInput =
        document.getElementById(
            "venueId"
        );


    const nameInput =
        document.getElementById(
            "venueName"
        );


    const addressInput =
        document.getElementById(
            "venueAddress"
        );


    const capacityInput =
        document.getElementById(
            "venueCapacity"
        );


    const title =
        document.getElementById(
            "venueFormTitle"
        );


    const saveButton =
        document.getElementById(
            "saveVenueButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelVenueEditButton"
        );


    if (idInput) {

        idInput.value =
            venue.id;
    }


    if (nameInput) {

        nameInput.value =
            venue.name || "";
    }


    if (addressInput) {

        addressInput.value =
            venue.address || "";
    }


    if (capacityInput) {

        capacityInput.value =
            venue.totalCapacity || "";
    }


    if (title) {

        title.textContent =
            "Edit Venue";
    }


    if (saveButton) {

        saveButton.textContent =
            "Update Venue";
    }


    if (cancelButton) {

        cancelButton.classList.remove(
            "hidden"
        );
    }


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );
}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetVenueForm(
    clearMessage = true
) {

    editingVenueId =
        null;


    const form =
        document.getElementById(
            "venueForm"
        );


    const title =
        document.getElementById(
            "venueFormTitle"
        );


    const saveButton =
        document.getElementById(
            "saveVenueButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelVenueEditButton"
        );


    const idInput =
        document.getElementById(
            "venueId"
        );


    if (form) {

        form.reset();
    }


    if (idInput) {

        idInput.value =
            "";
    }


    if (title) {

        title.textContent =
            "Add New Venue";
    }


    if (saveButton) {

        saveButton.textContent =
            "Add Venue";
    }


    if (cancelButton) {

        cancelButton.classList.add(
            "hidden"
        );
    }


    clearVenueValidation();


    if (clearMessage) {

        clearVenueMessage();
    }
}


/* =========================================================
   DELETE VENUE
   ========================================================= */

async function deleteVenue(
    venueId
) {

    const venue =
        venues.find(
            function (item) {

                return Number(item.id)
                    === Number(venueId);
            }
        );


    if (!venue) {

        showVenueMessage(
            "Venue could not be found.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${venue.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiDelete(
            `/venues/${venueId}`
        );


        showVenueMessage(
            "Venue deleted successfully.",
            "success"
        );


        await loadVenues();

    }
    catch (error) {

        console.error(
            "Delete Venue Error:",
            error
        );


        showVenueMessage(
            error?.message ||
            "Unable to delete venue.",
            "error"
        );
    }
}


/* =========================================================
   FIELD ERROR
   ========================================================= */

function showVenueFieldError(
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

function clearVenueValidation() {

    const inputs =
    [
        "venueName",
        "venueAddress",
        "venueCapacity"
    ];


    inputs.forEach(
        function (id) {

            const input =
                document.getElementById(
                    id
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
        "venueNameError",
        "venueAddressError",
        "venueCapacityError"
    ];


    errors.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    "";
            }
        }
    );
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showVenueMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "venueMessage"
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

function clearVenueMessage() {

    const element =
        document.getElementById(
            "venueMessage"
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
   LOADING
   ========================================================= */

function showVenueLoading(
    loading
) {

    const element =
        document.getElementById(
            "venueLoading"
        );


    if (!element) {
        return;
    }


    if (loading) {

        element.classList.remove(
            "hidden"
        );

    }
    else {

        element.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   FORM BUTTON LOADING
   ========================================================= */

function setVenueFormLoading(
    loading
) {

    const button =
        document.getElementById(
            "saveVenueButton"
        );


    if (!button) {
        return;
    }


    button.disabled =
        loading;


    if (loading) {

        button.textContent =
            editingVenueId === null
                ? "Creating..."
                : "Updating...";

    }
    else {

        button.textContent =
            editingVenueId === null
                ? "Add Venue"
                : "Update Venue";
    }
}


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeVenueHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);


    return div.innerHTML;
}