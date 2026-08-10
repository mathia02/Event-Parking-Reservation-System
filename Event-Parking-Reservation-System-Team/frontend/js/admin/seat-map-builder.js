/* =========================================================
   EventPark
   Premium Admin Seat Map Builder
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let seatEvents = [];

let currentSeats = [];

let selectedEventId = null;

let selectedEvent = null;

let selectedSeat = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        initializeSeatPageEvents();

        initializeLayoutCalculation();

        await loadSeatEvents();
    }
);


/* =========================================================
   INITIALIZE PAGE EVENTS
   ========================================================= */

function initializeSeatPageEvents() {

    const eventSelect =
        document.getElementById(
            "seatEventSelect"
        );


    const generateButton =
        document.getElementById(
            "generateSeatsButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshSeatsButton"
        );


    const rowPriceForm =
        document.getElementById(
            "rowPriceForm"
        );


    const resetRowPriceButton =
        document.getElementById(
            "resetRowPriceButton"
        );


    const rowPriceSelect =
        document.getElementById(
            "rowPriceLabel"
        );


    const updateSeatStatusButton =
        document.getElementById(
            "updateSeatStatusButton"
        );


    if (eventSelect) {

        eventSelect.addEventListener(
            "change",
            handleSeatEventChange
        );
    }


    if (generateButton) {

        generateButton.addEventListener(
            "click",
            generateSeatLayout
        );
    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                if (!selectedEventId) {

                    showSeatMessage(
                        "Please select an event first.",
                        "error"
                    );


                    return;
                }


                await loadSeatsForSelectedEvent();
            }
        );
    }


    if (rowPriceForm) {

        rowPriceForm.addEventListener(
            "submit",
            updateRowPrice
        );
    }


    if (resetRowPriceButton) {

        resetRowPriceButton.addEventListener(
            "click",
            resetRowPrice
        );
    }


    if (rowPriceSelect) {

        rowPriceSelect.addEventListener(
            "change",
            updateSelectedRowPriceInfo
        );
    }


    if (updateSeatStatusButton) {

        updateSeatStatusButton.addEventListener(
            "click",
            saveSelectedSeatStatus
        );
    }
}


/* =========================================================
   INITIALIZE ROW × SEAT CALCULATION
   ========================================================= */

function initializeLayoutCalculation() {

    const rowInput =
        document.getElementById(
            "seatRows"
        );


    const perRowInput =
        document.getElementById(
            "seatPerRow"
        );


    if (rowInput) {

        rowInput.addEventListener(
            "input",
            updateSeatLayoutCalculation
        );
    }


    if (perRowInput) {

        perRowInput.addEventListener(
            "input",
            updateSeatLayoutCalculation
        );
    }


    updateSeatLayoutCalculation();
}


/* =========================================================
   LOAD EVENTS
   GET /api/Events
   ========================================================= */

async function loadSeatEvents() {

    try {

        const response =
            await apiGet(
                "/events"
            );


        seatEvents =
            Array.isArray(response)
                ? response
                : response?.data || [];


        populateSeatEventDropdown();

    }
    catch (error) {

        console.error(
            "Load Seat Events Error:",
            error
        );


        showSeatMessage(
            error?.message ||
            "Unable to load events.",
            "error"
        );
    }
}


/* =========================================================
   POPULATE EVENT SELECT
   ========================================================= */

function populateSeatEventDropdown() {

    const select =
        document.getElementById(
            "seatEventSelect"
        );


    if (!select) {

        return;
    }


    select.innerHTML =
        `
        <option value="">
            Select an event
        </option>
        `;


    seatEvents.forEach(
        function (eventItem) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                eventItem.id;


            option.textContent =
                `${eventItem.name} — Capacity ${eventItem.capacity}`;


            select.appendChild(
                option
            );
        }
    );
}


/* =========================================================
   EVENT CHANGE
   ========================================================= */

async function handleSeatEventChange(
    event
) {

    clearSeatMessage();

    clearSeatErrors();


    const eventId =
        Number(
            event.target.value
        );


    if (!eventId) {

        resetSeatPage();

        return;
    }


    selectedEventId =
        eventId;


    selectedEvent =
        seatEvents.find(
            function (item) {

                return Number(item.id) ===
                    Number(eventId);
            }
        ) || null;


    selectedSeat =
        null;


    updateSelectedEventInformation();

    updateSeatLayoutCalculation();

    await loadSeatsForSelectedEvent();
}


