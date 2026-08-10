/* =========================================================
   EventPark
   Premium Admin Event Management
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let events = [];

let venues = [];

let categories = [];

let editingEventId = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        initializeEventForm();

        initializeEventButtons();

        initializeImagePreview();

        initializeVenueCapacityHelper();

        await loadEventDependencies();

        await loadEvents();
    }
);


/* =========================================================
   INITIALIZE EVENT FORM
   ========================================================= */

function initializeEventForm() {

    const form =
        document.getElementById(
            "eventForm"
        );


    if (!form) {

        return;
    }


    form.addEventListener(
        "submit",
        handleEventSubmit
    );
}


/* =========================================================
   INITIALIZE BUTTONS
   ========================================================= */

function initializeEventButtons() {

    const refreshButton =
        document.getElementById(
            "refreshEventsButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelEventEditButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                await loadEvents();
            }
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                resetEventForm();
            }
        );
    }
}


/* =========================================================
   LOAD DEPENDENCIES
   Venue + Category
   ========================================================= */

async function loadEventDependencies() {

    try {

        const results =
            await Promise.all(
                [
                    apiGet("/venues"),
                    apiGet("/categories")
                ]
            );


        const venueResponse =
            results[0];


        const categoryResponse =
            results[1];


        venues =
            Array.isArray(venueResponse)
                ? venueResponse
                : venueResponse?.data || [];


        categories =
            Array.isArray(categoryResponse)
                ? categoryResponse
                : categoryResponse?.data || [];


        populateVenueDropdown();

        populateCategoryDropdown();

    }
    catch (error) {

        console.error(
            "Load Event Dependencies Error:",
            error
        );


        showEventMessage(
            error?.message ||
            "Unable to load venues and categories.",
            "error"
        );
    }
}


/* =========================================================
   POPULATE VENUE DROPDOWN
   ========================================================= */

function populateVenueDropdown() {

    const select =
        document.getElementById(
            "eventVenue"
        );


    if (!select) {

        return;
    }


    const currentValue =
        select.value;


    select.innerHTML =
        `
        <option value="">
            Select venue
        </option>
        `;


    venues.forEach(
        function (venue) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                venue.id;


            option.textContent =
                `${venue.name} — Capacity ${venue.totalCapacity}`;


            select.appendChild(
                option
            );
        }
    );


    if (currentValue) {

        select.value =
            currentValue;
    }
}


/* =========================================================
   POPULATE CATEGORY DROPDOWN
   ========================================================= */

function populateCategoryDropdown() {

    const select =
        document.getElementById(
            "eventCategory"
        );


    if (!select) {

        return;
    }


    const currentValue =
        select.value;


    select.innerHTML =
        `
        <option value="">
            Select category
        </option>
        `;


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id;


            option.textContent =
                category.name;


            select.appendChild(
                option
            );
        }
    );


    if (currentValue) {

        select.value =
            currentValue;
    }
}


/* =========================================================
   LOAD EVENTS
   GET /api/Events
   ========================================================= */

async function loadEvents() {

    showEventLoading(
        true
    );


    try {

        const response =
            await apiGet(
                "/events"
            );


        events =
            Array.isArray(response)
                ? response
                : response?.data || [];


        updateEventCounts();

        renderEvents();

    }
    catch (error) {

        console.error(
            "Load Events Error:",
            error
        );


        showEventMessage(
            error?.message ||
            "Unable to load events.",
            "error"
        );

    }
    finally {

        showEventLoading(
            false
        );
    }
}


/* =========================================================
   EVENT COUNTS
   ========================================================= */

function updateEventCounts() {

    const count =
        events.length;


    const totalElement =
        document.getElementById(
            "eventTotalCount"
        );


    const summaryElement =
        document.getElementById(
            "eventSummaryCount"
        );


    if (totalElement) {

        totalElement.textContent =
            count;
    }


    if (summaryElement) {

        summaryElement.textContent =
            count;
    }
}


/* =========================================================
   RENDER EVENTS
   ========================================================= */

