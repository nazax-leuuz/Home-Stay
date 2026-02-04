
document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const modal = document.getElementById('booking-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const bookButtons = document.querySelectorAll('.room__card .btn');
    const modalRoomName = document.getElementById('modal-room-name');
    const modalRoomPrice = document.getElementById('modal-room-price');
    const modalCheckin = document.getElementById('modal-checkin');
    const modalCheckout = document.getElementById('modal-checkout');
    const bookingNights = document.getElementById('booking-nights');
    const bookingTotal = document.getElementById('booking-total');
    const bookingForm = document.getElementById('booking-form');

    // Cart Elements
    const cartCount = document.getElementById('cart-count');
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Checkout Elements
    const checkoutSection = document.getElementById('checkout-section');
    const backToCartBtn = document.getElementById('back-to-cart');
    const paymentForm = document.getElementById('payment-form');

    let currentPricePerNight = 0;

    // --- Cart State from LocalStorage ---
    let cart = JSON.parse(localStorage.getItem('homestay_cart')) || [];
    updateCartIcon();

    // --- Event Listeners ---

    // Open Modal
    bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.room__card');
            const title = card.querySelector('h4').innerText;
            const priceText = card.querySelector('h5 span').innerText; // "$57/night"

            // Extract price number
            const priceMatch = priceText.match(/\$(\d+)/);
            const price = priceMatch ? parseInt(priceMatch[1]) : 0;

            openModal(title, price);
        });
    });

    // Close Modal
    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Toggle Cart Sidebar
    cartBtn.addEventListener('click', () => {
        renderCartItems();
        cartSidebar.classList.add('active');
        cartOverlay.classList.remove('hidden');
    });

    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.add('hidden');
        // Reset checkout view if open
        setTimeout(() => {
            checkoutSection.classList.add('hidden');
        }, 300);
    }

    // Checkout Navigation
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        checkoutSection.classList.remove('hidden');
    });

    backToCartBtn.addEventListener('click', () => {
        checkoutSection.classList.add('hidden');
    });

    // Payment Submission
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulate Processing
        const btn = paymentForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Processing...";
        btn.disabled = true;

        setTimeout(() => {
            alert("Payment Successful! Thank you for your booking.");
            cart = [];
            saveCart();
            updateCartIcon();
            closeCart();
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1500);
    });

    // Calculate Total on Date Change
    const fpCheckin = flatpickr("#modal-checkin", {
        minDate: "today",
        onChange: function (selectedDates, dateStr, instance) {
            fpCheckout.set('minDate', dateStr);
            calculateTotal();
        }
    });

    const fpCheckout = flatpickr("#modal-checkout", {
        minDate: "today",
        onChange: function (selectedDates, dateStr, instance) {
            calculateTotal();
        }
    });


    // Form Submission (Add to Cart)
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nights = parseInt(bookingNights.innerText);
        if (nights <= 0) {
            alert("Please select valid dates (at least 1 night).");
            return;
        }

        const bookingItem = {
            id: Date.now(),
            roomName: modalRoomName.innerText,
            pricePerNight: currentPricePerNight,
            checkIn: modalCheckin.value,
            checkOut: modalCheckout.value,
            nights: nights,
            totalPrice: nights * currentPricePerNight,
            guestName: document.getElementById('booking-name').value
        };

        addToCart(bookingItem);

        modal.classList.add('hidden');
        alert("Room added to cart!");
        bookingForm.reset();
        bookingNights.innerText = '0';
        bookingTotal.innerText = '$0';
    });


    // --- Functions ---

    function openModal(title, price) {
        modalRoomName.innerText = title;
        currentPricePerNight = price;
        modalRoomPrice.innerText = `$${price}/night`;
        bookingNights.innerText = '0';
        bookingTotal.innerText = '$0';
        modal.classList.remove('hidden');
    }

    function calculateTotal() {
        const date1 = fpCheckin.selectedDates[0];
        const date2 = fpCheckout.selectedDates[0];

        if (date1 && date2 && currentPricePerNight > 0) {
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                bookingNights.innerText = diffDays;
                bookingTotal.innerText = `$${diffDays * currentPricePerNight}`;
            } else {
                bookingNights.innerText = '0';
                bookingTotal.innerText = '$0';
            }
        }
    }

    function addToCart(item) {
        cart.push(item);
        saveCart();
        updateCartIcon();

        // Simple animation
        const badge = document.getElementById('cart-count');
        badge.classList.remove('pop-anim');
        void badge.offsetWidth; // trigger reflow
        badge.classList.add('pop-anim');
    }

    function saveCart() {
        localStorage.setItem('homestay_cart', JSON.stringify(cart));
    }

    function updateCartIcon() {
        cartCount.innerText = cart.length;
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>';
            cartTotalPrice.innerText = '$0';
            return;
        }

        cart.forEach((item, index) => {
            total += item.totalPrice;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.roomName}</div>
                    <div class="cart-item-details">${item.nights} nights (${item.checkIn} to ${item.checkOut})</div>
                    <div class="cart-item-price">$${item.totalPrice}</div>
                </div>
                <div class="remove-item" data-index="${index}">
                    <i class="ri-delete-bin-line"></i>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        cartTotalPrice.innerText = `$${total}`;

        // Add Delete Listeners
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                cart.splice(index, 1);
                saveCart();
                updateCartIcon();
                renderCartItems();
            });
        });
    }
});