/* =========================================================
   SELECTED EVENT INFO
   ========================================================= */

function updateSelectedEventInformation() {

    const container =
        document.getElementById(
            "selectedEventInfo"
        );


    const nameElement =
        document.getElementById(
            "selectedEventName"
        );


    const metaElement =
        document.getElementById(
            "selectedEventMeta"
        );


    const selectedCapacity =
        document.getElementById(
            "selectedEventCapacity"
        );


    const headerCapacity =
        document.getElementById(
            "seatEventCapacity"
        );


    const requiredCapacity =
        document.getElementById(
            "seatRequiredCapacity"
        );


    if (!selectedEvent) {

        if (container) {

            container.classList.add(
                "hidden"
            );
        }


        return;
    }


    if (container) {

        container.classList.remove(
            "hidden"
        );
    }


    if (nameElement) {

        nameElement.textContent =
            selectedEvent.name;
    }


    if (metaElement) {

        const venue =
            selectedEvent.venueName ||
            "Venue unavailable";


        const category =
            selectedEvent.categoryName ||
            "Uncategorized";


        const date =
            formatSeatEventDate(
                selectedEvent.eventDate
            );


        metaElement.textContent =
            `${venue} • ${category} • ${date}`;
    }


    const capacity =
        Number(
            selectedEvent.capacity || 0
        );


    if (selectedCapacity) {

        selectedCapacity.textContent =
            capacity.toLocaleString();
    }


    if (headerCapacity) {

        headerCapacity.textContent =
            capacity.toLocaleString();
    }


    if (requiredCapacity) {

        requiredCapacity.textContent =
            capacity.toLocaleString();
    }
}


/* =========================================================
   LOAD SEATS
   GET /api/events/{eventId}/seats
   ========================================================= */

async function loadSeatsForSelectedEvent() {

    if (!selectedEventId) {

        return;
    }


    showSeatLoading(
        true
    );


    try {

        const response =
            await apiGet(
                `/events/${selectedEventId}/seats`
            );


        currentSeats =
            Array.isArray(response)
                ? response
                : response?.data || [];


        updateGeneratedSeatCount();

        updateGenerationStatus();

        updateSeatSummary();

        renderSeatMap();

        populateRowPriceDropdown();

        clearSelectedSeat();

    }
    catch (error) {

        console.error(
            "Load Seats Error:",
            error
        );


        currentSeats =
            [];


        updateGeneratedSeatCount();

        updateGenerationStatus();

        updateSeatSummary();

        renderSeatMap();


        showSeatMessage(
            error?.message ||
            "Unable to load the seat map.",
            "error"
        );

    }
    finally {

        showSeatLoading(
            false
        );
    }
}


/* =========================================================
   GENERATED COUNT
   ========================================================= */

function updateGeneratedSeatCount() {

    const element =
        document.getElementById(
            "seatGeneratedCount"
        );


    if (element) {

        element.textContent =
            currentSeats.length
                .toLocaleString();
    }
}


/* =========================================================
   GENERATION STATUS
   ========================================================= */

function updateGenerationStatus() {

    const status =
        document.getElementById(
            "seatGenerationStatus"
        );


    const button =
        document.getElementById(
            "generateSeatsButton"
        );


    if (!status) {

        return;
    }


    if (
        currentSeats.length > 0
    ) {

        status.textContent =
            "Generated";


        status.className =
            "seat-generation-status generated";


        if (button) {

            button.disabled =
                true;


            button.textContent =
                "Seats Already Generated";
        }

    }
    else {

        status.textContent =
            "Not generated";


        status.className =
            "seat-generation-status";


        if (button) {

            button.disabled =
                false;


            button.textContent =
                "Generate Seat Layout";
        }
    }
}


/* =========================================================
   LAYOUT CALCULATION
   ========================================================= */