function renderEvents() {

    const tableBody =
        document.getElementById(
            "eventTableBody"
        );


    const emptyState =
        document.getElementById(
            "eventEmpty"
        );


    const tableWrapper =
        document.getElementById(
            "eventTableWrapper"
        );


    if (!tableBody) {

        return;
    }


    tableBody.innerHTML =
        "";


    if (
        !events ||
        events.length === 0
    ) {

        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );
        }


        if (tableWrapper) {

            tableWrapper.classList.add(
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


    if (tableWrapper) {

        tableWrapper.classList.remove(
            "hidden"
        );
    }


    events.forEach(
        function (eventItem) {

            const row =
                document.createElement(
                    "tr"
                );


            const imageUrl =
                eventItem.imageUrl || "";


            const safeImageUrl =
                escapeEventAttribute(
                    imageUrl
                );


            const safeName =
                escapeEventHtml(
                    eventItem.name
                );


            const safeVenue =
                escapeEventHtml(
                    eventItem.venueName ||
                    "Venue unavailable"
                );


            const safeCategory =
                escapeEventHtml(
                    eventItem.categoryName ||
                    "Uncategorized"
                );


            const formattedDate =
                formatEventDate(
                    eventItem.eventDate
                );


            const formattedStartTime =
                formatEventTime(
                    eventItem.startTime
                );


            const formattedEndTime =
                formatEventTime(
                    eventItem.endTime
                );


            const ticketPrice =
                formatEventPrice(
                    eventItem.ticketPrice
                );


            const capacity =
                Number(
                    eventItem.capacity || 0
                ).toLocaleString();


            row.innerHTML =
                `
                <td>

                    <div class="event-table-main">

                        <div class="event-table-image-wrap">

                            ${
                                imageUrl
                                    ?
                                    `
                                    <img
                                        class="event-table-image"
                                        src="${safeImageUrl}"
                                        alt="${escapeEventAttribute(eventItem.name)}"
                                        data-event-image="true"
                                    >
                                    `
                                    :
                                    `
                                    <div class="event-table-image-fallback">
                                        ${getEventInitial(eventItem.name)}
                                    </div>
                                    `
                            }

                        </div>


                        <div class="event-table-info">

                            <strong>
                                ${safeName}
                            </strong>


                            <span class="event-category-chip">
                                ${safeCategory}
                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    <div class="event-venue-cell">

                        <strong>
                            ${safeVenue}
                        </strong>

                        <span>
                            Venue #${escapeEventHtml(eventItem.venueId)}
                        </span>

                    </div>

                </td>


                <td>

                    <div class="event-schedule-cell">

                        <strong>
                            ${escapeEventHtml(formattedDate)}
                        </strong>

                        <span>
                            ${escapeEventHtml(formattedStartTime)}
                            –
                            ${escapeEventHtml(formattedEndTime)}
                        </span>

                    </div>

                </td>


                <td>

                    <span class="event-price-badge">
                        ${escapeEventHtml(ticketPrice)}
                    </span>

                </td>


                <td>

                    <span class="event-capacity-badge">
                        ${escapeEventHtml(capacity)}
                    </span>

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="btn btn-sm btn-edit"
                            data-action="edit"
                            data-id="${eventItem.id}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            data-action="delete"
                            data-id="${eventItem.id}"
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


    initializeEventTableActions();

    initializeEventTableImages();
}


/* =========================================================
   TABLE IMAGE ERROR FALLBACK
   ========================================================= */

function initializeEventTableImages() {

    const images =
        document.querySelectorAll(
            "#eventTableBody img[data-event-image='true']"
        );


    images.forEach(
        function (image) {

            image.addEventListener(
                "error",
                function () {

                    const wrapper =
                        image.parentElement;


                    if (!wrapper) {

                        return;
                    }


                    const eventRow =
                        image.closest(
                            "tr"
                        );


                    let initial =
                        "E";


                    if (eventRow) {

                        const title =
                            eventRow.querySelector(
                                ".event-table-info strong"
                            );


                        if (
                            title &&
                            title.textContent
                        ) {

                            initial =
                                title.textContent
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase();
                        }
                    }


                    wrapper.innerHTML =
                        `
                        <div class="event-table-image-fallback">
                            ${escapeEventHtml(initial)}
                        </div>
                        `;
                },
                {
                    once: true
                }
            );
        }
    );
}


/* =========================================================
   TABLE ACTIONS
   ========================================================= */

function initializeEventTableActions() {

    const buttons =
        document.querySelectorAll(
            "#eventTableBody button[data-action]"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const action =
                        button.dataset.action;


                    const eventId =
                        Number(
                            button.dataset.id
                        );


                    if (
                        action === "edit"
                    ) {

                        startEventEdit(
                            eventId
                        );


                        return;
                    }


                    if (
                        action === "delete"
                    ) {

                        deleteEvent(
                            eventId
                        );
                    }
                }
            );
        }
    );
}


/* =========================================================
   IMAGE LIVE PREVIEW
   ========================================================= */

function initializeImagePreview() {

    const input =
        document.getElementById(
            "eventImageUrl"
        );


    if (!input) {

        return;
    }


    input.addEventListener(
        "input",
        function () {

            updateEventImagePreview();
        }
    );


    input.addEventListener(
        "change",
        function () {

            updateEventImagePreview();
        }
    );


    updateEventImagePreview();
}


/* =========================================================
   UPDATE IMAGE PREVIEW
   ========================================================= */

function updateEventImagePreview() {

    const input =
        document.getElementById(
            "eventImageUrl"
        );


    const image =
        document.getElementById(
            "eventImagePreview"
        );


    const placeholder =
        document.getElementById(
            "eventImagePlaceholder"
        );


    const status =
        document.getElementById(
            "eventImagePreviewStatus"
        );


    if (
        !input ||
        !image ||
        !placeholder
    ) {

        return;
    }


    const imageUrl =
        input.value.trim();


    if (!imageUrl) {

        image.removeAttribute(
            "src"
        );


        image.classList.add(
            "hidden"
        );


        placeholder.classList.remove(
            "hidden"
        );


        if (status) {

            status.textContent =
                "No image";


            status.className =
                "preview-status";
        }


        return;
    }


    if (
        !isValidHttpUrl(
            imageUrl
        )
    ) {

        image.classList.add(
            "hidden"
        );


        placeholder.classList.remove(
            "hidden"
        );


        if (status) {

            status.textContent =
                "Invalid URL";


            status.className =
                "preview-status preview-status-error";
        }


        return;
    }


    if (status) {

        status.textContent =
            "Loading...";


        status.className =
            "preview-status preview-status-loading";
    }


    image.onload =
        function () {

            image.classList.remove(
                "hidden"
            );


            placeholder.classList.add(
                "hidden"
            );


            if (status) {

                status.textContent =
                    "Image ready";


                status.className =
                    "preview-status preview-status-success";
            }
        };


    image.onerror =
        function () {

            image.classList.add(
                "hidden"
            );


            placeholder.classList.remove(
                "hidden"
            );


            if (status) {

                status.textContent =
                    "Unable to load";


                status.className =
                    "preview-status preview-status-error";
            }
        };


    image.src =
        imageUrl;
}


/* =========================================================
   URL VALIDATION
   ========================================================= */

function isValidHttpUrl(
    value
) {

    try {

        const url =
            new URL(
                value
            );


        return (
            url.protocol === "http:"
            ||
            url.protocol === "https:"
        );

    }
    catch {

        return false;
    }
}


/* =========================================================
   VENUE CAPACITY HELPER
   ========================================================= */

function initializeVenueCapacityHelper() {

    const venueSelect =
        document.getElementById(
            "eventVenue"
        );


    if (!venueSelect) {

        return;
    }


    venueSelect.addEventListener(
        "change",
        function () {

            updateVenueCapacityHelper();
        }
    );
}


/* =========================================================
   UPDATE VENUE CAPACITY
   ========================================================= */

function updateVenueCapacityHelper() {

    const venueSelect =
        document.getElementById(
            "eventVenue"
        );


    const helper =
        document.getElementById(
            "eventCapacityHelper"
        );


    const capacityInput =
        document.getElementById(
            "eventCapacity"
        );


    if (
        !venueSelect ||
        !helper
    ) {

        return;
    }


    const venueId =
        Number(
            venueSelect.value
        );


    if (!venueId) {

        helper.textContent =
            "Select a venue to see its maximum capacity.";


        if (capacityInput) {

            capacityInput.removeAttribute(
                "max"
            );
        }


        return;
    }


    const venue =
        venues.find(
            function (item) {

                return Number(item.id) ===
                    venueId;
            }
        );


    if (!venue) {

        helper.textContent =
            "Venue capacity information is unavailable.";


        return;
    }


    const maximumCapacity =
        Number(
            venue.totalCapacity
        );


    helper.textContent =
        `Maximum venue capacity: ${maximumCapacity.toLocaleString()} people.`;


    if (capacityInput) {

        capacityInput.max =
            maximumCapacity;
    }
}


/* =========================================================
   HANDLE EVENT CREATE / UPDATE
   ========================================================= */

async function handleEventSubmit(
    submitEvent
) {

    submitEvent.preventDefault();


    clearEventMessage();

    clearEventValidation();


    const nameInput =
        document.getElementById(
            "eventName"
        );


    const imageInput =
        document.getElementById(
            "eventImageUrl"
        );


    const venueInput =
        document.getElementById(
            "eventVenue"
        );


    const categoryInput =
        document.getElementById(
            "eventCategory"
        );


    const dateInput =
        document.getElementById(
            "eventDate"
        );


    const startTimeInput =
        document.getElementById(
            "eventStartTime"
        );


    const endTimeInput =
        document.getElementById(
            "eventEndTime"
        );


    const priceInput =
        document.getElementById(
            "eventTicketPrice"
        );


    const capacityInput =
        document.getElementById(
            "eventCapacity"
        );


    if (
        !nameInput ||
        !imageInput ||
        !venueInput ||
        !categoryInput ||
        !dateInput ||
        !startTimeInput ||
        !endTimeInput ||
        !priceInput ||
        !capacityInput
    ) {

        showEventMessage(
            "Event form is not configured correctly.",
            "error"
        );


        return;
    }


    const formData =
    {
        name:
            nameInput.value.trim(),

        imageUrl:
            imageInput.value.trim(),

        venueId:
            Number(
                venueInput.value
            ),

        categoryId:
            Number(
                categoryInput.value
            ),

        eventDate:
            dateInput.value,

        startTime:
            startTimeInput.value,

        endTime:
            endTimeInput.value,

        ticketPrice:
            Number(
                priceInput.value
            ),

        capacity:
            Number(
                capacityInput.value
            )
    };


    const valid =
        validateEventForm(
            formData
        );


    if (!valid) {

        return;
    }


    const request =
    {
        name:
            formData.name,

        imageUrl:
            formData.imageUrl || "",

        venueId:
            formData.venueId,

        categoryId:
            formData.categoryId,

        eventDate:
            formData.eventDate,

        startTime:
            normalizeTimeForApi(
                formData.startTime
            ),

        endTime:
            normalizeTimeForApi(
                formData.endTime
            ),

        ticketPrice:
            formData.ticketPrice,

        capacity:
            formData.capacity
    };


    const wasEditing =
        editingEventId !== null;


    const eventIdToUpdate =
        editingEventId;


    setEventFormLoading(
        true
    );


    try {

        // =================================================
        // CREATE
        // =================================================

        if (!wasEditing) {

            await apiPost(
                "/events",
                request
            );
        }

        // =================================================
        // UPDATE
        // =================================================

        else {

            await apiPut(
                `/events/${eventIdToUpdate}`,
                request
            );
        }


        resetEventForm(
            false
        );


        await loadEvents();


        showEventMessage(
            wasEditing
                ? "Event updated successfully."
                : "Event created successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Save Event Error:",
            error
        );


        showEventMessage(
            error?.message ||
            "Unable to save event.",
            "error"
        );

    }
    finally {

        setEventFormLoading(
            false
        );
    }
}


/* =========================================================
   EVENT FORM VALIDATION
   ========================================================= */

function validateEventForm(
    data
) {

    let valid =
        true;


    // Event name

    if (!data.name) {

        showEventFieldError(
            "eventName",
            "eventNameError",
            "Event name is required."
        );


        valid =
            false;
    }
    else if (
        data.name.length < 2
    ) {

        showEventFieldError(
            "eventName",
            "eventNameError",
            "Event name must contain at least 2 characters."
        );


        valid =
            false;
    }


    // Image URL

    if (
        data.imageUrl &&
        !isValidHttpUrl(
            data.imageUrl
        )
    ) {

        showEventFieldError(
            "eventImageUrl",
            "eventImageUrlError",
            "Enter a valid http or https image URL."
        );


        valid =
            false;
    }


    // Venue

    if (
        !Number.isInteger(
            data.venueId
        ) ||
        data.venueId <= 0
    ) {

        showEventFieldError(
            "eventVenue",
            "eventVenueError",
            "Please select a venue."
        );


        valid =
            false;
    }


    // Category

    if (
        !Number.isInteger(
            data.categoryId
        ) ||
        data.categoryId <= 0
    ) {

        showEventFieldError(
            "eventCategory",
            "eventCategoryError",
            "Please select a category."
        );


        valid =
            false;
    }


    // Date

    if (!data.eventDate) {

        showEventFieldError(
            "eventDate",
            "eventDateError",
            "Event date is required."
        );


        valid =
            false;
    }


    // Start Time

    if (!data.startTime) {

        showEventFieldError(
            "eventStartTime",
            "eventStartTimeError",
            "Start time is required."
        );


        valid =
            false;
    }


    // End Time

    if (!data.endTime) {

        showEventFieldError(
            "eventEndTime",
            "eventEndTimeError",
            "End time is required."
        );


        valid =
            false;
    }


    // Time order

    if (
        data.startTime &&
        data.endTime &&
        data.startTime >= data.endTime
    ) {

        showEventFieldError(
            "eventEndTime",
            "eventEndTimeError",
            "End time must be later than start time."
        );


        valid =
            false;
    }


    // Ticket price

    if (
        !Number.isFinite(
            data.ticketPrice
        ) ||
        data.ticketPrice < 0
    ) {

        showEventFieldError(
            "eventTicketPrice",
            "eventTicketPriceError",
            "Ticket price cannot be negative."
        );


        valid =
            false;
    }


    // Capacity

    if (
        !Number.isInteger(
            data.capacity
        ) ||
        data.capacity <= 0
    ) {

        showEventFieldError(
            "eventCapacity",
            "eventCapacityError",
            "Event capacity must be greater than zero."
        );


        valid =
            false;
    }


    // Venue capacity

    if (
        data.venueId > 0 &&
        data.capacity > 0
    ) {

        const venue =
            venues.find(
                function (item) {

                    return Number(item.id) ===
                        Number(data.venueId);
                }
            );


        if (
            venue &&
            data.capacity >
            Number(venue.totalCapacity)
        ) {

            showEventFieldError(
                "eventCapacity",
                "eventCapacityError",
                `Capacity cannot exceed venue capacity of ${venue.totalCapacity}.`
            );


            valid =
                false;
        }
    }


    return valid;
}


/* =========================================================
   START EVENT EDIT
   ========================================================= */

function startEventEdit(
    eventId
) {

    clearEventMessage();

    clearEventValidation();


    const eventItem =
        events.find(
            function (item) {

                return Number(item.id) ===
                    Number(eventId);
            }
        );


    if (!eventItem) {

        showEventMessage(
            "Event could not be found.",
            "error"
        );


        return;
    }


    editingEventId =
        eventItem.id;


    setInputValue(
        "eventId",
        eventItem.id
    );


    setInputValue(
        "eventName",
        eventItem.name
    );


    setInputValue(
        "eventImageUrl",
        eventItem.imageUrl || ""
    );


    setInputValue(
        "eventVenue",
        eventItem.venueId
    );


    setInputValue(
        "eventCategory",
        eventItem.categoryId
    );


    setInputValue(
        "eventDate",
        normalizeDateForInput(
            eventItem.eventDate
        )
    );


    setInputValue(
        "eventStartTime",
        normalizeTimeForInput(
            eventItem.startTime
        )
    );


    setInputValue(
        "eventEndTime",
        normalizeTimeForInput(
            eventItem.endTime
        )
    );


    setInputValue(
        "eventTicketPrice",
        eventItem.ticketPrice
    );


    setInputValue(
        "eventCapacity",
        eventItem.capacity
    );


    const title =
        document.getElementById(
            "eventFormTitle"
        );


    const saveButton =
        document.getElementById(
            "saveEventButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelEventEditButton"
        );


    if (title) {

        title.textContent =
            "Edit Event";
    }


    if (saveButton) {

        saveButton.textContent =
            "Update Event";
    }


    if (cancelButton) {

        cancelButton.classList.remove(
            "hidden"
        );
    }


    updateVenueCapacityHelper();

    updateEventImagePreview();


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );


    const nameInput =
        document.getElementById(
            "eventName"
        );


    if (nameInput) {

        setTimeout(
            function () {

                nameInput.focus();

            },
            250
        );
    }
}


/* =========================================================
   DELETE EVENT
   ========================================================= */

async function deleteEvent(
    eventId
) {

    clearEventMessage();


    const eventItem =
        events.find(
            function (item) {

                return Number(item.id) ===
                    Number(eventId);
            }
        );


    if (!eventItem) {

        showEventMessage(
            "Event could not be found.",
            "error"
        );


        return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${eventItem.name}"?`
        );


    if (!confirmed) {

        return;
    }


    try {

        await apiDelete(
            `/events/${eventId}`
        );


        if (
            Number(editingEventId) ===
            Number(eventId)
        ) {

            resetEventForm(
                false
            );
        }


        await loadEvents();


        showEventMessage(
            "Event deleted successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Delete Event Error:",
            error
        );


        showEventMessage(
            error?.message ||
            "Unable to delete event.",
            "error"
        );
    }
}


/* =========================================================
   RESET EVENT FORM
   ========================================================= */

function resetEventForm(
    clearMessage = true
) {

    editingEventId =
        null;


    const form =
        document.getElementById(
            "eventForm"
        );


    const title =
        document.getElementById(
            "eventFormTitle"
        );


    const saveButton =
        document.getElementById(
            "saveEventButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelEventEditButton"
        );


    if (form) {

        form.reset();
    }


    setInputValue(
        "eventId",
        ""
    );


    if (title) {

        title.textContent =
            "Add New Event";
    }


    if (saveButton) {

        saveButton.textContent =
            "Create Event";
    }


    if (cancelButton) {

        cancelButton.classList.add(
            "hidden"
        );
    }


    clearEventValidation();

    updateVenueCapacityHelper();

    updateEventImagePreview();


    if (clearMessage) {

        clearEventMessage();
    }
}


/* =========================================================
   SET INPUT VALUE
   ========================================================= */

function setInputValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;
    }


    element.value =
        value === null ||
        value === undefined
            ? ""
            : value;
}


