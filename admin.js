// ============================================================
// SHREEVA TRENDS - ADMIN PANEL
// ============================================================

const STORAGE_BUCKET = "product-images";

let selectedImageFiles = [];
let existingImages = [];
let editingProductId = null;
let deleteProductId = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");
const loginStatus = document.getElementById("loginStatus");

const logoutBtn = document.getElementById("logoutBtn");

const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const forgotPasswordBox = document.getElementById("forgotPasswordBox");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const resetEmail = document.getElementById("resetEmail");
const resetEmailBtn = document.getElementById("resetEmailBtn");
const resetStatus = document.getElementById("resetStatus");

const adminYear = document.getElementById("adminYear");

const totalProducts = document.getElementById("totalProducts");
const activeProducts = document.getElementById("activeProducts");
const newCollectionCount = document.getElementById("newCollectionCount");
const offerCount = document.getElementById("offerCount");

const newProductBtn = document.getElementById("newProductBtn");
const productFormBox = document.getElementById("productFormBox");
const productFormTitle = document.getElementById("productFormTitle");
const cancelProductBtn = document.getElementById("cancelProductBtn");

const productForm = document.getElementById("productForm");

const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productSizes = document.getElementById("productSizes");
const productPrice = document.getElementById("productPrice");
const productMRP = document.getElementById("productMRP");
const productDescription = document.getElementById("productDescription");
const productImages = document.getElementById("productImages");

const imagePreview = document.getElementById("imagePreview");
const existingImagesBox = document.getElementById("existingImagesBox");
const existingImagesContainer = document.getElementById("existingImages");

const isNewCollection = document.getElementById("isNewCollection");
const isSpecialOffer = document.getElementById("isSpecialOffer");

const offerTextBox = document.getElementById("offerTextBox");
const offerText = document.getElementById("offerText");

const saveProductBtn = document.getElementById("saveProductBtn");
const cancelProductBtnBottom =
    document.getElementById("cancelProductBtnBottom");

const productStatus = document.getElementById("productStatus");
const productsTableBody =
    document.getElementById("productsTableBody");

const feedbackAdminList =
    document.getElementById("feedbackAdminList");

const confirmModal =
    document.getElementById("confirmModal");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");


// ============================================================
// INITIAL SETUP
// ============================================================

if (adminYear) {
    adminYear.textContent = new Date().getFullYear();
}

if (productImages) {
    productImages.addEventListener("change", handleImageSelection);
}

if (isSpecialOffer) {
    isSpecialOffer.addEventListener("change", toggleOfferBox);
}

if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
}

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", function () {

        if (forgotPasswordBox) {
            forgotPasswordBox.style.display =
                forgotPasswordBox.style.display === "none" ||
                forgotPasswordBox.style.display === ""
                    ? "block"
                    : "none";
        }

    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener(
        "submit",
        handleForgotPassword
    );
}

if (newProductBtn) {
    newProductBtn.addEventListener(
        "click",
        openNewProductForm
    );
}

if (cancelProductBtn) {
    cancelProductBtn.addEventListener(
        "click",
        closeProductForm
    );
}

if (cancelProductBtnBottom) {
    cancelProductBtnBottom.addEventListener(
        "click",
        closeProductForm
    );
}

if (productForm) {
    productForm.addEventListener(
        "submit",
        handleProductSubmit
    );
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener(
        "click",
        closeDeleteModal
    );
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener(
        "click",
        confirmDelete
    );
}


// ============================================================
// STATUS MESSAGE
// ============================================================

function showLoginStatus(message, type = "error") {

    if (!loginStatus) return;

    loginStatus.textContent = message;

    loginStatus.className =
        "status-message " + type;

    loginStatus.style.display = "block";
}


function showResetStatus(message, type = "error") {

    if (!resetStatus) return;

    resetStatus.textContent = message;

    resetStatus.className =
        "status-message " + type;

    resetStatus.style.display = "block";
}


function showProductStatus(message, type = "success") {

    if (!productStatus) return;

    productStatus.textContent = message;

    productStatus.className =
        "status-message " + type;

    productStatus.style.display = "block";
}