function updateSeatLayoutCalculation() {

    const rowsInput =
        document.getElementById(
            "seatRows"
        );


    const perRowInput =
        document.getElementById(
            "seatPerRow"
        );


    const totalElement =
        document.getElementById(
            "seatLayoutTotal"
        );


    const helper =
        document.getElementById(
            "seatLayoutHelper"
        );


    const requiredElement =
        document.getElementById(
            "seatRequiredCapacity"
        );


    const rows =
        Number(
            rowsInput?.value || 0
        );


    const seatsPerRow =
        Number(
            perRowInput?.value || 0
        );


    const total =
        rows *
        seatsPerRow;


    const required =
        Number(
            selectedEvent?.capacity || 0
        );


    if (totalElement) {

        totalElement.textContent =
            total.toLocaleString();
    }


    if (requiredElement) {

        requiredElement.textContent =
            required.toLocaleString();
    }


    if (!helper) {

        return;
    }


    if (!selectedEvent) {

        helper.textContent =
            "Select an event before generating the seat layout.";


        helper.className =
            "form-helper-text";


        return;
    }


    if (
        rows <= 0 ||
        seatsPerRow <= 0
    ) {

        helper.textContent =
            `Rows × Seats Per Row must exactly match ${required} seats.`;


        helper.className =
            "form-helper-text";


        return;
    }


    if (
        total === required
    ) {

        helper.textContent =
            `Perfect match — ${rows} × ${seatsPerRow} = ${required} seats.`;


        helper.className =
            "form-helper-text seat-layout-valid";

    }
    else {

        helper.textContent =
            `Layout creates ${total} seats, but this event requires exactly ${required}.`;


        helper.className =
            "form-helper-text seat-layout-invalid";
    }
}


/* =========================================================
   GENERATE SEATS
   POST /api/events/{eventId}/seats/generate
   ========================================================= */

async function generateSeatLayout() {

    clearSeatMessage();

    clearSeatErrors();


    if (!selectedEventId) {

        showSeatFieldError(
            "seatEventSelect",
            "seatEventError",
            "Please select an event."
        );


        return;
    }


    if (
        currentSeats.length > 0
    ) {

        showSeatMessage(
            "Seats have already been generated for this event.",
            "error"
        );


        return;
    }


    const rowsInput =
        document.getElementById(
            "seatRows"
        );


    const perRowInput =
        document.getElementById(
            "seatPerRow"
        );


    const rows =
        Number(
            rowsInput?.value || 0
        );


    const seatsPerRow =
        Number(
            perRowInput?.value || 0
        );


    let valid =
        true;


    if (
        !Number.isInteger(rows) ||
        rows <= 0
    ) {

        showSeatFieldError(
            "seatRows",
            "seatRowsError",
            "Enter a valid number of rows."
        );


        valid =
            false;
    }


    if (
        !Number.isInteger(seatsPerRow) ||
        seatsPerRow <= 0
    ) {

        showSeatFieldError(
            "seatPerRow",
            "seatPerRowError",
            "Enter a valid number of seats per row."
        );


        valid =
            false;
    }


    const requiredCapacity =
        Number(
            selectedEvent?.capacity || 0
        );


    if (
        valid &&
        rows * seatsPerRow !==
        requiredCapacity
    ) {

        showSeatMessage(
            `The layout must contain exactly ${requiredCapacity} seats.`,
            "error"
        );


        return;
    }


    if (!valid) {

        return;
    }


    const button =
        document.getElementById(
            "generateSeatsButton"
        );


    if (button) {

        button.disabled =
            true;


        button.textContent =
            "Generating...";
    }


    try {

        await apiPost(
            `/events/${selectedEventId}/seats/generate`,
            {
                rows:
                    rows,

                seatsPerRow:
                    seatsPerRow
            }
        );


        await loadSeatsForSelectedEvent();


        showSeatMessage(
            "Seat layout generated successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Generate Seats Error:",
            error
        );


        showSeatMessage(
            error?.message ||
            "Unable to generate the seat layout.",
            "error"
        );


        updateGenerationStatus();
    }
}


/* =========================================================
   SEAT SUMMARY
   ========================================================= */

function updateSeatSummary() {

    const available =
        currentSeats.filter(
            seat =>
                normalizeSeatStatus(
                    seat.status
                ) === "available"
        ).length;


    const held =
        currentSeats.filter(
            seat =>
                normalizeSeatStatus(
                    seat.status
                ) === "held"
        ).length;


    const booked =
        currentSeats.filter(
            seat =>
                normalizeSeatStatus(
                    seat.status
                ) === "booked"
        ).length;


    const unavailable =
        currentSeats.filter(
            seat =>
                normalizeSeatStatus(
                    seat.status
                ) === "unavailable"
        ).length;


    setSeatText(
        "availableSeatCount",
        available
    );


    setSeatText(
        "heldSeatCount",
        held
    );


    setSeatText(
        "bookedSeatCount",
        booked
    );


    setSeatText(
        "unavailableSeatCount",
        unavailable
    );
}


