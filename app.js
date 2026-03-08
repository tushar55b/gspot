/* ============================================
   G·SPOT — Artisan Bakery & Pizzeria
   app.js
   ============================================ */

'use strict';

/* ============================================
   LOADING SCREEN
   ============================================ */
(function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  const minDisplay = 1800;
  const start = Date.now();

  function hideScreen() {
    const elapsed = Date.now() - start;
    const delay = Math.max(0, minDisplay - elapsed);
    setTimeout(() => {
      screen.classList.add('hidden');
      setTimeout(() => screen.remove(), 700);
    }, delay);
  }

  if (document.readyState === 'complete') {
    hideScreen();
  } else {
    window.addEventListener('load', hideScreen);
  }
})();

/* ============================================
   CUSTOM CURSOR
   ============================================ */
(function initCursor() {
  const dot = document.getElementById('cursor-dot');
  if (!dot) return;

  let mx = -100, my = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });

  const interactiveSelectors = 'a, button, .product-card, .tab-btn, input, textarea, label';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      dot.classList.add('expanded');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      dot.classList.remove('expanded');
    }
  });
})();

/* ============================================
   NAVBAR — Scroll behavior
   ============================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================
   HAMBURGER MENU
   ============================================ */
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function close() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    menu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      close();
    }
  });
})();

/* ============================================
   SMOOTH SCROLL
   ============================================ */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ============================================
   HERO PARTICLES
   ============================================ */
(function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const count = 28;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size     = Math.random() * 5 + 2;
    const left     = Math.random() * 100;
    const bottom   = Math.random() * -20;
    const duration = Math.random() * 14 + 10;
    const delay    = Math.random() * -20;
    const drift    = (Math.random() - 0.5) * 120;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: ${bottom}%;
      --drift: ${drift}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${Math.random() * 0.4 + 0.1};
    `;
    container.appendChild(p);
  }
})();

/* ============================================
   INTERSECTION OBSERVER — Fade-up animations
   ============================================ */
(function initFadeAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.fade-up'));
        const idx = siblings.indexOf(entry.target);
        const delay = idx * 80;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

/* ============================================
   SHOP TABS
   ============================================ */
(function initShopTabs() {
  const tabBtns     = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const content = document.getElementById(`tab-${tab}`);
      if (content) {
        content.classList.add('active');

        content.querySelectorAll('.fade-up').forEach((el, i) => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), i * 70);
        });
      }
    });
  });
})();

/* ============================================
   CART STATE & MANAGEMENT
   ============================================ */
const Cart = (function() {
  let items = {}; // { id: { id, name, price, qty } }

  function getCount() {
    return Object.values(items).reduce((sum, it) => sum + it.qty, 0);
  }

  function getTotal() {
    return Object.values(items).reduce((sum, it) => sum + it.price * it.qty, 0);
  }

  function getItems() {
    return Object.values(items);
  }

  function addItem(id, name, price) {
    if (items[id]) {
      items[id].qty += 1;
    } else {
      items[id] = { id, name, price: parseFloat(price), qty: 1 };
    }
    render();
    updateNavCount();
    showToast(`Added to cart — ${name}`, 'toast-gold');
  }

  function incrementItem(id) {
    if (items[id]) {
      items[id].qty += 1;
      render();
      updateNavCount();
    }
  }

  function decrementItem(id) {
    if (!items[id]) return;
    items[id].qty -= 1;
    if (items[id].qty <= 0) {
      removeItem(id, true);
      return;
    }
    render();
    updateNavCount();
  }

  function removeItem(id, silent) {
    const name = items[id] ? items[id].name : '';
    delete items[id];
    render();
    updateNavCount();
    if (!silent) showToast(`Removed — ${name}`);
  }

  function clearAll() {
    items = {};
    render();
    updateNavCount();
  }

  function updateNavCount() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;
    const n = getCount();
    countEl.textContent = n;
    countEl.classList.remove('bump');
    void countEl.offsetWidth;
    countEl.classList.add('bump');
  }

  function render() {
    const container = document.getElementById('cart-items');
    const totalEl   = document.getElementById('cart-total');
    if (!container) return;

    const keys = Object.keys(items);

    if (!keys.length) {
      container.innerHTML = '<p class="cart-empty">Your cart is empty.<br/><span>Add something delicious.</span></p>';
      if (totalEl) totalEl.textContent = '$0.00';
      return;
    }

    container.innerHTML = keys.map(id => {
      const it = items[id];
      return `
        <div class="cart-item" data-id="${it.id}">
          <div class="cart-item-name">${escapeHtml(it.name)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn qty-dec" data-id="${it.id}" aria-label="Decrease">−</button>
            <span class="qty-num">${it.qty}</span>
            <button class="qty-btn qty-inc" data-id="${it.id}" aria-label="Increase">+</button>
          </div>
          <div class="cart-item-price">$${(it.price * it.qty).toFixed(2)}</div>
          <button class="remove-item" data-id="${it.id}" aria-label="Remove">×</button>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = '$' + getTotal().toFixed(2);

    container.querySelectorAll('.qty-inc').forEach(btn => {
      btn.addEventListener('click', () => incrementItem(btn.dataset.id));
    });
    container.querySelectorAll('.qty-dec').forEach(btn => {
      btn.addEventListener('click', () => decrementItem(btn.dataset.id));
    });
    container.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => removeItem(btn.dataset.id));
    });
  }

  return { addItem, render, updateNavCount, getItems, getTotal, getCount, clearAll };
})();

