import './style.css';

const canvas = document.getElementById('hero-canvas');
const loader = document.getElementById('loading-screen');
const basePrice = 7000;

// Helper to format currency
const formatPrice = (price) => `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;

// --- GLOBAL CART STATE MANAGEMENT ---
// We use localStorage to persist the cart state across pages
let cartState = {
    quantity: parseInt(localStorage.getItem('cartQuantity')) || 0
};

const saveCartState = () => {
    localStorage.setItem('cartQuantity', cartState.quantity);
    updateGlobalCartUI();
};

const updateGlobalCartUI = () => {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.innerText = cartState.quantity;
        // Animation
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    });
};

// --- INITIALIZE UI ON LOAD ---
updateGlobalCartUI();


// --- SCROLLYTELLING LOGIC ---
if (canvas && loader) {
    const context = canvas.getContext('2d');
    const frameCount = 240;
    const currentFrame = index => `/frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
    const images = [];
    const progressFill = document.querySelector('.progress-bar-fill');
    const percentageText = document.querySelector('.percentage');
    
    let isLoaded = false;
    let loadedCount = 0;

    const updateLoader = (percent) => {
        if(progressFill) progressFill.style.width = `${percent}%`;
        if(percentageText) percentageText.innerText = `${percent}%`;
    }

    const startExperience = () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
        
        isLoaded = true;
        drawImage(0);
        setupScroll();
        observerSetup();
    };

    const drawImage = (index) => {
        if (index >= 0 && index < frameCount) {
            const img = images[index];
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgRatio > canvasRatio) {
                 drawHeight = canvas.height;
                 drawWidth = drawHeight * imgRatio;
                 offsetX = (canvas.width - drawWidth) / 2;
                 offsetY = 0;
            } else {
                 drawWidth = canvas.width;
                 drawHeight = drawWidth / imgRatio;
                 offsetX = 0;
                 offsetY = (canvas.height - drawHeight) / 2;
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
    };

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const scrollTop = document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFraction = maxScroll > 0 ? scrollTop / maxScroll : 0;
        const frameIndex = Math.min(
            frameCount - 1,
            Math.ceil(scrollFraction * frameCount)
        );
        if(isLoaded) drawImage(frameIndex);
    };

    const setupScroll = () => {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollFraction = maxScroll > 0 ? Math.max(0, Math.min(1, scrollTop / maxScroll)) : 0;
            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(scrollFraction * frameCount)
            );
            requestAnimationFrame(() => drawImage(frameIndex));
        });
    };

    const observerSetup = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targets = entry.target.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-bottom');
                    targets.forEach(t => t.classList.add('visible'));
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Preload Logic
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
          loadedCount++;
          const percent = Math.round((loadedCount / frameCount) * 100);
          updateLoader(percent);
          if (loadedCount === frameCount) startExperience();
        };
        img.onerror = () => {
            loadedCount++;
            const percent = Math.round((loadedCount / frameCount) * 100);
            updateLoader(percent);
            if (loadedCount === frameCount) startExperience();
        }
        images.push(img);
    }
}

// --- GLOBAL: CART MODAL LOGIC ---
// This now works on ALL pages (Index, Product, Shop)
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalDisplay = document.getElementById('cart-total-display');
// Note: We select all nav buttons, knowing the 2nd one is usually Cart. 
// Ideally we'd give the cart button an ID. Based on prev edits, we assume 2nd icon-btn.
const cartIconBtns = document.querySelectorAll('.icon-btn'); 
// The cart button is the one with the .badge inside it
let cartBtnTrigger = null;
cartIconBtns.forEach(btn => {
    if(btn.querySelector('.badge')) cartBtnTrigger = btn;
});

if (cartBtnTrigger && cartModal) {
    cartBtnTrigger.addEventListener('click', () => {
        cartModal.classList.add('active');
        renderCartContents();
    });

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            cartModal.classList.remove('active');
        });
    }
    
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.classList.remove('active');
    });
}

