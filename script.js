"use strict";

/* ==============================
   script.js
   ============================== */

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------
  // THEME TOGGLE (light/dark)
  // ----------------------------
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  // ----------------------------
  // PRODUCT DATA (display + cart)
  // ----------------------------
  const products = {
    leaf: {
      id: "leaf",
      name: "Leaf Earrings",
      price: 24,
      img: "img/earring-leaf-01.jpg",
      desc: "Soft green leaf style, light weight feel. Easy everyday pair.",
    },
    pink: {
      id: "pink",
      name: "Pink Earrings",
      price: 18,
      img: "img/earring-pink-01.jpg",
      desc: "Pink beaded + crochet detail. Simple and cute, not heavy.",
    },
    starfish: {
      id: "starfish",
      name: "Starfish Earrings",
      price: 22,
      img: "img/earring-starfish-001.jpg",
      desc: "Starfish look with small beads. Fun for summer outfits.",
    },
  };

  // ----------------------------
  // PRODUCT DISPLAY (tabs)
  // ----------------------------
  const panel = document.getElementById("panel-product");
  const tabs = Array.from(document.querySelectorAll(".tab"));

  function renderProduct(key) {
    const p = products[key];
    if (!p || !panel) return;

    panel.innerHTML = `
      <article class="product-card">
        <img src="${p.img}" alt="${p.name}" class="product-img" />
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-price">$${p.price}</p>
          <p class="product-desc">${p.desc}</p>
        </div>
      </article>
    `;
  }

  function setActiveTab(clickedTab) {
    tabs.forEach((t) => {
      const active = t === clickedTab;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });

    const key = clickedTab.getAttribute("data-product");
    const labelId = clickedTab.id;
    if (panel) panel.setAttribute("aria-labelledby", labelId);

    renderProduct(key);
  }

  if (tabs.length && panel) {
    renderProduct("leaf");
    tabs.forEach((t) => {
      t.addEventListener("click", () => setActiveTab(t));
    });
  }

  // ----------------------------
  // CART / COST CALCULATOR
  // ----------------------------
  const cartItemsBox = document.getElementById("cartItems");
  const subTotalEl = document.getElementById("subTotal");
  const taxTotalEl = document.getElementById("taxTotal");
  const shipTotalEl = document.getElementById("shipTotal");
  const grandTotalEl = document.getElementById("grandTotal");
  const cartMsg = document.getElementById("cartMsg");

  const TAX = 0.07;
  const SHIP = 0.01;

  let cart = JSON.parse(localStorage.getItem("miniCart")) || {
    leaf: 0,
    pink: 0,
    starfish: 0,
  };

  function saveCart() {
    localStorage.setItem("miniCart", JSON.stringify(cart));
  }

  function money(n) {
    return `$${n.toFixed(2)}`;
  }

  function calcTotals() {
    const subtotal =
      cart.leaf * products.leaf.price +
      cart.pink * products.pink.price +
      cart.starfish * products.starfish.price;

    const tax = subtotal * TAX;
    const ship = subtotal * SHIP;
    const total = subtotal + tax + ship;

    if (subTotalEl) subTotalEl.textContent = money(subtotal);
    if (taxTotalEl) taxTotalEl.textContent = money(tax);
    if (shipTotalEl) shipTotalEl.textContent = money(ship);
    if (grandTotalEl) grandTotalEl.textContent = money(total);

    return { subtotal, tax, ship, total };
  }

  function renderCart() {
    if (!cartItemsBox) return;

    cartItemsBox.innerHTML = "";

    Object.values(products).forEach((p) => {
      const qty = cart[p.id] || 0;

      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `
        <img src="${p.img}" alt="${p.name}" />
        <div>
          <h4>${p.name}</h4>
          <p>${money(p.price)}</p>
        </div>
        <div class="qty-controls" aria-label="${p.name} quantity controls">
          <button class="qty-btn" type="button" data-action="dec" data-id="${p.id}" aria-label="Decrease ${p.name}">−</button>
          <span class="qty" aria-live="polite">${qty}</span>
          <button class="qty-btn" type="button" data-action="inc" data-id="${p.id}" aria-label="Increase ${p.name}">+</button>
        </div>
      `;
      cartItemsBox.appendChild(row);
    });

    calcTotals();
  }

  function changeQty(id, delta) {
    cart[id] = Math.max(0, (cart[id] || 0) + delta);
    saveCart();
    renderCart();
    if (cartMsg) cartMsg.textContent = "";
  }

  if (cartItemsBox) {
    cartItemsBox.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      if (!products[id]) return;

      if (action === "inc") changeQty(id, 1);
      if (action === "dec") changeQty(id, -1);
    });
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  const clearBtn = document.getElementById("clearBtn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const { subtotal, total } = calcTotals();
      if (subtotal <= 0) {
        if (cartMsg) cartMsg.textContent = "Add something first before you checkout.";
        return;
      }

      const ordered = Object.keys(cart)
        .filter((k) => cart[k] > 0)
        .map((k) => `${products[k].name} x${cart[k]}`)
        .join(", ");

      if (cartMsg) {
        cartMsg.textContent = `Order placed: ${ordered}. Total was ${money(total)}.`;
      }

      cart = { leaf: 0, pink: 0, starfish: 0 };
      saveCart();
      renderCart();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      cart = { leaf: 0, pink: 0, starfish: 0 };
      saveCart();
      renderCart();
      if (cartMsg) cartMsg.textContent = "Cart cleared.";
    });
  }

  renderCart();

  // ----------------------------
  // GAME (guess 1–10)
  // ----------------------------
  const guessInput = document.getElementById("guessInput");
  const guessError = document.getElementById("guessError");
  const playBtn = document.getElementById("playBtn");
  const userGuessOut = document.getElementById("userGuessOut");
  const randOut = document.getElementById("randOut");
  const gameMsg = document.getElementById("gameMsg");

  function setGuessError(msg) {
    if (guessError) guessError.textContent = msg;
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      setGuessError("");
      if (!guessInput) return;

      const raw = guessInput.value.trim();
      const n = Number(raw);

      if (!raw || Number.isNaN(n) || n < 1 || n > 10) {
        setGuessError("Enter a number from 1 to 10.");
        return;
      }

      const r = Math.floor(Math.random() * 10) + 1;

      if (userGuessOut) userGuessOut.textContent = String(n);
      if (randOut) randOut.textContent = String(r);

      if (gameMsg) {
        gameMsg.textContent = n === r ? "You win 🎉" : "Nope. try again.";
      }
    });
  }

  // ----------------------------
  // FORM VALIDATION + MESSAGES
  // ----------------------------
  const form = document.getElementById("contactForm");
  const submitMsg = document.getElementById("submitMsg");

  const nameEl = document.getElementById("fullName");
  const commentsEl = document.getElementById("comments");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");

  const nameErr = document.getElementById("nameError");
  const commentsErr = document.getElementById("commentsError");
  const prefErr = document.getElementById("prefError");
  const emailErr = document.getElementById("emailError");
  const phoneErr = document.getElementById("phoneError");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\s*(\+?1\s*)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})\s*$/;

  function clearMsg() {
    if (submitMsg) submitMsg.textContent = "";
  }

  function setErr(el, msg) {
    if (el) el.textContent = msg;
  }

  function getPref() {
    const checked = document.querySelector('input[name="prefContact"]:checked');
    return checked ? checked.value : "";
  }

  function clearErrors() {
    setErr(nameErr, "");
    setErr(commentsErr, "");
    setErr(prefErr, "");
    setErr(emailErr, "");
    setErr(phoneErr, "");
  }

  // clear errors as user types (less annoying)
  [nameEl, commentsEl, emailEl, phoneEl].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      clearMsg();
      // only clear related errors quickly
      clearErrors();
    });
  });

  document.querySelectorAll('input[name="prefContact"]').forEach((r) => {
    r.addEventListener("change", () => {
      clearMsg();
      clearErrors();
    });
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();
      clearMsg();

      const fullName = nameEl ? nameEl.value.trim() : "";
      const comments = commentsEl ? commentsEl.value.trim() : "";
      const pref = getPref();

      const email = emailEl ? emailEl.value.trim() : "";
      const phone = phoneEl ? phoneEl.value.trim() : "";

      let ok = true;

      if (!fullName) {
        setErr(nameErr, "Name is required.");
        ok = false;
      }

      if (!comments) {
        setErr(commentsErr, "Comments are required.");
        ok = false;
      }

      if (!pref) {
        setErr(prefErr, "Choose email or phone.");
        ok = false;
      }

      if (pref === "email") {
        if (!email) {
          setErr(emailErr, "Email is required if you pick email.");
          ok = false;
        } else if (!emailRegex.test(email)) {
          setErr(emailErr, "Enter a valid email (ex: name@site.com).");
          ok = false;
        }
      }

      if (pref === "phone") {
        if (!phone) {
          setErr(phoneErr, "Phone is required if you pick phone.");
          ok = false;
        } else if (!phoneRegex.test(phone)) {
          setErr(phoneErr, "Enter a valid phone (ex: 555-555-5555).");
          ok = false;
        }
      }

      if (!ok) return;

      // required: create an object from valid input
      const customer = {
        name: fullName,
        comments: comments,
        preferred: pref,
        email: email,
        phone: phone,
      };

      // success message pulled from the object
      const contactLine =
        customer.preferred === "email"
          ? `We’ll email you at ${customer.email}.`
          : `We’ll call/text you at ${customer.phone}.`;

      if (submitMsg) {
        submitMsg.textContent =
          `Thanks ${customer.name}. ${contactLine} ` +
          `Pigeon en route 🐦 (ok not really).`;
      }

      form.reset();
    });
  }
});