/* ============================================
   ADD TO CART BUTTONS
   ============================================ */
(function initAddToCart() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const { id, name, price } = btn.dataset;
      Cart.addItem(id, name, price);

      const original = btn.textContent;
      btn.textContent = 'Added ✓';
      btn.style.background = 'var(--gold)';
      btn.style.color = 'var(--bg)';
      btn.style.borderColor = 'var(--gold)';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 1200);
    });
  });
})();

/* ============================================
   CART SIDEBAR — Open/Close
   ============================================ */
(function initCartSidebar() {
  const sidebar  = document.getElementById('cart-sidebar');
  const overlay  = document.getElementById('cart-overlay');
  const openBtn  = document.getElementById('cart-btn');
  const closeBtn = document.getElementById('close-cart');
  if (!sidebar || !overlay || !openBtn) return;

  function openCart() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
    }
  });

  // Expose for checkout
  window._cartSidebar = { open: openCart, close: closeCart };
})();

/* ============================================
   CHECKOUT MODAL — Multi-step flow
   ============================================ */
(function initCheckout() {
  const checkoutOverlay = document.getElementById('checkout-overlay');
  const checkoutClose   = document.getElementById('checkout-close');
  const btnCheckout     = document.getElementById('btn-checkout');
  if (!checkoutOverlay || !btnCheckout) return;

  const DELIVERY_FEE = 4.99;
  const TAX_RATE     = 0.08875;

  let currentStep = 1;
  let deliveryEmail = '';

  // Step dot elements
  const stepDots = document.querySelectorAll('.checkout-step-dot');

  function openCheckout() {
    // Close cart sidebar first
    if (window._cartSidebar) window._cartSidebar.close();

    // Populate order review
    populateReview();

    // Reset to step 1
    goToStep(1);

    checkoutOverlay.classList.add('visible');
    checkoutOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    checkoutOverlay.classList.remove('visible');
    checkoutOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function goToStep(n) {
    currentStep = n;

    // Update panes
    document.querySelectorAll('.checkout-pane').forEach((pane, i) => {
      pane.classList.remove('active');
      if (i + 1 === n) pane.classList.add('active');
    });

    // Update step dots
    stepDots.forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i + 1 === n) dot.classList.add('active');
      else if (i + 1 < n) dot.classList.add('done');
    });
  }

  function populateReview() {
    const items = Cart.getItems();
    const subtotal = Cart.getTotal();
    const tax   = subtotal * TAX_RATE;
    const total = subtotal + DELIVERY_FEE + tax;

    const coItems = document.getElementById('co-items');
    if (coItems) {
      if (!items.length) {
        coItems.innerHTML = '<div class="co-item"><span class="co-item-name" style="color:var(--text-muted)">Cart is empty</span></div>';
      } else {
        coItems.innerHTML = items.map(it => `
          <div class="co-item">
            <span class="co-item-name">${escapeHtml(it.name)}</span>
            <span class="co-item-qty">× ${it.qty}</span>
            <span class="co-item-price">$${(it.price * it.qty).toFixed(2)}</span>
          </div>
        `).join('');
      }
    }

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('co-subtotal', '$' + subtotal.toFixed(2));
    el('co-tax',      '$' + tax.toFixed(2));
    el('co-total',    '$' + total.toFixed(2));
  }

  // Open on checkout button
  btnCheckout.addEventListener('click', () => {
    if (Cart.getCount() === 0) {
      showToast('Your cart is empty!');
      return;
    }
    openCheckout();
  });

  // Close button
  if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);

  // Close on overlay backdrop click
  checkoutOverlay.addEventListener('click', (e) => {
    if (e.target === checkoutOverlay) closeCheckout();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && checkoutOverlay.classList.contains('visible')) {
      closeCheckout();
    }
  });

  // Step 1 → Step 2
  const coToDelivery = document.getElementById('co-to-delivery');
  if (coToDelivery) {
    coToDelivery.addEventListener('click', () => {
      if (Cart.getCount() === 0) { showToast('Add items first!'); return; }
      goToStep(2);
    });
  }

  // Step 2 form — Continue to Payment
  const deliveryForm = document.getElementById('co-delivery-form');
  if (deliveryForm) {
    deliveryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name  = document.getElementById('co-name');
      const email = document.getElementById('co-email');
      const street = document.getElementById('co-street');
      const zip   = document.getElementById('co-zip');

      let valid = true;

      [name, email, street, zip].forEach(field => {
        field.classList.remove('co-error');
        if (!field.value.trim()) {
          field.classList.add('co-error');
          valid = false;
        }
      });

      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add('co-error');
        valid = false;
      }

      if (valid) {
        deliveryEmail = email ? email.value.trim() : '';
        goToStep(3);
      }
    });
  }

  // Step 2 back
  const coBack1 = document.getElementById('co-back-1');
  if (coBack1) coBack1.addEventListener('click', () => goToStep(1));

  // Step 3 — Card number formatting & icon detection
  const cardNumInput = document.getElementById('co-card-num');
  if (cardNumInput) {
    cardNumInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = val;

      // Detect card type from first digit
      const first = val[0];
      document.getElementById('card-svg-visa').style.display  = 'none';
      document.getElementById('card-svg-mc').style.display    = 'none';
      document.getElementById('card-svg-amex').style.display  = 'none';

      if (first === '4') {
        document.getElementById('card-svg-visa').style.display = '';
      } else if (first === '5' || first === '2') {
        document.getElementById('card-svg-mc').style.display = '';
      } else if (first === '3') {
        document.getElementById('card-svg-amex').style.display = '';
      } else {
        document.getElementById('card-svg-visa').style.display = '';
      }
    });
  }

  // Expiry formatting
  const expiryInput = document.getElementById('co-expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
      e.target.value = val;
    });
  }

  // Step 3 form — Place Order
  const paymentForm = document.getElementById('co-payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const cardNum  = document.getElementById('co-card-num');
      const cardName = document.getElementById('co-card-name');
      const expiry   = document.getElementById('co-expiry');
      const cvv      = document.getElementById('co-cvv');

      let valid = true;
      [cardNum, cardName, expiry, cvv].forEach(field => {
        field.classList.remove('co-error');
        if (!field.value.trim()) {
          field.classList.add('co-error');
          valid = false;
        }
      });

      if (!valid) return;

      // Generate order number
      const orderNum = 'GS-' + Math.floor(1000 + Math.random() * 9000);
      const orderNumEl = document.getElementById('co-order-num');
      const confirmMsgEl = document.getElementById('co-confirm-msg');

      if (orderNumEl) orderNumEl.textContent = `Order #${orderNum} confirmed!`;
      if (confirmMsgEl) {
        const emailDisplay = deliveryEmail || 'your email';
        confirmMsgEl.textContent = `We'll have it ready within 45 minutes. You'll get a confirmation at ${emailDisplay}.`;
      }

      goToStep(4);

      // Trigger checkmark animation
      setTimeout(() => {
        const checkmark = document.querySelector('.co-checkmark');
        if (checkmark) checkmark.classList.add('animate');
      }, 100);
    });
  }

  // Step 3 back
  const coBack2 = document.getElementById('co-back-2');
  if (coBack2) coBack2.addEventListener('click', () => goToStep(2));

  // Step 4 — Continue Shopping
  const continueBtn = document.getElementById('co-continue-shopping');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      closeCheckout();
      Cart.clearAll();

      // Reset checkout forms
      const df = document.getElementById('co-delivery-form');
      const pf = document.getElementById('co-payment-form');
      if (df) df.reset();
      if (pf) pf.reset();

      // Reset checkmark
      const checkmark = document.querySelector('.co-checkmark');
      if (checkmark) checkmark.classList.remove('animate');

      // Reset card icon to visa default
      const visaSvg = document.getElementById('card-svg-visa');
      const mcSvg = document.getElementById('card-svg-mc');
      const amexSvg = document.getElementById('card-svg-amex');
      if (visaSvg) visaSvg.style.display = '';
      if (mcSvg) mcSvg.style.display = 'none';
      if (amexSvg) amexSvg.style.display = 'none';
    });
  }
})();

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */
function showToast(msg, cls) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast' + (cls ? ' ' + cls : '');
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 2900);
}