function clearStatuses() {

    if (loginStatus) {
        loginStatus.style.display = "none";
    }

    if (resetStatus) {
        resetStatus.style.display = "none";
    }

    if (productStatus) {
        productStatus.style.display = "none";
    }
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// PRICE FORMAT
// ============================================================

function formatPrice(value) {

    const number = Number(value || 0);

    return "₹" + number.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}


// ============================================================
// ADMIN CHECK
// ============================================================

async function checkAdmin(user) {

    if (!user) {
        return false;
    }

    const { data, error } = await supabaseClient
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {

        console.error(
            "Admin check error:",
            error
        );

        return false;
    }

    return !!data;
}


// ============================================================
// LOGIN
// ============================================================

async function handleLogin(event) {

    event.preventDefault();

    clearStatuses();

    const email =
        adminEmail.value.trim();

    const password =
        adminPassword.value;

    if (!email || !password) {

        showLoginStatus(
            "Please enter your email and password.",
            "error"
        );

        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {

            console.error(
                "Login error:",
                error
            );

            showLoginStatus(
                error.message ||
                "Login failed. Please check your email and password.",
                "error"
            );

            return;
        }

        const user = data.user;

        const admin = await checkAdmin(user);

        if (!admin) {

            await supabaseClient.auth.signOut();

            showLoginStatus(
                "This account is not authorized as an admin.",
                "error"
            );

            return;
        }

        showDashboard();

    } catch (error) {

        console.error(error);

        showLoginStatus(
            "Something went wrong while logging in.",
            "error"
        );

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
}


// ============================================================
// SHOW DASHBOARD
// ============================================================

async function showDashboard() {

    if (loginSection) {
        loginSection.style.display = "none";
    }

    if (dashboardSection) {
        dashboardSection.style.display = "block";
    }

    await loadDashboardData();
}


// ============================================================
// LOGOUT
// ============================================================

async function handleLogout() {

    await supabaseClient.auth.signOut();

    if (dashboardSection) {
        dashboardSection.style.display = "none";
    }

    if (loginSection) {
        loginSection.style.display = "block";
    }

    if (adminPassword) {
        adminPassword.value = "";
    }

    closeProductForm();
}


// ============================================================
// FORGOT PASSWORD
// ============================================================

async function handleForgotPassword(event) {

    event.preventDefault();

    const email =
        resetEmail.value.trim();

    if (!email) {

        showResetStatus(
            "Please enter your admin email.",
            "error"
        );

        return;
    }

    resetEmailBtn.disabled = true;
    resetEmailBtn.textContent = "Sending...";

    try {

        const resetUrl =
            new URL(
                "reset-password.html",
                window.location.href
            ).href;

        const {
            error
        } = await supabaseClient.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: resetUrl
            }
        );

        if (error) {

            console.error(error);

            showResetStatus(
                error.message ||
                "Unable to send reset email.",
                "error"
            );

            return;
        }

        showResetStatus(
            "Password reset link has been sent to your email.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showResetStatus(
            "Something went wrong. Please try again.",
            "error"
        );

    } finally {

        resetEmailBtn.disabled = false;
        resetEmailBtn.textContent = "Send Reset Link";
    }
}


// ============================================================
// SESSION CHECK
// ============================================================

async function checkExistingSession() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {

            console.error(error);
            return;
        }

        const session = data.session;

        if (!session) {
            return;
        }

        const admin =
            await checkAdmin(session.user);

        if (admin) {

            showDashboard();

        } else {

            await supabaseClient.auth.signOut();
        }

    } catch (error) {

        console.error(
            "Session check error:",
            error
        );
    }
}


// ============================================================
// AUTH STATE CHANGE
// ============================================================

supabaseClient.auth.onAuthStateChange(
    async function (event, session) {

        if (
            event === "SIGNED_IN" &&
            session
        ) {

            const admin =
                await checkAdmin(session.user);

            if (admin) {
                showDashboard();
            }
        }

        if (event === "SIGNED_OUT") {

            if (dashboardSection) {
                dashboardSection.style.display = "none";
            }

            if (loginSection) {
                loginSection.style.display = "block";
            }
        }
    }
);


// ============================================================
// DASHBOARD DATA
// ============================================================

