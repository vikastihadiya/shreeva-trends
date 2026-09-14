/* =========================================================
   SHREEVA TRENDS
   Public Website JavaScript
   ========================================================= */

let products = [];
let cart = JSON.parse(localStorage.getItem("shreeva_cart")) || [];

let selectedProduct = null;
let selectedSize = null;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const newProductsContainer = document.getElementById("newProducts");
const allProductsContainer = document.getElementById("allProducts");
const offerProductsContainer = document.getElementById("offerProducts");

const productsEmpty = document.getElementById("productsEmpty");
const offersEmpty = document.getElementById("offersEmpty");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const cartCount = document.getElementById("cart-count");
const openCartBtn = document.getElementById("openCartBtn");

const cartOverlay = document.getElementById("cartOverlay");
const cartItemsContainer = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");

const clearCartBtn = document.getElementById("clearCartBtn");
const whatsappCheckoutBtn = document.getElementById("whatsappCheckoutBtn");

const productModal = document.getElementById("productModal");
const productModalBody = document.getElementById("productModalBody");

const feedbackForm = document.getElementById("feedbackForm");
const feedbackStatus = document.getElementById("feedbackStatus");
const reviewsGrid = document.getElementById("reviewsGrid");


/* =========================================================
   INITIALIZE WEBSITE
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    updateCartCount();
    renderCart();

    setupEventListeners();

    await loadProducts();
    await loadFeedback();

});


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

    /* Cart button */
    if (openCartBtn) {
        openCartBtn.addEventListener("click", openCart);
    }


    /* Clear cart */
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", clearCart);
    }


    /* WhatsApp checkout */
    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener(
            "click",
            checkoutWhatsApp
        );
    }


    /* Search */
    if (searchInput) {
        searchInput.addEventListener("input", filterProducts);
    }


    /* Category */
    if (categoryFilter) {
        categoryFilter.addEventListener(
            "change",
            filterProducts
        );
    }


    /* Feedback */
    if (feedbackForm) {
        feedbackForm.addEventListener(
            "submit",
            submitFeedback
        );
    }


    /* Close modals */
    document.addEventListener("click", (event) => {

        const closeButton =
            event.target.closest("[data-close]");

        if (!closeButton) return;

        const target =
            closeButton.getAttribute("data-close");

        if (target === "productModal") {
            closeProductModal();
        }

        if (target === "cartOverlay") {
            closeCart();
        }

    });


    /* Escape key */
    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") return;

        closeProductModal();
        closeCart();

    });

}


/* =========================================================
   LOAD PRODUCTS FROM SUPABASE
   ========================================================= */

async function loadProducts() {

    showLoadingMessages();

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        products = data || [];


        createCategoryFilter();

        renderAllProductSections();


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

        showProductError();

    }

}


/* =========================================================
   LOADING MESSAGE
   ========================================================= */

function showLoadingMessages() {

    const loadingHTML = `
        <div class="loading-message">
            Loading collection...
        </div>
    `;

    if (newProductsContainer) {
        newProductsContainer.innerHTML = loadingHTML;
    }

    if (allProductsContainer) {
        allProductsContainer.innerHTML = loadingHTML;
    }

    if (offerProductsContainer) {
        offerProductsContainer.innerHTML = loadingHTML;
    }

}


/* =========================================================
   PRODUCT ERROR
   ========================================================= */

