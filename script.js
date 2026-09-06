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
        price: price
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

        total += product.price;

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
   6. SMOOTH SCROLLING
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
   7. WELCOME MESSAGE
   ========================================================= */

console.log(
    "✨ Welcome to Shreeva Trends!"
);

console.log(
    "Indian Women's Fashion Store"
);