async function loadDashboardData() {

    await Promise.all([
        loadProducts(),
        loadFeedback()
    ]);
}


// ============================================================
// LOAD PRODUCTS
// ============================================================

async function loadProducts() {

    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Products loading error:",
            error
        );

        if (productsTableBody) {

            productsTableBody.innerHTML =
                `<tr>
                    <td colspan="10">
                        Unable to load products.
                    </td>
                </tr>`;
        }

        return;
    }

    const products = data || [];

    updateProductStats(products);

    renderProductsTable(products);
}


// ============================================================
// PRODUCT STATS
// ============================================================

function updateProductStats(products) {

    if (totalProducts) {
        totalProducts.textContent =
            products.length;
    }

    if (activeProducts) {
        activeProducts.textContent =
            products.filter(
                product => product.is_active
            ).length;
    }

    if (newCollectionCount) {
        newCollectionCount.textContent =
            products.filter(
                product => product.is_new_collection
            ).length;
    }

    if (offerCount) {
        offerCount.textContent =
            products.filter(
                product => product.is_special_offer
            ).length;
    }
}


// ============================================================
// RENDER PRODUCT TABLE
// ============================================================

function renderProductsTable(products) {

    if (!productsTableBody) return;

    if (!products.length) {

        productsTableBody.innerHTML =
            `<tr>
                <td colspan="10">
                    No products added yet.
                </td>
            </tr>`;

        return;
    }

    productsTableBody.innerHTML =
        products.map(product => {

            const firstImage =
                Array.isArray(product.images) &&
                product.images.length
                    ? product.images[0]
                    : "";

            const imageHTML = firstImage
                ? `<img
                    src="${escapeHTML(firstImage)}"
                    alt="${escapeHTML(product.name)}"
                    class="table-product-image"
                  >`
                : `<div class="table-product-image">
                    No Image
                  </div>`;

            const badges = [];

            if (product.is_new_collection) {
                badges.push(
                    `<span class="option-badge">
                        New Collection
                    </span>`
                );
            }

            if (product.is_special_offer) {
                badges.push(
                    `<span class="option-badge">
                        Special Offer
                    </span>`
                );
            }

            return `
                <tr>

                    <td>
                        ${imageHTML}
                    </td>

                    <td>
                        <div class="product-table-info">
                            <div class="product-table-name">
                                ${escapeHTML(product.name)}
                            </div>

                            <div class="product-table-category">
                                ${escapeHTML(
                                    product.category || "Uncategorized"
                                )}
                            </div>
                        </div>
                    </td>

                    <td>
                        <div class="table-price">
                            ${formatPrice(product.price)}
                        </div>

                        ${
                            product.mrp
                                ? `<div class="table-mrp">
                                    ${formatPrice(product.mrp)}
                                   </div>`
                                : ""
                        }
                    </td>

                    <td>
                        ${Array.isArray(product.sizes)
                            ? escapeHTML(
                                product.sizes.join(", ")
                              )
                            : ""}
                    </td>

                    <td>
                        <div class="option-badges">
                            ${badges.join("") || "—"}
                        </div>
                    </td>

                    <td>
                        <span class="status-badge ${
                            product.is_active
                                ? "status-active"
                                : "status-inactive"
                        }">
                            ${
                                product.is_active
                                    ? "Active"
                                    : "Inactive"
                            }
                        </span>
                    </td>

                    <td>
                        <div class="table-actions">

                            <button
                                type="button"
                                class="table-action edit-action"
                                onclick="editProduct('${product.id}')"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="table-action toggle-action"
                                onclick="toggleProduct('${product.id}', ${!product.is_active})"
                            >
                                ${
                                    product.is_active
                                        ? "Hide"
                                        : "Show"
                                }
                            </button>

                            <button
                                type="button"
                                class="table-action delete-action"
                                onclick="deleteProduct('${product.id}')"
                            >
                                Delete
                            </button>

                        </div>
                    </td>

                </tr>
            `;

        }).join("");
}


// ============================================================
// NEW PRODUCT
// ============================================================