/* =========================================================
   RENDER SEAT MAP
   ========================================================= */

function renderSeatMap() {

    const container =
        document.getElementById(
            "seatRowsContainer"
        );


    const mapContent =
        document.getElementById(
            "seatMapContent"
        );


    const emptyState =
        document.getElementById(
            "seatEmptyState"
        );


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    if (!selectedEvent) {

        showSeatEmptyState(
            "Select an event",
            "Choose an event to load or generate its seat layout."
        );


        return;
    }


    if (
        currentSeats.length === 0
    ) {

        if (mapContent) {

            mapContent.classList.add(
                "hidden"
            );
        }


        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );
        }


        showSeatEmptyState(
            "No seats generated",
            "Use the Seat Layout Setup panel to generate seats for this event."
        );


        return;
    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );
    }


    if (mapContent) {

        mapContent.classList.remove(
            "hidden"
        );
    }


    const rowMap =
        new Map();


    currentSeats.forEach(
        function (seat) {

            const row =
                String(
                    seat.rowLabel || ""
                )
                .trim()
                .toUpperCase();


            if (
                !rowMap.has(row)
            ) {

                rowMap.set(
                    row,
                    []
                );
            }


            rowMap
                .get(row)
                .push(seat);
        }
    );


    const rows =
        Array.from(
            rowMap.keys()
        )
        .sort(
            compareSeatRowLabels
        );


    rows.forEach(
        function (rowLabel) {

            const seats =
                rowMap
                    .get(rowLabel)
                    .sort(
                        function (
                            first,
                            second
                        ) {

                            return Number(
                                first.columnNumber
                            )
                            -
                            Number(
                                second.columnNumber
                            );
                        }
                    );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "seat-visual-row";


            const rowLabelElement =
                document.createElement(
                    "div"
                );


            rowLabelElement.className =
                "seat-visual-row-label";


            rowLabelElement.textContent =
                rowLabel;


            const seatsContainer =
                document.createElement(
                    "div"
                );


            seatsContainer.className =
                "seat-visual-row-seats";


            seats.forEach(
                function (seat) {

                    const button =
                        createSeatButton(
                            seat
                        );


                    seatsContainer.appendChild(
                        button
                    );
                }
            );


            row.appendChild(
                rowLabelElement
            );


            row.appendChild(
                seatsContainer
            );


            container.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   CREATE INDIVIDUAL SEAT BUTTON
   ========================================================= */
function createSeatButton(
    seat
) {

    const button =
        document.createElement(
            "button"
        );


    const status =
        normalizeSeatStatus(
            seat.status
        );


    button.type =
        "button";


    button.className =
        `seat-map-seat seat-${status}`;


    button.textContent =
        seat.seatNumber;


    button.title =
        `${seat.seatNumber} • ${seat.status} • ${formatSeatPrice(
            seat.effectivePrice
        )}`;


    // =====================================================
    // BOOKED SEAT - NOT CLICKABLE
    // =====================================================

    if (status === "booked") {

        button.disabled =
            true;


        button.setAttribute(
            "aria-disabled",
            "true"
        );


        button.classList.add(
            "seat-not-clickable"
        );


        button.title =
            `${seat.seatNumber} • Booked • This seat cannot be selected`;


        return button;
    }


    // =====================================================
    // SELECTED SEAT
    // =====================================================

    function selectSeat(
    seatId
) {

    const seat =
        currentSeats.find(
            function (item) {

                return Number(item.id) ===
                    Number(seatId);
            }
        );


    if (!seat) {

        return;
    }


    // =====================================================
    // BOOKED SEAT SAFETY CHECK
    // =====================================================

    if (
        normalizeSeatStatus(
            seat.status
        ) === "booked"
    ) {

        selectedSeat =
            null;


        renderSeatMap();

        renderSelectedSeatPanel();


        showSeatMessage(
            `${seat.seatNumber} is already booked and cannot be selected.`,
            "error"
        );


        return;
    }


    selectedSeat =
        seat;


    renderSeatMap();

    renderSelectedSeatPanel();
}

    // =====================================================
    // CLICKABLE SEATS
    // Available / Held / Unavailable
    // =====================================================

    button.addEventListener(
        "click",
        function () {

            selectSeat(
                seat.id
            );
        }
    );


    return button;
}
/* =========================================================
   SELECTED SEAT PANEL
   ========================================================= */

function renderSelectedSeatPanel() {

    const emptyPanel =
        document.getElementById(
            "noSeatSelected"
        );


    const panel =
        document.getElementById(
            "selectedSeatPanel"
        );


    if (!selectedSeat) {

        if (emptyPanel) {

            emptyPanel.classList.remove(
                "hidden"
            );
        }


        if (panel) {

            panel.classList.add(
                "hidden"
            );
        }


        return;
    }


    if (emptyPanel) {

        emptyPanel.classList.add(
            "hidden"
        );
    }


    if (panel) {

        panel.classList.remove(
            "hidden"
        );
    }


    setSeatText(
        "selectedSeatNumber",
        selectedSeat.seatNumber
    );


    setSeatText(
        "selectedSeatRow",
        selectedSeat.rowLabel
    );


    setSeatText(
        "selectedSeatColumn",
        selectedSeat.columnNumber
    );


    setSeatText(
        "selectedSeatPrice",
        formatSeatPrice(
            selectedSeat.effectivePrice
        )
    );


    const statusBadge =
        document.getElementById(
            "selectedSeatStatusBadge"
        );


    const statusSelect =
        document.getElementById(
            "selectedSeatStatus"
        );


    const status =
        String(
            selectedSeat.status ||
            "Available"
        );


    if (statusBadge) {

        statusBadge.textContent =
            status;


        statusBadge.className =
            `seat-status-badge ${normalizeSeatStatus(status)}`;
    }


    if (statusSelect) {

        statusSelect.value =
            status;
    }
}


/* =========================================================
   CLEAR SELECTED SEAT
   ========================================================= */

function clearSelectedSeat() {

    selectedSeat =
        null;


    renderSelectedSeatPanel();
}


/* =========================================================
   UPDATE SEAT STATUS
   PUT /api/seats/{id}/status
   ========================================================= */

async function saveSelectedSeatStatus() {

    clearSeatMessage();


    if (!selectedSeat) {

        showSeatMessage(
            "Please select a seat first.",
            "error"
        );


        return;
    }


    const statusSelect =
        document.getElementById(
            "selectedSeatStatus"
        );


    const status =
        statusSelect?.value;


    if (!status) {

        showSeatMessage(
            "Please select a seat status.",
            "error"
        );


        return;
    }


    const button =
        document.getElementById(
            "updateSeatStatusButton"
        );


    if (button) {

        button.disabled =
            true;


        button.textContent =
            "Updating...";
    }


    try {

        await apiPut(
            `/seats/${selectedSeat.id}/status`,
            {
                status:
                    status
            }
        );


        const selectedSeatId =
            selectedSeat.id;


        await loadSeatsForSelectedEvent();


        const refreshedSeat =
            currentSeats.find(
                seat =>
                    Number(seat.id) ===
                    Number(selectedSeatId)
            );


       if (refreshedSeat) {

    if (
        normalizeSeatStatus(
            refreshedSeat.status
        ) === "booked"
    ) {

        selectedSeat =
            null;


        renderSeatMap();

        renderSelectedSeatPanel();

    }
    else {

        selectedSeat =
            refreshedSeat;


        renderSeatMap();

        renderSelectedSeatPanel();
    }
}


showSeatMessage(
    normalizeSeatStatus(status) === "booked"
        ? "Seat status updated to Booked. Booked seats can no longer be selected."
        : "Seat status updated successfully.",
    "success"
);
    }
    catch (error) {

        console.error(
            "Update Seat Status Error:",
            error
        );


        showSeatMessage(
            error?.message ||
            "Unable to update seat status.",
            "error"
        );

    }
    finally {

        if (button) {

            button.disabled =
                false;


            button.textContent =
                "Update Seat Status";
        }
    }
}


/* =========================================================
   POPULATE ROW PRICE SELECT
   ========================================================= */

function populateRowPriceDropdown() {

    const select =
        document.getElementById(
            "rowPriceLabel"
        );


    if (!select) {

        return;
    }


    select.innerHTML =
        `
        <option value="">
            Select row
        </option>
        `;


    const rows =
        [
            ...new Set(
                currentSeats
                    .map(
                        seat =>
                            String(
                                seat.rowLabel || ""
                            )
                            .toUpperCase()
                    )
            )
        ]
        .filter(Boolean)
        .sort(
            compareSeatRowLabels
        );


    rows.forEach(
        function (rowLabel) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                rowLabel;


            option.textContent =
                `Row ${rowLabel}`;


            select.appendChild(
                option
            );
        }
    );


    updateSelectedRowPriceInfo();
}


/* =========================================================
   ROW PRICE CURRENT INFORMATION
   ========================================================= */

function updateSelectedRowPriceInfo() {

    const rowSelect =
        document.getElementById(
            "rowPriceLabel"
        );


    const info =
        document.getElementById(
            "rowPriceCurrentInfo"
        );


    const input =
        document.getElementById(
            "rowPriceOverride"
        );


    const rowLabel =
        rowSelect?.value;


    if (!rowLabel) {

        if (info) {

            info.classList.add(
                "hidden"
            );
        }


        if (input) {

            input.value =
                "";
        }


        return;
    }


    const rowSeats =
        currentSeats.filter(
            seat =>
                String(
                    seat.rowLabel
                )
                .toUpperCase() ===
                String(
                    rowLabel
                )
                .toUpperCase()
        );


    if (
        rowSeats.length === 0
    ) {

        return;
    }


    const firstSeat =
        rowSeats[0];


    const basePrice =
        Number(
            selectedEvent?.ticketPrice || 0
        );


    const currentPrice =
        firstSeat.priceOverride === null ||
        firstSeat.priceOverride === undefined
            ? basePrice
            : Number(
                firstSeat.priceOverride
            );


    setSeatText(
        "rowEventBasePrice",
        formatSeatPrice(
            basePrice
        )
    );


    setSeatText(
        "rowCurrentPrice",
        formatSeatPrice(
            currentPrice
        )
    );


    if (input) {

        input.value =
            firstSeat.priceOverride === null ||
            firstSeat.priceOverride === undefined
                ? ""
                : firstSeat.priceOverride;
    }


    if (info) {

        info.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   UPDATE ROW PRICE
   PUT /api/events/{eventId}/seats/row-price
   ========================================================= */

async function updateRowPrice(
    event
) {

    event.preventDefault();


    clearSeatMessage();

    clearSeatErrors();


    if (!selectedEventId) {

        showSeatMessage(
            "Please select an event first.",
            "error"
        );


        return;
    }


    const rowSelect =
        document.getElementById(
            "rowPriceLabel"
        );


    const priceInput =
        document.getElementById(
            "rowPriceOverride"
        );


    const rowLabel =
        rowSelect?.value;


    if (!rowLabel) {

        showSeatFieldError(
            "rowPriceLabel",
            "rowPriceLabelError",
            "Please select a row."
        );


        return;
    }


    let priceOverride =
        null;


    if (
        priceInput &&
        priceInput.value.trim() !== ""
    ) {

        priceOverride =
            Number(
                priceInput.value
            );


        if (
            !Number.isFinite(
                priceOverride
            ) ||
            priceOverride < 0
        ) {

            showSeatFieldError(
                "rowPriceOverride",
                "rowPriceOverrideError",
                "Price override cannot be negative."
            );


            return;
        }
    }


    const button =
        document.getElementById(
            "updateRowPriceButton"
        );


    if (button) {

        button.disabled =
            true;


        button.textContent =
            "Updating...";
    }


    try {

        await apiPut(
            `/events/${selectedEventId}/seats/row-price`,
            {
                rowLabel:
                    rowLabel,

                priceOverride:
                    priceOverride
            }
        );


        await loadSeatsForSelectedEvent();


        const select =
            document.getElementById(
                "rowPriceLabel"
            );


        if (select) {

            select.value =
                rowLabel;
        }


        updateSelectedRowPriceInfo();


        showSeatMessage(
            `Row ${rowLabel} price updated successfully.`,
            "success"
        );

    }
    catch (error) {

        console.error(
            "Update Row Price Error:",
            error
        );


        showSeatMessage(
            error?.message ||
            "Unable to update row price.",
            "error"
        );

    }
    finally {

        if (button) {

            button.disabled =
                false;


            button.textContent =
                "Update Row Price";
        }
    }
}


/* =========================================================
   RESET ROW PRICE TO EVENT PRICE
   ========================================================= */

async function resetRowPrice() {

    const rowSelect =
        document.getElementById(
            "rowPriceLabel"
        );


    const rowLabel =
        rowSelect?.value;


    if (!rowLabel) {

        showSeatMessage(
            "Please select a row first.",
            "error"
        );


        return;
    }


    const input =
        document.getElementById(
            "rowPriceOverride"
        );


    if (input) {

        input.value =
            "";
    }


    const form =
        document.getElementById(
            "rowPriceForm"
        );


    if (form) {

        form.dispatchEvent(
            new Event(
                "submit",
                {
                    cancelable: true,
                    bubbles: true
                }
            )
        );
    }
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showSeatEmptyState(
    title,
    description
) {

    const emptyState =
        document.getElementById(
            "seatEmptyState"
        );


    if (!emptyState) {

        return;
    }


    const heading =
        emptyState.querySelector(
            "h3"
        );


    const paragraph =
        emptyState.querySelector(
            "p"
        );


    if (heading) {

        heading.textContent =
            title;
    }


    if (paragraph) {

        paragraph.textContent =
            description;
    }


    emptyState.classList.remove(
        "hidden"
    );
}


/* =========================================================
   RESET PAGE
   ========================================================= */

function resetSeatPage() {

    selectedEventId =
        null;


    selectedEvent =
        null;


    currentSeats =
        [];


    selectedSeat =
        null;


    const info =
        document.getElementById(
            "selectedEventInfo"
        );


    if (info) {

        info.classList.add(
            "hidden"
        );
    }


    setSeatText(
        "seatEventCapacity",
        0
    );


    setSeatText(
        "seatGeneratedCount",
        0
    );


    setSeatText(
        "seatRequiredCapacity",
        0
    );


    updateSeatSummary();

    updateGenerationStatus();

    updateSeatLayoutCalculation();

    populateRowPriceDropdown();

    renderSeatMap();

    renderSelectedSeatPanel();
}


/* =========================================================
   ERROR DISPLAY
   ========================================================= */

function showSeatFieldError(
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
   CLEAR ERRORS
   ========================================================= */

function clearSeatErrors() {

    const inputIds =
    [
        "seatEventSelect",
        "seatRows",
        "seatPerRow",
        "rowPriceLabel",
        "rowPriceOverride"
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
        "seatEventError",
        "seatRowsError",
        "seatPerRowError",
        "rowPriceLabelError",
        "rowPriceOverrideError"
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
   MESSAGE
   ========================================================= */

function showSeatMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "seatMessage"
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


    // =====================================================
    // AUTO SCROLL TO MESSAGE
    // =====================================================

    element.scrollIntoView(
        {
            behavior: "smooth",
            block: "center"
        }
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

function clearSeatMessage() {

    const element =
        document.getElementById(
            "seatMessage"
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

function showSeatLoading(
    loading
) {

    const element =
        document.getElementById(
            "seatLoading"
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
   STATUS NORMALIZER
   ========================================================= */

function normalizeSeatStatus(
    status
) {

    const value =
        String(
            status || "Available"
        )
        .trim()
        .toLowerCase();


    const allowed =
    [
        "available",
        "held",
        "booked",
        "unavailable"
    ];


    return allowed.includes(
        value
    )
        ? value
        : "available";
}


/* =========================================================
   ROW SORT
   A, B ... Z, AA, AB
   ========================================================= */

function compareSeatRowLabels(
    first,
    second
) {

    return rowLabelToNumber(first)
        -
        rowLabelToNumber(second);
}


function rowLabelToNumber(
    value
) {

    const text =
        String(value)
            .toUpperCase();


    let result =
        0;


    for (
        let index = 0;
        index < text.length;
        index++
    ) {

        result =
            result * 26
            +
            (
                text.charCodeAt(index)
                -
                64
            );
    }


    return result;
}


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatSeatPrice(
    value
) {

    const amount =
        Number(
            value || 0
        );


    return `Rs. ${amount.toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;
}


/* =========================================================
   FORMAT EVENT DATE
   ========================================================= */

function formatSeatEventDate(
    value
) {

    if (!value) {

        return "Date unavailable";
    }


    const raw =
        String(value)
            .substring(
                0,
                10
            );


    const parts =
        raw.split(
            "-"
        );


    if (
        parts.length !== 3
    ) {

        return raw;
    }


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );


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
   TEXT HELPER
   ========================================================= */

function setSeatText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}