/* =========================================================
   VALIDATION FIELD ERROR
   ========================================================= */

function showEventFieldError(
    inputId,
    errorId,
    message
) {

    const input =
        document.getElementById(
            inputId
        );


    const error =
        document.getElementById(
            errorId
        );


    if (input) {

        input.classList.add(
            "input-error"
        );
    }


    if (error) {

        error.textContent =
            message;
    }
}


/* =========================================================
   CLEAR VALIDATION
   ========================================================= */

function clearEventValidation() {

    const inputIds =
    [
        "eventName",
        "eventImageUrl",
        "eventVenue",
        "eventCategory",
        "eventDate",
        "eventStartTime",
        "eventEndTime",
        "eventTicketPrice",
        "eventCapacity"
    ];


    inputIds.forEach(
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


    const errorIds =
    [
        "eventNameError",
        "eventImageUrlError",
        "eventVenueError",
        "eventCategoryError",
        "eventDateError",
        "eventStartTimeError",
        "eventEndTimeError",
        "eventTicketPriceError",
        "eventCapacityError"
    ];


    errorIds.forEach(
        function (id) {

            const error =
                document.getElementById(
                    id
                );


            if (error) {

                error.textContent =
                    "";
            }
        }
    );
}


/* =========================================================
   EVENT MESSAGE
   ========================================================= */

function showEventMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "eventMessage"
        );


    if (!element) {

        return;
    }


    element.className =
        "alert";


    element.classList.add(
        type === "success"
            ? "alert-success"
            : "alert-error"
    );


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );


    window.setTimeout(
        function () {

            if (
                element.textContent ===
                message
            ) {

                element.classList.add(
                    "hidden"
                );
            }

        },
        5000
    );
}