function renderCartContents() {
    if (!cartItemsContainer || !cartTotalDisplay) return;

    if (cartState.quantity > 0) {
        const total = basePrice * cartState.quantity;
        
        cartItemsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="width: 50px; height: 50px; background: #333; border-radius: 8px; overflow: hidden;">
                        <img src="/frames/ezgif-frame-001.jpg" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div>
                        <div style="color: #fff; font-weight: bold;">Mini Caméra A9</div>
                        <div style="color: #888; font-size: 0.9rem;">Quantité: ${cartState.quantity}</div>
                    </div>
                </div>
                <div style="color: #fff; font-weight: bold;">${formatPrice(total)}</div>
            </div>
        `;
        cartTotalDisplay.innerText = formatPrice(total);
    } else {
        cartItemsContainer.innerHTML = `<p style="color: #888; text-align: center; padding: 20px;">Votre panier est vide.</p>`;
        cartTotalDisplay.innerText = "0 FCFA";
    }
}


// --- PRODUCT PAGE SPECIFIC LOGIC ---
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');
const qtyDisplay = document.getElementById('qty-display');
const pdpTotalPrice = document.getElementById('total-price');

if (qtyMinus && qtyPlus && qtyDisplay && pdpTotalPrice) {
    // If we are on product page, sync local state with rendering
    // NOTE: When landing on product page, should we reflect the global cart quantity?
    // User flow: 
    // 1. Home -> Cart is 0.
    // 2. Product -> I select 2. Cart becomes 2.
    // 3. Home -> Cart is 2.
    // 4. Product -> Should it show 2? Usually "Add to cart" adds MORE. 
    // BUT here the UI is a quantity selector + "Commander". 
    // Let's assume the selector starts at the CURRENT cart quantity or 0? 
    // For simplicity and user expectation in this "Mini" app context, let's sync it.
    
    // Sync UI with stored state
    qtyDisplay.innerText = cartState.quantity;
    pdpTotalPrice.innerText = formatPrice(basePrice * cartState.quantity);

    const updateProductPageUI = () => {
        qtyDisplay.innerText = cartState.quantity;
        pdpTotalPrice.innerText = formatPrice(basePrice * cartState.quantity);
    };

    qtyMinus.addEventListener('click', () => {
        if (cartState.quantity > 0) {
            cartState.quantity--;
            saveCartState(); // Persist and sync header badge
            updateProductPageUI();
        }
    });

    qtyPlus.addEventListener('click', () => {
        cartState.quantity++;
        saveCartState();
        updateProductPageUI();
    });
}


// --- REVIEWS LOGIC ---
// --- REVIEWS LOGIC ---
const reviewsData = [
    { name: "Moyo Shiro", stars: 5, text: "Excellent produit ! Je recommande.", time: "Il y a 2h" },
    { name: "Alice K.", stars: 5, text: "Livraison super rapide à Abidjan.", time: "Il y a 1j" },
    { name: "Jean-Marc", stars: 4, text: "Bonne qualité d'image pour le prix.", time: "Il y a 2j" },
    { name: "Sarah L.", stars: 5, text: "Très discret, parfait pour la maison.", time: "Il y a 3j" },
    { name: "Kouamé B.", stars: 5, text: "Service client au top sur WhatsApp.", time: "Il y a 1 semaine" }
];

const track = document.getElementById('reviewsTrack');

if (track) {
    // Clear existing content just in case
    track.innerHTML = '';

    const createReviewCard = (review) => {
        const card = document.createElement('div');
        card.className = 'review-card glass-panel';
        card.style.minWidth = '300px'; 
        card.style.padding = '20px';
        card.style.flexShrink = '0'; // Prevent shrinking
        
        card.innerHTML = `
            <div class="review-header">
                <div class="stars">${'⭐'.repeat(review.stars)}</div>
                <div class="review-time">${review.time}</div>
            </div>
            <p class="review-text">"${review.text}"</p>
            <div class="review-author">- ${review.name}</div>
        `;
        return card;
    };

    // Populate track with data
    reviewsData.forEach(review => {
        track.appendChild(createReviewCard(review));
    });

    // Duplicate logic for seamless infinite scroll
    // We duplicate the items enough times to fill the potential gap
    reviewsData.forEach(review => {
        const clone = createReviewCard(review);
        clone.setAttribute('aria-hidden', 'true'); // Accessibility for clones
        track.appendChild(clone);
    });
}

// --- MODALS (Review & FAQ & Search) ---

// FAQ
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    item.addEventListener('click', () => {
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        const isVisible = answer.style.display === 'block'; 
        document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
        document.querySelectorAll('.faq-toggle').forEach(t => t.innerText = '+');
        if (!isVisible) {
            answer.style.display = 'block';
            toggle.innerText = '-';
        }
    });
});

// SEARCH
const products = [
    { name: "Mini Caméra A9", url: "product.html", price: "7 000 FCFA", img: "/frames/ezgif-frame-001.jpg" }
];
const searchBtn = document.getElementById('search-btn');
const searchModal = document.getElementById('search-modal');
const closeSearchBtn = document.getElementById('close-search');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', () => {
        searchModal.classList.add('active');
        if(searchInput) searchInput.focus();
    });
    if(closeSearchBtn) closeSearchBtn.addEventListener('click', () => searchModal.classList.remove('active'));
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) searchModal.classList.remove('active');
    });

    if(searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            searchResults.innerHTML = '';
            if (query.length > 0) {
                const filtered = products.filter(p => p.name.toLowerCase().includes(query));
                if (filtered.length > 0) {
                    filtered.forEach(product => {
                        const div = document.createElement('div');
                        div.style.cssText = "display: flex; align-items: center; gap: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; transition: background 0.2s; margin-bottom: 10px;";
                        div.innerHTML = `<img src="${product.img}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;"><div><div style="font-weight: bold; color: #fff;">${product.name}</div><div style="color: var(--accent-green); font-size: 0.8rem;">${product.price}</div></div>`;
                        div.addEventListener('click', () => window.location.href = product.url);
                        searchResults.appendChild(div);
                    });
                } else {
                    searchResults.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">Aucun produit trouvé.</div>';
                }
            }
        });
    }
}

// Review Modal Logic
const reviewModal = document.getElementById('review-modal');
const openReviewBtn = document.getElementById('add-review-btn');
const closeReviewBtn = document.getElementById('close-review');
if (openReviewBtn && reviewModal) {
    openReviewBtn.addEventListener('click', () => reviewModal.classList.add('active'));

    if(closeReviewBtn) closeReviewBtn.addEventListener('click', () => reviewModal.classList.remove('active'));
    reviewModal.addEventListener('click', (e) => { if(e.target === reviewModal) reviewModal.classList.remove('active') });
}

// --- CAROUSEL LOGIC ---
const trackCarousel = document.getElementById('carousel-track');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');

if (trackCarousel && prevBtn && nextBtn) {
    let currentIndex = 0;
    const slides = Array.from(trackCarousel.children);
    
    const updateCarousel = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        trackCarousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        // Optional: Pause videos not in view
        slides.forEach((slide, index) => {
            const video = slide.querySelector('video');
            if (video) {
                video.muted = true; // Force mute to allow autoplay
                if (index === currentIndex) {
                    video.currentTime = 0; 
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Auto-play was prevented", error);
                            // Auto-play was prevented.
                        });
                    }
                } else {
                    video.pause(); 
                }
            }
        });
    };

    // Need to update on resize too to correct the width calculation
    window.addEventListener('resize', updateCarousel);

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel();
    });
    
    // Initial call to set up videos
    // setTimeout to allow layout to settle
    setTimeout(updateCarousel, 100);
}

// --- ORDER FORM LOGIC (WHATSAPP BACKEND) ---
const orderForm = document.getElementById('whatsapp-order-form');
if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect Form Data
        const nom = document.getElementById('order-nom').value;
        const prenom = document.getElementById('order-prenom').value;
        const tel = document.getElementById('order-tel').value;
        const lieu = document.getElementById('order-lieu').value;

        // Collect Cart Data
        // If quantity is 0, we assume the user wants to buy 1 item since they filled the form.
        let quantityToOrder = cartState.quantity;
        if (quantityToOrder <= 0) quantityToOrder = 1;

        const total = formatPrice(basePrice * quantityToOrder);

        // Construct Message
        const message = `
*NOUVELLE COMMANDE WEB* 🚀
----------------------------
*Produit :* Mini Caméra A9
*Prix Unitaire :* ${formatPrice(basePrice)}
*Quantité :* ${quantityToOrder}
*Total à payer :* ${total}
----------------------------
👤 *Client :* ${nom} ${prenom}
📞 *Téléphone :* ${tel}
📍 *Lieu de livraison :* ${lieu}
----------------------------
Merci de confirmer ma commande !
        `.trim();

        // Encode and Redirect
        const phoneNumber = "2250575809069";
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(url, '_blank');
    });
}