function openNewProductForm() {

    editingProductId = null;

    existingImages = [];
    selectedImageFiles = [];

    if (productFormTitle) {
        productFormTitle.textContent =
            "Add New Product";
    }

    if (productForm) {
        productForm.reset();
    }

    if (productId) {
        productId.value = "";
    }

    if (existingImagesBox) {
        existingImagesBox.style.display = "none";
    }

    if (existingImagesContainer) {
        existingImagesContainer.innerHTML = "";
    }

    if (imagePreview) {
        imagePreview.innerHTML = "";
    }

    toggleOfferBox();

    if (productFormBox) {
        productFormBox.style.display = "block";
    }

    if (productFormBox) {
        productFormBox.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ============================================================
// CLOSE PRODUCT FORM
// ============================================================

function closeProductForm() {

    editingProductId = null;

    existingImages = [];
    selectedImageFiles = [];

    if (productForm) {
        productForm.reset();
    }

    if (productId) {
        productId.value = "";
    }

    if (imagePreview) {
        imagePreview.innerHTML = "";
    }

    if (existingImagesContainer) {
        existingImagesContainer.innerHTML = "";
    }

    if (existingImagesBox) {
        existingImagesBox.style.display = "none";
    }

    if (productFormBox) {
        productFormBox.style.display = "none";
    }

    toggleOfferBox();
}


// ============================================================
// OFFER BOX
// ============================================================

function toggleOfferBox() {

    if (!offerTextBox || !isSpecialOffer) {
        return;
    }

    offerTextBox.style.display =
        isSpecialOffer.checked
            ? "block"
            : "none";
}


// ============================================================
// IMAGE SELECTION
// ============================================================

function handleImageSelection(event) {

    const files =
        Array.from(event.target.files || []);

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    for (const file of files) {

        if (!allowedTypes.includes(file.type)) {

            alert(
                `${file.name} is not a supported image type. Use JPG, PNG or WebP.`
            );

            continue;
        }

        if (file.size > 10 * 1024 * 1024) {

            alert(
                `${file.name} is larger than 10 MB.`
            );

            continue;
        }

        selectedImageFiles.push(file);
    }

    const totalImages =
        existingImages.length +
        selectedImageFiles.length;

    if (totalImages > 10) {

        selectedImageFiles =
            selectedImageFiles.slice(
                0,
                10 - existingImages.length
            );

        alert(
            "A product can have a maximum of 10 images."
        );
    }

    renderImagePreview();

    // Reset input so the same image can be selected again if needed
    event.target.value = "";
}


// ============================================================
// IMAGE PREVIEW
// ============================================================

function renderImagePreview() {

    if (!imagePreview) return;

    if (!selectedImageFiles.length) {

        imagePreview.innerHTML = "";
        return;
    }

    imagePreview.innerHTML =
        selectedImageFiles.map(
            (file, index) => {

                const url =
                    URL.createObjectURL(file);

                return `
                    <div class="preview-image-wrapper">

                        <img
                            src="${url}"
                            alt="New product image"
                            class="preview-image"
                        >

                        <button
                            type="button"
                            class="remove-preview-image"
                            onclick="removeSelectedImage(${index})"
                        >
                            ×
                        </button>

                    </div>
                `;
            }
        ).join("");
}


// ============================================================
// REMOVE SELECTED NEW IMAGE
// ============================================================

window.removeSelectedImage =
    function(index) {

        selectedImageFiles.splice(
            index,
            1
        );

        renderImagePreview();
    };


// ============================================================
// RENDER EXISTING IMAGES
// ============================================================

function renderExistingImages() {

    if (!existingImagesContainer) {
        return;
    }

    if (!existingImages.length) {

        if (existingImagesBox) {
            existingImagesBox.style.display = "none";
        }

        existingImagesContainer.innerHTML = "";

        return;
    }

    if (existingImagesBox) {
        existingImagesBox.style.display = "block";
    }

    existingImagesContainer.innerHTML =
        existingImages.map(
            (url, index) => {

                return `
                    <div class="existing-image-wrapper">

                        <img
                            src="${escapeHTML(url)}"
                            alt="Existing product image"
                            class="existing-image"
                        >

                        <button
                            type="button"
                            class="remove-existing-image"
                            onclick="removeExistingImage(${index})"
                        >
                            ×
                        </button>

                    </div>
                `;

            }
        ).join("");
}


// ============================================================
// REMOVE EXISTING IMAGE
// ============================================================

window.removeExistingImage =
    function(index) {

        existingImages.splice(
            index,
            1
        );

        renderExistingImages();
    };


// ============================================================
// EDIT PRODUCT
// ============================================================

window.editProduct =
    async function(id) {

        clearStatuses();

        const {
            data: product,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !product) {

            console.error(error);

            alert(
                "Unable to load this product."
            );

            return;
        }

        editingProductId = product.id;

        existingImages =
            Array.isArray(product.images)
                ? [...product.images]
                : [];

        selectedImageFiles = [];

        if (productFormTitle) {
            productFormTitle.textContent =
                "Edit Product";
        }

        if (productId) {
            productId.value = product.id;
        }

        if (productName) {
            productName.value =
                product.name || "";
        }

        if (productCategory) {
            productCategory.value =
                product.category || "";
        }

        if (productSizes) {
            productSizes.value =
                Array.isArray(product.sizes)
                    ? product.sizes.join(", ")
                    : "";
        }

        if (productPrice) {
            productPrice.value =
                product.price ?? "";
        }

        if (productMRP) {
            productMRP.value =
                product.mrp ?? "";
        }

        if (productDescription) {
            productDescription.value =
                product.description || "";
        }

        if (isNewCollection) {
            isNewCollection.checked =
                !!product.is_new_collection;
        }

        if (isSpecialOffer) {
            isSpecialOffer.checked =
                !!product.is_special_offer;
        }

        if (offerText) {
            offerText.value =
                product.offer_text || "";
        }

        if (imagePreview) {
            imagePreview.innerHTML = "";
        }

        renderExistingImages();

        toggleOfferBox();

        if (productFormBox) {

            productFormBox.style.display =
                "block";

            productFormBox.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };


// ============================================================
// UPLOAD IMAGE
// ============================================================

async function uploadProductImage(
    file,
    productIdValue
) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const safeName =
        file.name
            .replace(
                /[^a-zA-Z0-9._-]/g,
                "-"
            );

    const filePath =
        `${productIdValue}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}-${safeName}`;

    const {
        error
    } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .upload(
            filePath,
            file,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type ||
                    `image/${extension}`
            }
        );

    if (error) {
        throw error;
    }

    const {
        data
    } = supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    return {
        url: data.publicUrl,
        path: filePath
    };
}


// ============================================================
// GET STORAGE PATH FROM PUBLIC URL
// ============================================================

function getStoragePathFromUrl(url) {

    if (!url) return null;

    const marker =
        `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    const index =
        url.indexOf(marker);

    if (index === -1) {
        return null;
    }

    return decodeURIComponent(
        url.substring(
            index + marker.length
        )
    );
}


// ============================================================
// DELETE STORAGE FILES
// ============================================================

async function deleteStorageFiles(urls) {

    const paths =
        urls
            .map(getStoragePathFromUrl)
            .filter(Boolean);

    if (!paths.length) {
        return;
    }

    const {
        error
    } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .remove(paths);

    if (error) {

        console.error(
            "Storage delete error:",
            error
        );
    }
}


// ============================================================
// PRODUCT SUBMIT
// ============================================================

async function handleProductSubmit(event) {

    event.preventDefault();

    clearStatuses();

    const name =
        productName.value.trim();

    const category =
        productCategory.value.trim();

    const price =
        Number(productPrice.value);

    const mrp =
        productMRP.value
            ? Number(productMRP.value)
            : null;

    const description =
        productDescription.value.trim();

    const sizes =
        productSizes.value
            .split(",")
            .map(size => size.trim())
            .filter(Boolean);

    const newCollection =
        !!isNewCollection.checked;

    const specialOffer =
        !!isSpecialOffer.checked;

    const offer =
        specialOffer
            ? offerText.value.trim()
            : null;

    if (!name) {

        showProductStatus(
            "Please enter a product name.",
            "error"
        );

        return;
    }

    if (!Number.isFinite(price) || price < 0) {

        showProductStatus(
            "Please enter a valid price.",
            "error"
        );

        return;
    }

    if (
        mrp !== null &&
        (!Number.isFinite(mrp) || mrp < 0)
    ) {

        showProductStatus(
            "Please enter a valid MRP.",
            "error"
        );

        return;
    }

    if (
        existingImages.length +
        selectedImageFiles.length > 10
    ) {

        showProductStatus(
            "A product can have a maximum of 10 images.",
            "error"
        );

        return;
    }

    saveProductBtn.disabled = true;
    saveProductBtn.textContent = "Saving...";

    let newlyUploadedUrls = [];

    try {

        // ====================================================
        // NEW PRODUCT
        // ====================================================

        if (!editingProductId) {

            const {
                data: insertedProduct,
                error: insertError
            } = await supabaseClient
                .from("products")
                .insert({
                    name: name,
                    category: category || null,
                    price: price,
                    mrp: mrp,
                    description: description || null,
                    sizes: sizes,
                    images: [],
                    is_new_collection: newCollection,
                    is_special_offer: specialOffer,
                    offer_text: offer,
                    is_active: true
                })
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            const newId =
                insertedProduct.id;

            try {

                for (
                    const file
                    of selectedImageFiles
                ) {

                    const uploaded =
                        await uploadProductImage(
                            file,
                            newId
                        );

                    newlyUploadedUrls.push(
                        uploaded.url
                    );
                }

            } catch (uploadError) {

                await supabaseClient
                    .from("products")
                    .delete()
                    .eq("id", newId);

                await deleteStorageFiles(
                    newlyUploadedUrls
                );

                throw uploadError;
            }

            const {
                error: updateError
            } = await supabaseClient
                .from("products")
                .update({
                    images: newlyUploadedUrls
                })
                .eq("id", newId);

            if (updateError) {

                await deleteStorageFiles(
                    newlyUploadedUrls
                );

                await supabaseClient
                    .from("products")
                    .delete()
                    .eq("id", newId);

                throw updateError;
            }

            showProductStatus(
                "Product added successfully.",
                "success"
            );
        }

        // ====================================================
        // EDIT EXISTING PRODUCT
        // ====================================================

        else {

            const {
                data: oldProduct,
                error: oldProductError
            } = await supabaseClient
                .from("products")
                .select("images")
                .eq("id", editingProductId)
                .single();

            if (oldProductError) {
                throw oldProductError;
            }

            const oldImages =
                Array.isArray(oldProduct.images)
                    ? oldProduct.images
                    : [];

            const oldImageSet =
                new Set(oldImages);

            const keptImageSet =
                new Set(existingImages);

            const removedImages =
                oldImages.filter(
                    image => !keptImageSet.has(image)
                );

            for (
                const file
                of selectedImageFiles
            ) {

                const uploaded =
                    await uploadProductImage(
                        file,
                        editingProductId
                    );

                newlyUploadedUrls.push(
                    uploaded.url
                );
            }

            const finalImages = [
                ...existingImages,
                ...newlyUploadedUrls
            ];

            if (finalImages.length > 10) {

                await deleteStorageFiles(
                    newlyUploadedUrls
                );

                throw new Error(
                    "A product can have a maximum of 10 images."
                );
            }

            const {
                error: updateError
            } = await supabaseClient
                .from("products")
                .update({

                    name: name,

                    category:
                        category || null,

                    price: price,

                    mrp: mrp,

                    description:
                        description || null,

                    sizes: sizes,

                    images:
                        finalImages,

                    is_new_collection:
                        newCollection,

                    is_special_offer:
                        specialOffer,

                    offer_text:
                        offer,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    editingProductId
                );

            if (updateError) {

                await deleteStorageFiles(
                    newlyUploadedUrls
                );

                throw updateError;
            }

            await deleteStorageFiles(
                removedImages
            );

            showProductStatus(
                "Product updated successfully.",
                "success"
            );
        }

        closeProductForm();

        await loadProducts();

    } catch (error) {

        console.error(
            "Product save error:",
            error
        );

        showProductStatus(
            error.message ||
            "Unable to save product.",
            "error"
        );

    } finally {

        saveProductBtn.disabled = false;
        saveProductBtn.textContent = "Save Product";
    }
}


// ============================================================
// TOGGLE PRODUCT ACTIVE/INACTIVE
// ============================================================

window.toggleProduct =
    async function(id, active) {

        const {
            error
        } = await supabaseClient
            .from("products")
            .update({
                is_active: active
            })
            .eq("id", id);

        if (error) {

            console.error(error);

            alert(
                "Unable to change product status."
            );

            return;
        }

        await loadProducts();
    };


// ============================================================
// DELETE PRODUCT
// ============================================================

window.deleteProduct =
    function(id) {

        deleteProductId = id;

        if (confirmModal) {
            confirmModal.style.display = "flex";
        }
    };


// ============================================================
// CLOSE DELETE MODAL
// ============================================================

function closeDeleteModal() {

    deleteProductId = null;

    if (confirmModal) {
        confirmModal.style.display = "none";
    }
}


// ============================================================
// CONFIRM DELETE
// ============================================================

async function confirmDelete() {

    if (!deleteProductId) {
        return;
    }

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent =
        "Deleting...";

    try {

        const id =
            deleteProductId;

        const {
            data: product,
            error: fetchError
        } = await supabaseClient
            .from("products")
            .select("images")
            .eq("id", id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        const images =
            Array.isArray(product.images)
                ? product.images
                : [];

        const {
            error: deleteError
        } = await supabaseClient
            .from("products")
            .delete()
            .eq("id", id);

        if (deleteError) {
            throw deleteError;
        }

        await deleteStorageFiles(images);

        closeDeleteModal();

        await loadProducts();

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete product."
        );

    } finally {

        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent =
            "Delete";
    }
}


// ============================================================
// LOAD FEEDBACK
// ============================================================

async function loadFeedback() {

    if (!feedbackAdminList) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("feedback")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Feedback loading error:",
            error
        );

        feedbackAdminList.innerHTML =
            `<p>Unable to load feedback.</p>`;

        return;
    }

    renderFeedback(data || []);
}


// ============================================================
// RENDER FEEDBACK
// ============================================================

function renderFeedback(feedback) {

    if (!feedbackAdminList) {
        return;
    }

    if (!feedback.length) {

        feedbackAdminList.innerHTML =
            `<p>No customer feedback yet.</p>`;

        return;
    }

    feedbackAdminList.innerHTML =
        feedback.map(item => {

            const stars =
                "★".repeat(item.rating) +
                "☆".repeat(5 - item.rating);

            return `
                <div class="feedback-admin-card">

                    <div class="feedback-admin-top">

                        <div>
                            <div class="feedback-admin-name">
                                ${escapeHTML(item.name)}
                            </div>

                            <div class="feedback-admin-stars">
                                ${stars}
                            </div>
                        </div>

                        <div>
                            ${
                                item.is_approved
                                    ? `<span class="status-badge status-active">
                                        Approved
                                       </span>`
                                    : `<span class="status-badge status-inactive">
                                        Pending
                                       </span>`
                            }
                        </div>

                    </div>

                    <div class="feedback-admin-message">
                        ${escapeHTML(item.message)}
                    </div>

                    <div class="feedback-admin-actions">

                        <button
                            type="button"
                            class="table-action toggle-action"
                            onclick="toggleFeedback('${item.id}', ${!item.is_approved})"
                        >
                            ${
                                item.is_approved
                                    ? "Hide"
                                    : "Approve"
                            }
                        </button>

                        <button
                            type="button"
                            class="table-action delete-action"
                            onclick="deleteFeedback('${item.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// APPROVE / HIDE FEEDBACK
// ============================================================

window.toggleFeedback =
    async function(id, approved) {

        const {
            error
        } = await supabaseClient
            .from("feedback")
            .update({
                is_approved: approved
            })
            .eq("id", id);

        if (error) {

            console.error(error);

            alert(
                "Unable to update feedback."
            );

            return;
        }

        await loadFeedback();
    };


// ============================================================
// DELETE FEEDBACK
// ============================================================

window.deleteFeedback =
    async function(id) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this feedback?"
            );

        if (!confirmed) {
            return;
        }

        const {
            error
        } = await supabaseClient
            .from("feedback")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(error);

            alert(
                "Unable to delete feedback."
            );

            return;
        }

        await loadFeedback();
    };


// ============================================================
// START ADMIN PANEL
// ============================================================

checkExistingSession();
