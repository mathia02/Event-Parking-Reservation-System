/* =========================================================
   EventPark
   Premium Admin Category Management
   ========================================================= */


let categories = [];

let editingCategoryId = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        initializeCategoryForm();

        initializeCategoryButtons();

        initializeDescriptionCounter();

        await loadCategories();
    }
);


/* =========================================================
   INITIALIZE FORM
   ========================================================= */

function initializeCategoryForm() {

    const form =
        document.getElementById(
            "categoryForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleCategorySubmit
    );
}


/* =========================================================
   INITIALIZE BUTTONS
   ========================================================= */

function initializeCategoryButtons() {

    const cancelButton =
        document.getElementById(
            "cancelCategoryEditButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshCategoriesButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                resetCategoryForm();
            }
        );
    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                await loadCategories();
            }
        );
    }
}


/* =========================================================
   DESCRIPTION CHARACTER COUNTER
   ========================================================= */

function initializeDescriptionCounter() {

    const descriptionInput =
        document.getElementById(
            "categoryDescription"
        );


    if (!descriptionInput) {
        return;
    }


    updateDescriptionCounter();


    descriptionInput.addEventListener(
        "input",
        updateDescriptionCounter
    );
}


function updateDescriptionCounter() {

    const descriptionInput =
        document.getElementById(
            "categoryDescription"
        );


    const counter =
        document.getElementById(
            "categoryDescriptionCount"
        );


    if (
        !descriptionInput ||
        !counter
    ) {
        return;
    }


    const length =
        descriptionInput.value.length;


    counter.textContent =
        `${length} / 500`;
}


/* =========================================================
   LOAD CATEGORIES
   GET /api/Categories
   ========================================================= */

async function loadCategories() {

    showCategoryLoading(true);


    try {

        const response =
            await apiGet(
                "/categories"
            );


        categories =
            Array.isArray(response)
                ? response
                : response?.data || [];


        updateCategoryCounts();

        renderCategories();

    }
    catch (error) {

        console.error(
            "Load Categories Error:",
            error
        );


        showCategoryMessage(
            error?.message ||
            "Unable to load categories.",
            "error"
        );

    }
    finally {

        showCategoryLoading(false);
    }
}


/* =========================================================
   UPDATE COUNTS
   ========================================================= */

function updateCategoryCounts() {

    const total =
        categories.length;


    const headerCount =
        document.getElementById(
            "categoryTotalCount"
        );


    const summaryCount =
        document.getElementById(
            "categorySummaryCount"
        );


    if (headerCount) {

        headerCount.textContent =
            total;
    }


    if (summaryCount) {

        summaryCount.textContent =
            total;
    }
}


/* =========================================================
   RENDER CATEGORIES
   ========================================================= */

