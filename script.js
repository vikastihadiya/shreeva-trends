/* =========================================================
   SHREEVA TRENDS
   Main JavaScript File
   ========================================================= */


/* =========================================================
   1. SHOPPING CART
========================================================= */

let cart = [];


/* =========================================================
   2. ADD PRODUCT TO CART
========================================================= */

function addToCart(productName, price) {

    const product = {
        name: productName,
        price: Number(price)
    };

    cart.push(product);

    updateCartCount();

    showMessage(productName + " added to your cart!");

    console.log("Cart:", cart);
}


/* =========================================================
   3. UPDATE CART NUMBER
========================================================= */

function updateCartCount() {

    const cartCount =
        document.getElementById("cart-count");

    if (cartCount) {

        cartCount.textContent = cart.length;

    }
}


/* =========================================================
   4. SHOW CART
========================================================= */

function showCart() {

    if (cart.length === 0) {

        alert(
            "Your Shreeva Trends cart is empty."
        );

        return;
    }


    let cartText =
        "🛍️ Your Shreeva Trends Cart\n\n";

    let total = 0;


    cart.forEach(function (product, index) {

        cartText +=
            (index + 1) +
            ". " +
            product.name +
            " - ₹" +
            product.price +
            "\n";

        total += Number(product.price);

    });


    cartText +=
        "\n----------------------\n";

    cartText +=
        "Total: ₹" +
        total;


    alert(cartText);
}


/* =========================================================
   5. SHOW MESSAGE
========================================================= */

function showMessage(message) {

    const messageBox =
        document.getElementById("cart-message");


    if (!messageBox) {

        alert(message);

        return;
    }


    messageBox.textContent = message;

    messageBox.style.display = "block";


    setTimeout(function () {

        messageBox.style.display = "none";

    }, 2500);
}


/* =========================================================
   6. ADD NEW PRODUCT
========================================================= */

function addNewProduct() {

    const imageInput =
        document.getElementById("product-image");

    const nameInput =
        document.getElementById("product-name");

    const priceInput =
        document.getElementById("product-price");

    const mrpInput =
        document.getElementById("product-mrp");

    const categoryInput =
        document.getElementById("product-category");


    /* CHECK PHOTO */

    if (!imageInput.files[0]) {

        alert("Please select a product photo.");

        return;
    }


    /* CHECK PRODUCT NAME */

    if (!nameInput.value.trim()) {

        alert("Please enter the product name.");

        return;
    }


    /* CHECK PRICE */

    if (!priceInput.value) {

        alert("Please enter the selling price.");

        return;
    }


    /* CHECK MRP */

    if (!mrpInput.value) {

        alert("Please enter the MRP.");

        return;
    }


    /* CHECK CATEGORY */

    if (!categoryInput.value.trim()) {

        alert("Please enter the category.");

        return;
    }


    const file =
        imageInput.files[0];


    /* READ IMAGE */

    const reader =
        new FileReader();


    reader.onload = function (event) {

        const product = {

            id: Date.now(),

            image: event.target.result,

            name: nameInput.value.trim(),

            price: Number(priceInput.value),

            mrp: Number(mrpInput.value),

            category: categoryInput.value.trim()

        };


        /* GET OLD PRODUCTS */

        let products =
            JSON.parse(
                localStorage.getItem("shreevaProducts")
            ) || [];


        /* ADD NEW PRODUCT */

        products.push(product);


        /* SAVE PRODUCTS */

        localStorage.setItem(
            "shreevaProducts",
            JSON.stringify(products)
        );


        /* SHOW PRODUCTS */

        displayUploadedProducts();


        /* CLEAR FORM */

        imageInput.value = "";

        nameInput.value = "";

        priceInput.value = "";

        mrpInput.value = "";

        categoryInput.value = "";


        alert(
            "✅ Product added successfully!"
        );

    };


    reader.readAsDataURL(file);
}


/* =========================================================
   7. DISPLAY UPLOADED PRODUCTS
========================================================= */

function displayUploadedProducts() {

    const productGrid =
        document.querySelector(".product-grid");


    if (!productGrid) {
        return;
    }


    let products =
        JSON.parse(
            localStorage.getItem("shreevaProducts")
        ) || [];


    products.forEach(function (product) {

        /* Avoid displaying duplicate products */

        if (
            document.querySelector(
                '[data-product-id="' +
                product.id +
                '"]'
            )
        ) {

            return;

        }


        const article =
            document.createElement("article");


        article.className =
            "product-card";


        article.setAttribute(
            "data-product-id",
            product.id
        );


        article.innerHTML = `

            <div class="product-image">

                <span class="sale-tag">
                    NEW
                </span>

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

            </div>


            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ${product.category}
                </p>

                <strong>
                    ₹${product.price}
                </strong>

                <del>
                    ₹${product.mrp}
                </del>

                <button
                    class="add-cart"
                    onclick="addToCart(
                        '${product.name.replace(/'/g, "\\'")}',
                        ${product.price}
                    )"
                >
                    Add to Cart
                </button>

            </div>

        `;


        productGrid.appendChild(article);

    });

}


/* =========================================================
   8. MAKE PRODUCT IMAGES FIT CORRECTLY
========================================================= */

function setupProductImages() {

    document.querySelectorAll(
        ".product-image img"
    ).forEach(function (image) {

        image.style.width = "100%";
        image.style.height = "390px";
        image.style.objectFit = "cover";
        image.style.display = "block";

    });

}


/* =========================================================
   9. SMOOTH SCROLLING
========================================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach(function (link) {

    link.addEventListener(
        "click",
        function (event) {

            const targetId =
                this.getAttribute("href");

            const target =
                document.querySelector(targetId);


            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

});


/* =========================================================
   10. LOAD SAVED PRODUCTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayUploadedProducts();

        setupProductImages();

        console.log(
            "✨ Welcome to Shreeva Trends!"
        );

        console.log(
            "Indian Women's Fashion Store"
        );

    }
);
  