function showProductError() {

    const errorHTML = `
        <div class="loading-message">
            <h3>Unable to load collection</h3>
            <p>Please refresh the page and try again.</p>
        </div>
    `;

    if (allProductsContainer) {
        allProductsContainer.innerHTML = errorHTML;
    }

    if (newProductsContainer) {
        newProductsContainer.innerHTML = "";
    }

    if (offerProductsContainer) {
        offerProductsContainer.innerHTML = "";
    }

}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function createCategoryFilter() {

    if (!categoryFilter) return;


    const categories = [
        ...new Set(
            products
                .map(product => product.category)
                .filter(Boolean)
        )
    ];


    categories.sort();


    categoryFilter.innerHTML = `
        <option value="all">
            All categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);

    });

}


/* =========================================================
   RENDER ALL PRODUCT SECTIONS
   ========================================================= */

function renderAllProductSections() {

    renderProducts(
        products,
        allProductsContainer
    );


    const newCollection =
        products.filter(
            product =>
                product.is_new_collection === true
        );


    renderProducts(
        newCollection,
        newProductsContainer
    );


    if (newProductsContainer) {

        newProductsContainer.parentElement
            .style.display =
            newCollection.length
                ? ""
                : "none";

    }


    const offers =
        products.filter(
            product =>
                product.is_special_offer === true
        );


    renderProducts(
        offers,
        offerProductsContainer
    );


    if (offersEmpty) {

        offersEmpty.hidden =
            offers.length !== 0;

    }


    if (productsEmpty) {

        productsEmpty.hidden =
            products.length !== 0;

    }

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(productList, container) {

    if (!container) return;


    if (!productList || productList.length === 0) {

        container.innerHTML = "";

        return;

    }


    container.innerHTML =
        productList
            .map(product => createProductCard(product))
            .join("");

}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

    const image =
        getFirstImage(product);


    const price =
        Number(product.price || 0);


    const mrp =
        Number(product.mrp || 0);


    let badge = "";


    if (product.is_new_collection) {

        badge = "New";

    } else if (product.is_special_offer) {

        badge =
            product.offer_text ||
            "Special Offer";

    }


    return `
        <article class="product-card">

            <div
                class="product-image-wrap"
                onclick="openProductModal('${escapeAttribute(product.id)}')"
            >

                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(product.name)}"
                    loading="lazy"
                >

                ${
                    badge
                        ? `
                            <span class="product-badge">
                                ${escapeHTML(badge)}
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="product-info">

                ${
                    product.category
                        ? `
                            <div class="product-category">
                                ${escapeHTML(product.category)}
                            </div>
                        `
                        : ""
                }


                <h3>
                    ${escapeHTML(product.name)}
                </h3>


                <div class="product-price">

                    <span class="current-price">
                        ${formatPrice(price)}
                    </span>

                    ${
                        mrp > price
                            ? `
                                <span class="mrp">
                                    ${formatPrice(mrp)}
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="product-card-actions">

                    <button
                        type="button"
                        class="view-product-btn"
                        onclick="openProductModal('${escapeAttribute(product.id)}')"
                    >
                        View
                    </button>


                    <button
                        type="button"
                        class="add-cart-btn"
                        onclick="quickAddProduct('${escapeAttribute(product.id)}')"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>

        </article>
    `;

}


/* =========================================================
   GET FIRST PRODUCT IMAGE
   ========================================================= */

function getFirstImage(product) {

    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {

        return product.images[0];

    }


    if (
        typeof product.images === "string" &&
        product.images.trim()
    ) {

        try {

            const parsed =
                JSON.parse(product.images);

            if (
                Array.isArray(parsed) &&
                parsed.length
            ) {

                return parsed[0];

            }

        } catch (error) {

            return product.images;

        }

    }


    return "https://placehold.co/600x750/f8dce8/8f2451?text=Shreeva+Trends";

}


/* =========================================================
   OPEN PRODUCT MODAL
   ========================================================= */

function openProductModal(productId) {

    const product =
        products.find(
            item => String(item.id) === String(productId)
        );


    if (!product) return;


    selectedProduct = product;


    const images =
        getProductImages(product);


    selectedSize =
        getFirstAvailableSize(product);


    const price =
        Number(product.price || 0);


    const mrp =
        Number(product.mrp || 0);


    productModalBody.innerHTML = `

        <div class="product-modal-content">

            <div class="product-gallery">

                <img
                    id="mainProductImage"
                    class="product-main-image"
                    src="${escapeAttribute(images[0])}"
                    alt="${escapeAttribute(product.name)}"
                >


                <div class="product-thumbnails">

                    ${

                        images
                            .map(
                                (image, index) => `

                                <button
                                    type="button"
                                    class="product-thumbnail ${
                                        index === 0
                                            ? "active"
                                            : ""
                                    }"
                                    onclick="changeMainProductImage(
                                        '${escapeAttribute(image)}',
                                        this
                                    )"
                                >

                                    <img
                                        src="${escapeAttribute(image)}"
                                        alt="Product image ${index + 1}"
                                    >

                                </button>

                            `
                            )
                            .join("")

                    }

                </div>

            </div>


            <div class="product-modal-info">

                ${
                    product.category
                        ? `
                            <div class="product-category">
                                ${escapeHTML(product.category)}
                            </div>
                        `
                        : ""
                }


                <h2>
                    ${escapeHTML(product.name)}
                </h2>


                <div class="product-price">

                    <span class="current-price">
                        ${formatPrice(price)}
                    </span>

                    ${
                        mrp > price
                            ? `
                                <span class="mrp">
                                    ${formatPrice(mrp)}
                                </span>
                            `
                            : ""
                    }

                </div>


                ${
                    product.description
                        ? `
                            <p class="product-modal-description">
                                ${escapeHTML(product.description)}
                            </p>
                        `
                        : ""
                }


                ${
                    getProductSizes(product).length > 0
                        ? `

                            <div class="size-title">
                                Select Size
                            </div>

                            <div
                                class="size-options"
                                id="modalSizeOptions"
                            >

                                ${

                                    getProductSizes(product)
                                        .map(
                                            size => `

                                                <button
                                                    type="button"
                                                    class="size-option ${
                                                        String(selectedSize) ===
                                                        String(size)
                                                            ? "selected"
                                                            : ""
                                                    }"
                                                    onclick="selectProductSize(
                                                        '${escapeAttribute(size)}'
                                                    )"
                                                >
                                                    ${escapeHTML(size)}
                                                </button>

                                            `
                                        )
                                        .join("")

                                }

                            </div>

                        `
                        : ""
                }


                <button
                    type="button"
                    class="btn primary"
                    style="width:100%;"
                    onclick="addSelectedProductToCart()"
                >
                    Add to Cart
                </button>

            </div>

        </div>

    `;


    productModal.classList.add("open");

    productModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add("no-scroll");

}


/* =========================================================
   CLOSE PRODUCT MODAL
   ========================================================= */

function closeProductModal() {

    if (!productModal) return;

    productModal.classList.remove("open");

    productModal.setAttribute(
        "aria-hidden",
        "true"
    );

    selectedProduct = null;
    selectedSize = null;

    if (!cartOverlay.classList.contains("open")) {
        document.body.classList.remove("no-scroll");
    }

}


/* =========================================================
   PRODUCT IMAGES
   ========================================================= */

function getProductImages(product) {

    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {

        return product.images.slice(0, 10);

    }


    if (
        typeof product.images === "string" &&
        product.images.trim()
    ) {

        try {

            const parsed =
                JSON.parse(product.images);

            if (
                Array.isArray(parsed) &&
                parsed.length
            ) {

                return parsed.slice(0, 10);

            }

        } catch (error) {

            return [product.images];

        }

    }


    return [
        "https://placehold.co/600x750/f8dce8/8f2451?text=Shreeva+Trends"
    ];

}


/* =========================================================
   CHANGE MAIN PRODUCT IMAGE
   ========================================================= */

function changeMainProductImage(image, button) {

    const mainImage =
        document.getElementById("mainProductImage");


    if (!mainImage) return;


    mainImage.src = image;


    document
        .querySelectorAll(".product-thumbnail")
        .forEach(item => {
            item.classList.remove("active");
        });


    button.classList.add("active");

}


/* =========================================================
   PRODUCT SIZES
   ========================================================= */

function getProductSizes(product) {

    if (!product.sizes) return [];


    if (Array.isArray(product.sizes)) {

        return product.sizes.filter(Boolean);

    }


    if (typeof product.sizes === "string") {

        try {

            const parsed =
                JSON.parse(product.sizes);

            if (Array.isArray(parsed)) {
                return parsed.filter(Boolean);
            }

        } catch (error) {

            return product.sizes
                .split(",")
                .map(size => size.trim())
                .filter(Boolean);

        }

    }


    return [];

}


/* =========================================================
   FIRST AVAILABLE SIZE
   ========================================================= */

function getFirstAvailableSize(product) {

    const sizes =
        getProductSizes(product);

    return sizes.length
        ? sizes[0]
        : null;

}


/* =========================================================
   SELECT SIZE
   ========================================================= */

function selectProductSize(size) {

    selectedSize = size;


    document
        .querySelectorAll("#modalSizeOptions .size-option")
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.textContent.trim() === String(size)
            );

        });

}


/* =========================================================
   QUICK ADD PRODUCT
   ========================================================= */

function quickAddProduct(productId) {

    const product =
        products.find(
            item => String(item.id) === String(productId)
        );


    if (!product) return;


    const sizes =
        getProductSizes(product);


    if (sizes.length > 0) {

        openProductModal(productId);

        return;

    }


    addToCart(product, null);

}


/* =========================================================
   ADD SELECTED PRODUCT
   ========================================================= */

function addSelectedProductToCart() {

    if (!selectedProduct) return;


    const sizes =
        getProductSizes(selectedProduct);


    if (
        sizes.length > 0 &&
        !selectedSize
    ) {

        alert("Please select a size.");

        return;

    }


    addToCart(
        selectedProduct,
        selectedSize
    );


    closeProductModal();

    openCart();

}


/* =========================================================
   ADD TO CART
   ========================================================= */

function addToCart(product, size) {

    const productId =
        String(product.id);


    const existingItem =
        cart.find(
            item =>
                String(item.productId) === productId &&
                String(item.size || "") ===
                    String(size || "")
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            productId: productId,

            name: product.name,

            price: Number(product.price || 0),

            image: getFirstImage(product),

            size: size || "",

            quantity: 1

        });

    }


    saveCart();

    updateCartCount();

    renderCart();

}


/* =========================================================
   SAVE CART
   ========================================================= */

function saveCart() {

    localStorage.setItem(
        "shreeva_cart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   UPDATE CART COUNT
   ========================================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );


    if (cartCount) {
        cartCount.textContent = count;
    }

}


/* =========================================================
   OPEN CART
   ========================================================= */

function openCart() {

    if (!cartOverlay) return;


    cartOverlay.classList.add("open");

    cartOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add("no-scroll");

    renderCart();

}


/* =========================================================
   CLOSE CART
   ========================================================= */

function closeCart() {

    if (!cartOverlay) return;


    cartOverlay.classList.remove("open");

    cartOverlay.setAttribute(
        "aria-hidden",
        "true"
    );


    if (!productModal.classList.contains("open")) {
        document.body.classList.remove("no-scroll");
    }

}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

    if (!cartItemsContainer) return;


    if (cart.length === 0) {

        cartItemsContainer.innerHTML = "";

        cartEmpty.hidden = false;

        clearCartBtn.style.display = "none";

        whatsappCheckoutBtn.style.display = "none";

        cartTotal.textContent = "₹0";

        return;

    }


    cartEmpty.hidden = true;

    clearCartBtn.style.display = "";

    whatsappCheckoutBtn.style.display = "";


    cartItemsContainer.innerHTML =
        cart
            .map(
                (item, index) =>
                    createCartItem(item, index)
            )
            .join("");


    const total =
        calculateCartTotal();


    cartTotal.textContent =
        formatPrice(total);

}


/* =========================================================
   CART ITEM
   ========================================================= */

function createCartItem(item, index) {

    const subtotal =
        Number(item.price || 0) *
        Number(item.quantity || 0);


    return `

        <div class="cart-item">

            <img
                class="cart-item-image"
                src="${escapeAttribute(item.image)}"
                alt="${escapeAttribute(item.name)}"
            >


            <div>

                <div class="cart-item-name">
                    ${escapeHTML(item.name)}
                </div>


                ${
                    item.size
                        ? `
                            <div class="cart-item-size">
                                Size: ${escapeHTML(item.size)}
                            </div>
                        `
                        : ""
                }


                <div class="cart-item-price">
                    ${formatPrice(item.price)}
                </div>


                <div class="cart-item-bottom">

                    <div class="quantity-controls">

                        <button
                            type="button"
                            onclick="changeCartQuantity(
                                ${index},
                                -1
                            )"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            onclick="changeCartQuantity(
                                ${index},
                                1
                            )"
                        >
                            +
                        </button>

                    </div>


                    <strong>
                        ${formatPrice(subtotal)}
                    </strong>


                    <button
                        type="button"
                        class="remove-cart-item"
                        onclick="removeCartItem(${index})"
                    >
                        Remove
                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   CHANGE CART QUANTITY
   ========================================================= */