/* ============================================
   CONTACT FORM VALIDATION
   ============================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    { el: document.getElementById('form-name'),    errEl: document.getElementById('error-name') },
    email:   { el: document.getElementById('form-email'),   errEl: document.getElementById('error-email') },
    message: { el: document.getElementById('form-message'), errEl: document.getElementById('error-message') },
  };

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function setError(field, msg) {
    field.el.classList.add('error');
    if (field.errEl) field.errEl.textContent = msg;
  }

  function clearError(field) {
    field.el.classList.remove('error');
    if (field.errEl) field.errEl.textContent = '';
  }

  Object.values(fields).forEach(f => {
    f.el.addEventListener('input', () => clearError(f));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nameVal    = fields.name.el.value.trim();
    const emailVal   = fields.email.el.value.trim();
    const messageVal = fields.message.el.value.trim();

    if (!nameVal) { setError(fields.name, 'Please enter your name.'); valid = false; }
    else clearError(fields.name);

    if (!emailVal) { setError(fields.email, 'Please enter your email.'); valid = false; }
    else if (!validateEmail(emailVal)) { setError(fields.email, 'Please enter a valid email address.'); valid = false; }
    else clearError(fields.email);

    if (!messageVal) { setError(fields.message, 'Please enter a message.'); valid = false; }
    else clearError(fields.message);

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        form.reset();
        btn.textContent = original;
        btn.disabled = false;
        showToast('Message sent — we\'ll get back to you soon!', 'toast-gold');
      }, 1200);
    }
  });
})();

/* ============================================
   UTILITY — HTML escape
   ============================================ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================
   ACTIVE NAV LINKS on scroll
   ============================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.style.color = href === `#${id}` ? 'var(--cream)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  Cart.render();
  Cart.updateNavCount();
});