function renderCategories() {

    const tableBody =
        document.getElementById(
            "categoryTableBody"
        );


    const emptyState =
        document.getElementById(
            "categoryEmpty"
        );


    const tableWrapper =
        document.getElementById(
            "categoryTableWrapper"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        "";


    if (
        !categories ||
        categories.length === 0
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


    categories.forEach(
        function (category) {

            const row =
                document.createElement(
                    "tr"
                );


            const safeId =
                escapeCategoryHtml(
                    category.id
                );


            const safeName =
                escapeCategoryHtml(
                    category.name
                );


            const safeDescription =
                escapeCategoryHtml(
                    category.description ||
                    "No description provided"
                );


            row.innerHTML =
                `
                <td>
                    <span class="category-id-badge">
                        #${safeId}
                    </span>
                </td>

                <td>

                    <div class="category-name-cell">

                        <span class="category-letter">
                            ${getCategoryInitial(category.name)}
                        </span>

                        <div>

                            <strong>
                                ${safeName}
                            </strong>

                            <span>
                                Event category
                            </span>

                        </div>

                    </div>

                </td>

                <td>

                    <p class="category-description-text">
                        ${safeDescription}
                    </p>

                </td>

                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="btn btn-sm btn-edit"
                            data-action="edit"
                            data-id="${category.id}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            data-action="delete"
                            data-id="${category.id}"
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


    initializeCategoryTableActions();
}


/* =========================================================
   CATEGORY INITIAL
   ========================================================= */

function getCategoryInitial(
    name
) {

    if (
        !name ||
        typeof name !== "string"
    ) {

        return "C";
    }


    return escapeCategoryHtml(
        name.trim()
            .charAt(0)
            .toUpperCase()
    );
}


/* =========================================================
   TABLE ACTIONS
   ========================================================= */

function initializeCategoryTableActions() {

    const buttons =
        document.querySelectorAll(
            "#categoryTableBody button[data-action]"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const action =
                        button.dataset.action;


                    const categoryId =
                        Number(
                            button.dataset.id
                        );


                    if (action === "edit") {

                        startCategoryEdit(
                            categoryId
                        );


                        return;
                    }


                    if (action === "delete") {

                        deleteCategory(
                            categoryId
                        );
                    }
                }
            );
        }
    );
}


/* =========================================================
   CREATE / UPDATE
   ========================================================= */

async function handleCategorySubmit(
    event
) {

    event.preventDefault();


    clearCategoryMessage();

    clearCategoryValidation();


    const nameInput =
        document.getElementById(
            "categoryName"
        );


    const descriptionInput =
        document.getElementById(
            "categoryDescription"
        );


    if (
        !nameInput ||
        !descriptionInput
    ) {

        showCategoryMessage(
            "Category form is not configured correctly.",
            "error"
        );


        return;
    }


    const name =
        nameInput.value.trim();


    const description =
        descriptionInput.value.trim();


    const isValid =
        validateCategoryForm(
            name,
            description
        );


    if (!isValid) {

        return;
    }


    const request =
    {
        name:
            name,

        description:
            description || null
    };


    const wasEditing =
        editingCategoryId !== null;


    const categoryIdToUpdate =
        editingCategoryId;


    setCategoryFormLoading(
        true
    );


    try {

        // =================================================
        // CREATE
        // =================================================

        if (!wasEditing) {

            await apiPost(
                "/categories",
                request
            );
        }

        // =================================================
        // UPDATE
        // =================================================

        else {

            await apiPut(
                `/categories/${categoryIdToUpdate}`,
                request
            );
        }


        resetCategoryForm(
            false
        );


        await loadCategories();


        showCategoryMessage(
            wasEditing
                ? "Category updated successfully."
                : "Category created successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Save Category Error:",
            error
        );


        showCategoryMessage(
            error?.message ||
            "Unable to save category.",
            "error"
        );

    }
    finally {

        setCategoryFormLoading(
            false
        );
    }
}


/* =========================================================
   VALIDATE CATEGORY FORM
   ========================================================= */

function validateCategoryForm(
    name,
    description
) {

    let isValid =
        true;


    if (!name) {

        showCategoryFieldError(
            "categoryName",
            "categoryNameError",
            "Category name is required."
        );


        isValid =
            false;
    }
    else if (name.length < 2) {

        showCategoryFieldError(
            "categoryName",
            "categoryNameError",
            "Category name must contain at least 2 characters."
        );


        isValid =
            false;
    }
    else if (name.length > 100) {

        showCategoryFieldError(
            "categoryName",
            "categoryNameError",
            "Category name cannot exceed 100 characters."
        );


        isValid =
            false;
    }


    if (
        description &&
        description.length > 500
    ) {

        showCategoryFieldError(
            "categoryDescription",
            "categoryDescriptionError",
            "Description cannot exceed 500 characters."
        );


        isValid =
            false;
    }


    return isValid;
}


/* =========================================================
   START EDIT
   ========================================================= */

function startCategoryEdit(
    categoryId
) {

    clearCategoryMessage();

    clearCategoryValidation();


    const category =
        categories.find(
            function (item) {

                return Number(item.id) ===
                    Number(categoryId);
            }
        );


    if (!category) {

        showCategoryMessage(
            "Category could not be found.",
            "error"
        );


        return;
    }


    editingCategoryId =
        category.id;


    const idInput =
        document.getElementById(
            "categoryId"
        );


    const nameInput =
        document.getElementById(
            "categoryName"
        );


    const descriptionInput =
        document.getElementById(
            "categoryDescription"
        );


    const title =
        document.getElementById(
            "categoryFormTitle"
        );


    const saveButton =
        document.getElementById(
            "saveCategoryButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelCategoryEditButton"
        );


    if (idInput) {

        idInput.value =
            category.id;
    }


    if (nameInput) {

        nameInput.value =
            category.name || "";
    }


    if (descriptionInput) {

        descriptionInput.value =
            category.description || "";
    }


    if (title) {

        title.textContent =
            "Edit Category";
    }


    if (saveButton) {

        saveButton.textContent =
            "Update Category";
    }


    if (cancelButton) {

        cancelButton.classList.remove(
            "hidden"
        );
    }


    updateDescriptionCounter();


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
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
   DELETE CATEGORY
   ========================================================= */

async function deleteCategory(
    categoryId
) {

    clearCategoryMessage();


    const category =
        categories.find(
            function (item) {

                return Number(item.id) ===
                    Number(categoryId);
            }
        );


    if (!category) {

        showCategoryMessage(
            "Category could not be found.",
            "error"
        );


        return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${category.name}"?\n\nCategories assigned to events cannot be deleted.`
        );


    if (!confirmed) {

        return;
    }


    try {

        await apiDelete(
            `/categories/${categoryId}`
        );


        if (
            Number(editingCategoryId) ===
            Number(categoryId)
        ) {

            resetCategoryForm(
                false
            );
        }


        await loadCategories();


        showCategoryMessage(
            "Category deleted successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Delete Category Error:",
            error
        );


        showCategoryMessage(
            error?.message ||
            "Unable to delete category.",
            "error"
        );
    }
}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetCategoryForm(
    clearMessage = true
) {

    editingCategoryId =
        null;


    const form =
        document.getElementById(
            "categoryForm"
        );


    const idInput =
        document.getElementById(
            "categoryId"
        );


    const title =
        document.getElementById(
            "categoryFormTitle"
        );


    const saveButton =
        document.getElementById(
            "saveCategoryButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelCategoryEditButton"
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
            "Add New Category";
    }


    if (saveButton) {

        saveButton.textContent =
            "Add Category";
    }


    if (cancelButton) {

        cancelButton.classList.add(
            "hidden"
        );
    }


    clearCategoryValidation();

    updateDescriptionCounter();


    if (clearMessage) {

        clearCategoryMessage();
    }
}


/* =========================================================
   VALIDATION ERROR
   ========================================================= */

function showCategoryFieldError(
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

function clearCategoryValidation() {

    const inputIds =
    [
        "categoryName",
        "categoryDescription"
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
        "categoryNameError",
        "categoryDescriptionError"
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

function showCategoryMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "categoryMessage"
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
                element.textContent === message
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

function clearCategoryMessage() {

    const element =
        document.getElementById(
            "categoryMessage"
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

function showCategoryLoading(
    loading
) {

    const element =
        document.getElementById(
            "categoryLoading"
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
   FORM BUTTON LOADING
   ========================================================= */

function setCategoryFormLoading(
    loading
) {

    const button =
        document.getElementById(
            "saveCategoryButton"
        );


    if (!button) {

        return;
    }


    button.disabled =
        loading;


    if (loading) {

        button.textContent =
            editingCategoryId === null
                ? "Creating..."
                : "Updating...";

    }
    else {

        button.textContent =
            editingCategoryId === null
                ? "Add Category"
                : "Update Category";
    }
}


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeCategoryHtml(
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