function changeCartQuantity(index, change) {

    if (!cart[index]) return;


    cart[index].quantity += change;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    saveCart();

    updateCartCount();

    renderCart();

}


/* =========================================================
   REMOVE CART ITEM
   ========================================================= */

function removeCartItem(index) {

    if (!cart[index]) return;


    cart.splice(index, 1);


    saveCart();

    updateCartCount();

    renderCart();

}


/* =========================================================
   CLEAR CART
   ========================================================= */

function clearCart() {

    if (cart.length === 0) return;


    const confirmed =
        confirm(
            "Are you sure you want to clear your cart?"
        );


    if (!confirmed) return;


    cart = [];


    saveCart();

    updateCartCount();

    renderCart();

}


/* =========================================================
   CART TOTAL
   ========================================================= */

function calculateCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

}


/* =========================================================
   WHATSAPP CHECKOUT
   ========================================================= */

function checkoutWhatsApp() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }


    let message =
        "Hello Shreeva Trends!%0A%0A";

    message +=
        "*I want to place an order:*%0A%0A";


    cart.forEach((item, index) => {

        const subtotal =
            Number(item.price || 0) *
            Number(item.quantity || 0);


        message +=
            `${index + 1}. ${item.name}%0A`;

        if (item.size) {

            message +=
                `Size: ${item.size}%0A`;

        }

        message +=
            `Quantity: ${item.quantity}%0A`;

        message +=
            `Price: ${formatPricePlain(item.price)}%0A`;

        message +=
            `Subtotal: ${formatPricePlain(subtotal)}%0A%0A`;

    });


    message +=
        `*Total: ${formatPricePlain(
            calculateCartTotal()
        )}*%0A%0A`;

    message +=
        "Please confirm availability and delivery details.";


    const whatsappURL =
        "https://wa.me/9198978005050?text=" +
        message;


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* =========================================================
   SEARCH + FILTER
   ========================================================= */