/* =========================================================
   CLEAR MESSAGE
   ========================================================= */

function clearEventMessage() {

    const element =
        document.getElementById(
            "eventMessage"
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
   EVENT LOADING
   ========================================================= */

function showEventLoading(
    loading
) {

    const element =
        document.getElementById(
            "eventLoading"
        );


    if (!element) {

        return;
    }


    element.classList.toggle(
        "hidden",
        !loading
    );
}


/* =========================================================
   FORM LOADING
   ========================================================= */

function setEventFormLoading(
    loading
) {

    const button =
        document.getElementById(
            "saveEventButton"
        );


    if (!button) {

        return;
    }


    button.disabled =
        loading;


    if (loading) {

        button.textContent =
            editingEventId === null
                ? "Creating..."
                : "Updating...";

    }
    else {

        button.textContent =
            editingEventId === null
                ? "Create Event"
                : "Update Event";
    }
}


/* =========================================================
   NORMALIZE TIME FOR API
   HTML time = HH:mm
   API       = HH:mm:ss
   ========================================================= */

function normalizeTimeForApi(
    value
) {

    if (!value) {

        return "";
    }


    if (
        value.length === 5
    ) {

        return `${value}:00`;
    }


    return value;
}


/* =========================================================
   NORMALIZE TIME FOR INPUT
   API may return HH:mm:ss
   HTML input needs HH:mm
   ========================================================= */

function normalizeTimeForInput(
    value
) {

    if (!value) {

        return "";
    }


    return String(value)
        .substring(
            0,
            5
        );
}


/* =========================================================
   NORMALIZE DATE FOR INPUT
   ========================================================= */

function normalizeDateForInput(
    value
) {

    if (!value) {

        return "";
    }


    return String(value)
        .substring(
            0,
            10
        );
}


/* =========================================================
   FORMAT DISPLAY DATE
   ========================================================= */

function formatEventDate(
    value
) {

    if (!value) {

        return "Date unavailable";
    }


    const rawDate =
        String(value)
            .substring(
                0,
                10
            );


    const parts =
        rawDate.split(
            "-"
        );


    if (
        parts.length !== 3
    ) {

        return rawDate;
    }


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return rawDate;
    }


    return date.toLocaleDateString(
        "en-LK",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   FORMAT DISPLAY TIME
   ========================================================= */

function formatEventTime(
    value
) {

    if (!value) {

        return "--";
    }


    const parts =
        String(value)
            .split(
                ":"
            );


    if (
        parts.length < 2
    ) {

        return value;
    }


    const hours =
        Number(parts[0]);


    const minutes =
        Number(parts[1]);


    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {

        return value;
    }


    const temporaryDate =
        new Date();


    temporaryDate.setHours(
        hours,
        minutes,
        0,
        0
    );


    return temporaryDate
        .toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );
}


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatEventPrice(
    value
) {

    const amount =
        Number(
            value
        );


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return "Rs. 0";
    }


    return `Rs. ${amount.toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;
}


/* =========================================================
   EVENT INITIAL
   ========================================================= */

function getEventInitial(
    name
) {

    if (
        !name ||
        typeof name !== "string"
    ) {

        return "E";
    }


    return escapeEventHtml(
        name
            .trim()
            .charAt(0)
            .toUpperCase()
    );
}


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeEventHtml(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);


    return element.innerHTML;
}


/* =========================================================
   SAFE ATTRIBUTE
   ========================================================= */

function escapeEventAttribute(
    value
) {

    return String(
        value === null ||
        value === undefined
            ? ""
            : value
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#39;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        );
}