function filterProducts() {

    const searchTerm =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();


    const selectedCategory =
        categoryFilter?.value || "all";


    const filtered =
        products.filter(product => {

            const matchesSearch =
                !searchTerm ||
                String(product.name || "")
                    .toLowerCase()
                    .includes(searchTerm) ||
                String(product.description || "")
                    .toLowerCase()
                    .includes(searchTerm) ||
                String(product.category || "")
                    .toLowerCase()
                    .includes(searchTerm);


            const matchesCategory =
                selectedCategory === "all" ||
                String(product.category || "") ===
                    selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    renderProducts(
        filtered,
        allProductsContainer
    );


    if (productsEmpty) {

        productsEmpty.hidden =
            filtered.length !== 0;

    }

}


/* =========================================================
   CUSTOMER FEEDBACK
   ========================================================= */

async function loadFeedback() {

    if (!reviewsGrid) return;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("feedback")
            .select("*")
            .eq("is_approved", true)
            .order("created_at", {
                ascending: false
            })
            .limit(6);


        if (error) {
            throw error;
        }


        renderFeedback(data || []);


    } catch (error) {

        console.error(
            "Feedback loading error:",
            error
        );

    }

}


/* =========================================================
   RENDER FEEDBACK
   ========================================================= */

function renderFeedback(feedbackList) {

    if (!reviewsGrid) return;


    if (!feedbackList.length) {

        reviewsGrid.innerHTML = `
            <div class="loading-message">
                Be the first customer to share your experience.
            </div>
        `;

        return;

    }


    reviewsGrid.innerHTML =
        feedbackList
            .map(feedback => {

                const rating =
                    Number(feedback.rating || 0);


                return `

                    <article class="review-card">

                        <h3>
                            ${escapeHTML(
                                feedback.name ||
                                "Customer"
                            )}
                        </h3>


                        <div class="review-stars">
                            ${"★".repeat(rating)}
                            ${"☆".repeat(5 - rating)}
                        </div>


                        <p>
                            ${escapeHTML(
                                feedback.message || ""
                            )}
                        </p>

                    </article>

                `;

            })
            .join("");

}


/* =========================================================
   SUBMIT FEEDBACK
   ========================================================= */

async function submitFeedback(event) {

    event.preventDefault();


    if (!feedbackStatus) return;


    const name =
        document
            .getElementById("feedbackName")
            .value
            .trim();


    const rating =
        Number(
            document
                .getElementById("feedbackRating")
                .value
        );


    const message =
        document
            .getElementById("feedbackMessage")
            .value
            .trim();


    feedbackStatus.textContent =
        "Submitting...";


    feedbackStatus.className =
        "form-status";


    try {

        const {
            error
        } = await supabaseClient
            .from("feedback")
            .insert({

                name: name,

                rating: rating,

                message: message,

                is_approved: false

            });


        if (error) {
            throw error;
        }


        feedbackStatus.textContent =
            "Thank you! Your feedback has been submitted for review.";


        feedbackStatus.className =
            "form-status success";


        feedbackForm.reset();


    } catch (error) {

        console.error(
            "Feedback submission error:",
            error
        );


        feedbackStatus.textContent =
            "Unable to submit feedback. Please try again.";


        feedbackStatus.className =
            "form-status error";

    }

}


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(Number(value || 0));

}


function formatPricePlain(value) {

    return "₹" +
        Number(value || 0)
            .toLocaleString("en-IN");

}


/* =========================================================
   SECURITY / HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
