"use strict";

/* =========================================================
   CHOCO LOCO APP ENGINE
========================================================= */


/* =========================================================
   STATE
========================================================= */

const state = {
  screen: "home",
  previousScreen: null,

  cart: [],

  deliveryMode: "pickup",

  filter: "all",

  menuQuery: "",

  globalQuery: "",

  isChangingScreen: false,

  toastTimer: null,

  currentScroll: 0,

  targetOrbitRotation: 0,

  currentOrbitRotation: 0
};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (
  selector,
  parent = document
) => parent.querySelector(selector);

const $$ = (
  selector,
  parent = document
) => [
  ...parent.querySelectorAll(selector)
];

const money = value => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "Price on request";
  }

  return `D${Number(value).toLocaleString("en-US")}`;
};

const escapeHTML = value =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setTimeout(
      hideSplash,
      1850
    );

    initIcons();

    initNavigation();

    initScroll();

    initMenu();

    initOrder();

    initSearch();

    initBag();

    initProfile();

    initRevealAnimations();

    initThreeHero();

    updateBag();

  }
);


/* =========================================================
   SPLASH
========================================================= */

function hideSplash() {

  const splash =
    $("#splash");

  if (!splash) {
    return;
  }

  splash.classList.add(
    "hidden"
  );

  document.body.classList.remove(
    "locked"
  );

  $("#app")?.classList.add(
    "ready"
  );

}


/* =========================================================
   ICONS
========================================================= */

function initIcons() {

  const render =
    () => {

      if (
        window.lucide &&
        typeof lucide.createIcons === "function"
      ) {

        lucide.createIcons();

      }

    };

  render();

  setTimeout(render, 250);

  setTimeout(render, 1000);

}


/* =========================================================
   NAVIGATION
========================================================= */

function initNavigation() {

  $$("[data-go]").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          navigate(
            button.dataset.go
          );

        }
      );

    }
  );


  $$("[data-tab]").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          navigate(
            button.dataset.tab
          );

        }
      );

    }
  );


  $("#openBag")
    ?.addEventListener(
      "click",
      openBag
    );


  $("#menuSearchButton")
    ?.addEventListener(
      "click",
      openSearchAndFocus
    );


  $("#openSearch")
    ?.addEventListener(
      "click",
      openSearchAndFocus
    );


  $(".hero-scroll")
    ?.addEventListener(
      "click",
      () => {

        const element =
          $("#intro");

        if (!element) {
          return;
        }

        element.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );


  setNavIndicator(0);

}


function navigate(
  target
) {

  const valid =
    [
      "home",
      "menu",
      "order",
      "profile"
    ];

  if (
    !valid.includes(target) ||
    state.isChangingScreen ||
    state.screen === target
  ) {
    return;
  }


  const current =
    $(
      `.screen[data-screen="${state.screen}"]`
    );

  const next =
    $(
      `.screen[data-screen="${target}"]`
    );


  if (!next) {
    return;
  }


  state.isChangingScreen =
    true;

  state.previousScreen =
    state.screen;

  state.screen =
    target;


  if (current) {

    current.classList.add(
      "leaving"
    );

  }


  next.classList.add(
    "active"
  );


  updateNavigationState(
    target
  );


  setTimeout(
    () => {

      current?.classList.remove(
        "active",
        "leaving"
      );

      next.classList.remove(
        "leaving"
      );

      state.isChangingScreen =
        false;

      window.scrollTo({
        top: 0,
        behavior: "instant"
      });

      observeNewElements();

      renderOrder();

    },
    520
  );

}


function updateNavigationState(
  target
) {

  $$(".nav-item").forEach(
    item => {

      item.classList.toggle(
        "active",
        item.dataset.tab === target
      );

    }
  );


  const indexes = {
    home: 0,
    menu: 1,
    order: 2,
    profile: 3,
    bag: 4
  };


  const index =
    indexes[target] ?? 0;


  setNavIndicator(index);

}


function setNavIndicator(
  index
) {

  const nav =
    $("#bottomNav");

  const indicator =
    $("#navIndicator");

  if (!nav || !indicator) {
    return;
  }


  const buttons =
    $$(".nav-item", nav);


  /*
    There are three normal nav items plus
    the bag item. The order button sits
    between menu/profile but the indicator
    should track the five visual slots.
  */

  const slotWidth =
    nav.clientWidth / 5;


  const indicatorWidth =
    56;


  const x =
    (slotWidth * index)
    +
    (slotWidth - indicatorWidth) / 2;


  indicator.style.transform =
    `translateX(${x}px)`;

}


/* =========================================================
   SCROLL
========================================================= */

function initScroll() {

  const topbar =
    $("#topbar");

  let ticking =
    false;


  window.addEventListener(
    "scroll",
    () => {

      state.currentScroll =
        window.scrollY;


      if (!ticking) {

        requestAnimationFrame(
          () => {

            topbar?.classList.toggle(
              "scrolled",
              window.scrollY > 40
            );


            /*
              Scroll controls the rotating
              orbit typography.
            */

            state.targetOrbitRotation =
              window.scrollY *
              0.0019;


            ticking = false;

          }
        );

        ticking = true;

      }

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   REVEALS
========================================================= */

let revealObserver = null;


function initRevealAnimations() {

  if (
    !("IntersectionObserver" in window)
  ) {
    return;
  }


  revealObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (
              !entry.isIntersecting
            ) {
              return;
            }


            entry.target.classList.add(
              "revealed"
            );


            revealObserver.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: .12,
        rootMargin:
          "0px 0px -8% 0px"
      }
    );


  observeNewElements();

}


function observeNewElements() {

  if (!revealObserver) {
    return;
  }


  const elements =
    document.querySelectorAll(
      ".screen.active .home-section, " +
      ".screen.active .mood-card, " +
      ".screen.active .review-card, " +
      ".screen.active .photo-feature, " +
      ".screen.active .builder-section, " +
      ".screen.active .visit-block, " +
      ".screen.active .product-card, " +
      ".screen.active .order-card, " +
      ".screen.active .customer-card, " +
      ".screen.active .story-photo, " +
      ".screen.active .info-row"
    );


  elements.forEach(
    element => {

      if (
        !element.hasAttribute(
          "data-reveal"
        )
      ) {

        element.setAttribute(
          "data-reveal",
          ""
        );

      }

      revealObserver.observe(
        element
      );

    }
  );


  const photo =
    $(".photo-feature");


  if (
    photo &&
    !photo.dataset.parallaxReady
  ) {

    photo.dataset.parallaxReady =
      "true";

  }

}


/* =========================================================
   MENU
========================================================= */

function initMenu() {

  $$(".category").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          state.filter =
            button.dataset.filter;

          $$(".category").forEach(
            item => {

              item.classList.toggle(
                "active",
                item === button
              );

            }
          );

          renderMenu();

        }
      );

    }
  );


  $("#menuInput")
    ?.addEventListener(
      "input",
      event => {

        state.menuQuery =
          event.target.value
            .trim()
            .toLowerCase();

        $("#menuClear")
          ?.classList.toggle(
            "visible",
            !!state.menuQuery
          );

        renderMenu();

      }
    );


  $("#menuClear")
    ?.addEventListener(
      "click",
      () => {

        $("#menuInput").value = "";

        state.menuQuery = "";

        $("#menuClear")
          ?.classList.remove(
            "visible"
          );

        renderMenu();

        $("#menuInput")?.focus();

      }
    );


  $$(".favorite").forEach(
    button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          button.classList.toggle(
            "liked"
          );

          const liked =
            button.classList.contains(
              "liked"
            );

          showToast(
            liked
              ? "Saved"
              : "Removed",
            liked
              ? "Added to your favourites."
              : "Removed from your favourites."
          );

        }
      );

    }
  );


  $$(".product-add").forEach(
    button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          const card =
            button.closest(
              ".product-card"
            );

          if (!card) {
            return;
          }

          addCardToCart(
            card
          );

        }
      );

    }
  );


  renderMenu();

}


function addCardToCart(
  card
) {

  const product = {
    name: card.dataset.name,

    category:
      card.dataset.category,

    price:
      card.dataset.price === ""
        ? null
        : Number(card.dataset.price),

    description:
      card.dataset.description,

    emoji:
      card.dataset.emoji || "🍰"
  };


  addToCart(
    product
  );

}


function renderMenu() {

  const cards =
    $$(".product-card");

  let visible =
    0;


  cards.forEach(
    card => {

      const categoryMatch =
        state.filter === "all" ||
        card.dataset.category ===
          state.filter;


      const searchable =
        (
          card.dataset.name +
          " " +
          card.dataset.category +
          " " +
          card.dataset.description
        ).toLowerCase();


      const queryMatch =
        !state.menuQuery ||
        searchable.includes(
          state.menuQuery
        );


      const show =
        categoryMatch &&
        queryMatch;


      card.classList.toggle(
        "hidden",
        !show
      );


      if (show) {
        visible++;
      }

    }
  );


  $("#emptyResults")
    ?.classList.toggle(
      "show",
      visible === 0
    );

}


/* =========================================================
   CART
========================================================= */

function addToCart(
  product
) {

  const existing =
    state.cart.find(
      item =>
        item.name ===
        product.name
    );


  if (existing) {

    existing.quantity++;

  } else {

    state.cart.push({
      ...product,
      quantity: 1
    });

  }


  updateBag();


  showToast(
    "Added to basket",
    `${product.name} is in your basket.`
  );

}


function changeQuantity(
  name,
  amount
) {

  const item =
    state.cart.find(
      product =>
        product.name === name
    );


  if (!item) {
    return;
  }


  item.quantity += amount;


  if (item.quantity <= 0) {

    state.cart =
      state.cart.filter(
        product =>
          product.name !==
          name
      );

  }


  updateBag();

}


function cartCount() {

  return state.cart.reduce(
    (
      total,
      item
    ) => total + item.quantity,
    0
  );

}


function cartTotal() {

  let total = 0;

  let hasUnknown =
    false;


  state.cart.forEach(
    item => {

      if (
        item.price === null ||
        item.price === undefined
      ) {

        hasUnknown = true;

        return;

      }


      total +=
        item.price *
        item.quantity;

    }
  );


  return {
    value: total,
    hasUnknown
  };

}


function renderOrderLines(
  container
) {

  if (!container) {
    return;
  }


  if (!state.cart.length) {

    container.innerHTML = `

      <div class="empty-order">

        <div class="empty-order-emoji">
          🍰
        </div>

        <h3>
          Your basket is empty.
        </h3>

        <p>
          Start with something sweet.
        </p>

        <button
          class="primary-btn small"
          data-go="menu"
        >
          Browse menu
          <i data-lucide="arrow-right"></i>
        </button>

      </div>
    `;

    initIcons();

    return;

  }


  container.innerHTML =
    state.cart.map(
      item => `

        <div
          class="order-line"
        >

          <div class="order-thumb">
            ${item.emoji}
          </div>

          <div
            class="order-line-main"
          >

            <strong>
              ${escapeHTML(
                item.name
              )}
            </strong>

            <small>
              ${money(
                item.price
              )}
            </small>

            <span class="line-price">
              ${
                item.price === null
                  ? "Price on request"
                  : money(
                      item.price *
                      item.quantity
                    )
              }
            </span>

          </div>

          <div
            class="quantity-controls"
          >

            <button
              data-minus="${escapeHTML(
                item.name
              )}"
            >
              −
            </button>

            <span>
              ${item.quantity}
            </span>

            <button
              data-plus="${escapeHTML(
                item.name
              )}"
            >
              +
            </button>

          </div>

        </div>

      `
    ).join("");

}


function renderSheetLines() {

  const container =
    $("#sheetLines");

  if (!container) {
    return;
  }


  if (!state.cart.length) {

    container.innerHTML = `

      <div class="empty-order">

        <div class="empty-order-emoji">
          🍨
        </div>

        <h3>
          Nothing here yet.
        </h3>

        <p>
          Your dessert deserves a place here.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    state.cart.map(
      item => `

        <div
          class="order-line"
        >

          <div
            class="order-thumb"
          >
            ${item.emoji}
          </div>

          <div
            class="order-line-main"
          >

            <strong>
              ${escapeHTML(
                item.name
              )}
            </strong>

            <small>
              ${money(
                item.price
              )}
            </small>

          </div>

          <div class="quantity-controls">

            <button
              data-minus="${escapeHTML(
                item.name
              )}"
            >
              −
            </button>

            <span>
              ${item.quantity}
            </span>

            <button
              data-plus="${escapeHTML(
                item.name
              )}"
            >
              +
            </button>

          </div>

        </div>

      `
    ).join("");

}


function updateBag() {

  const count =
    cartCount();

  const total =
    cartTotal();


  $("#topBagCount").textContent =
    count;

  $("#topBagCount")
    ?.classList.toggle(
      "visible",
      count > 0
    );


  $("#miniCount").textContent =
    count;

  $("#miniCount")
    ?.classList.toggle(
      "visible",
      count > 0
    );


  const totalText =
    total.hasUnknown
      ? `${money(total.value)}+`
      : money(total.value);


  $("#sheetTotal").textContent =
    state.cart.length
      ? totalText
      : "—";

  $("#orderTotal").textContent =
    state.cart.length
      ? totalText
      : "—";


  $("#orderCount").textContent =
    `${count} ${
      count === 1
        ? "item"
        : "items"
    }`;


  renderSheetLines();

  renderOrderLines(
    $("#orderLines")
  );

  initIcons();

}


function openBag() {

  $("#bagSheet")
    ?.classList.add(
      "open"
    );

  $("#sheetBackdrop")
    ?.classList.add(
      "open"
    );

}


function closeBag() {

  $("#bagSheet")
    ?.classList.remove(
      "open"
    );

  $("#sheetBackdrop")
    ?.classList.remove(
      "open"
    );

}


function initBag() {

  $("#closeBag")
    ?.addEventListener(
      "click",
      closeBag
    );


  $("#sheetBackdrop")
    ?.addEventListener(
      "click",
      closeBag
    );


  $("[data-action='bag']")
    ?.addEventListener(
      "click",
      openBag
    );


  $("#orderEdit")
    ?.addEventListener(
      "click",
      openBag
    );


  $("#sheetCheckout")
    ?.addEventListener(
      "click",
      () => {

        closeBag();

        navigate("order");

      }
    );


  document.addEventListener(
    "click",
    event => {

      const plus =
        event.target.closest(
          "[data-plus]"
        );

      if (plus) {

        changeQuantity(
          plus.dataset.plus,
          1
        );

      }


      const minus =
        event.target.closest(
          "[data-minus]"
        );

      if (minus) {

        changeQuantity(
          minus.dataset.minus,
          -1
        );

      }

    }
  );

}


/* =========================================================
   ORDER
========================================================= */

function initOrder() {

  $$(".method-card").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          state.deliveryMode =
            button.dataset.mode;

          $$(".method-card")
            .forEach(
              item => {

                item.classList.toggle(
                  "active",
                  item === button
                );

              }
            );

          updateOrderMode();

        }
      );

    }
  );


  $("#checkout")
    ?.addEventListener(
      "click",
      checkout
    );

}


function updateOrderMode() {

  const delivery =
    state.deliveryMode ===
    "delivery";


  $("#addressWrap").hidden =
    !delivery;


  $("#customerModeTitle")
    .textContent =
    delivery
      ? "Delivery details"
      : "Pickup details";


  $("#customerModeText")
    .textContent =
    delivery
      ? "Tell us where to bring it."
      : "Tell us who is collecting.";


  const icon =
    $("#customerModeIcon");


  if (
    icon &&
    window.lucide
  ) {

    icon.setAttribute(
      "data-lucide",
      delivery
        ? "bike"
        : "map-pin"
    );

    lucide.createIcons();

  }

}


function renderOrder() {

  updateOrderMode();

  renderOrderLines(
    $("#orderLines")
  );

}


function checkout() {

  if (!state.cart.length) {

    showToast(
      "Basket is empty",
      "Add something from the menu first."
    );

    navigate("menu");

    return;

  }


  const name =
    $("#customerName")
      ?.value
      .trim();

  const phone =
    $("#customerPhone")
      ?.value
      .trim();

  const address =
    $("#customerAddress")
      ?.value
      .trim();


  if (!name || !phone) {

    showToast(
      "Almost there",
      "Add your name and phone number."
    );

    return;

  }


  if (
    state.deliveryMode ===
      "delivery" &&
    !address
  ) {

    showToast(
      "Address needed",
      "Add your delivery location."
    );

    return;

  }


  const orderLines =
    state.cart
      .map(
        item => {

          const linePrice =
            item.price === null
              ? "Price on request"
              : money(
                  item.price *
                  item.quantity
                );

          return `${
            item.quantity
          } × ${
            item.name
          } — ${
            linePrice
          }`;

        }
      )
      .join("\n");


  const total =
    cartTotal();


  const totalText =
    total.hasUnknown
      ? `${money(total.value)}+`
      : money(total.value);


  const method =
    state.deliveryMode ===
    "delivery"
      ? `
HOME DELIVERY
Address: ${address}
`
      : `
PICKUP
Choco Loco · Pipeline
`;


  const message = `
🍨 *CHOCO LOCO ORDER*

Name: ${name}
Phone: ${phone}

${method}

*ORDER*
${orderLines}

Estimated total: ${totalText}

Sent from the Choco Loco app.
  `.trim();


  const url =
    `https://wa.me/2204000060?text=${
      encodeURIComponent(
        message
      )
    }`;


  window.open(
    url,
    "_blank",
    "noopener"
  );

}


/* =========================================================
   SEARCH
========================================================= */

function initSearch() {

  $("#closeSearch")
    ?.addEventListener(
      "click",
      closeSearch
    );


  const input =
    $("#globalSearch");


  input?.addEventListener(
    "input",
    () => {

      state.globalQuery =
        input.value
          .trim()
          .toLowerCase();

      renderGlobalResults();

    }
  );


  $$("[data-search-term]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const query =
              button.dataset.searchTerm;

            input.value =
              query;

            state.globalQuery =
              query.toLowerCase();

            renderGlobalResults();

          }
        );

      }
    );

}


function openSearchAndFocus() {

  $("#searchOverlay")
    ?.classList.add(
      "open"
    );

  document.body.classList.add(
    "locked"
  );


  setTimeout(
    () => {

      $("#globalSearch")
        ?.focus();

    },
    400
  );

}


function closeSearch() {

  $("#searchOverlay")
    ?.classList.remove(
      "open"
    );

  document.body.classList.remove(
    "locked"
  );

}


function renderGlobalResults() {

  const container =
    $("#globalResults");

  if (!container) {
    return;
  }


  const query =
    state.globalQuery;


  if (!query) {

    container.innerHTML = "";

    return;

  }


  const products =
    $$(".product-card")
      .map(
        card => ({
          name:
            card.dataset.name,

          category:
            card.dataset.category,

          price:
            card.dataset.price === ""
              ? null
              : Number(
                  card.dataset.price
                ),

          description:
            card.dataset.description,

          emoji:
            card.dataset.emoji
        })
      )
      .filter(
        product => {

          const content =
            `
              ${product.name}
              ${product.category}
              ${product.description}
            `.toLowerCase();

          return content.includes(
            query
          );

        }
      );


  if (!products.length) {

    container.innerHTML = `

      <div class="search-result">

        <div>

          <strong>
            No sweet match.
          </strong>

          <small>
            Try ice cream, cake,
            coffee or shake.
          </small>

        </div>

      </div>
    `;

    return;

  }


  container.innerHTML =
    products.map(
      product => `

        <button
          class="search-result"
          data-result-name="${escapeHTML(
            product.name
          )}"
        >

          <div>

            <strong>
              ${escapeHTML(
                product.name
              )}
            </strong>

            <small>
              ${escapeHTML(
                product.category
              )}
              ·
              ${money(
                product.price
              )}
            </small>

          </div>

          <i
            data-lucide="arrow-up-right"
          ></i>

        </button>
      `
    ).join("");


  initIcons();


  $$(".search-result[data-result-name]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const name =
              button.dataset.resultName;


            const product =
              products.find(
                item =>
                  item.name ===
                  name
              );


            if (!product) {
              return;
            }


            addToCart(
              product
            );

            closeSearch();

          }
        );

      }
    );

}


/* =========================================================
   PROFILE
========================================================= */

function initProfile() {

  $("#shareBtn")
    ?.addEventListener(
      "click",
      async () => {

        const data = {
          title:
            "Choco Loco",

          text:
            "Let's go to Choco Loco for something sweet 🍨",

          url:
            window.location.href
        };


        if (
          navigator.share
        ) {

          try {

            await navigator.share(
              data
            );

            return;

          } catch {
            // cancelled
          }

        }


        try {

          await navigator.clipboard
            .writeText(
              window.location.href
            );

          showToast(
            "Link copied",
            "Send Choco Loco to someone sweet."
          );

        } catch {

          showToast(
            "Share Choco Loco",
            "Copy the page link from your browser."
          );

        }

      }
    );


  $("#reviewBtn")
    ?.addEventListener(
      "click",
      () => {

        window.open(
          "https://www.google.com/search?q=Choco+Loco+Gambia+reviews",
          "_blank",
          "noopener"
        );

      }
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  title,
  text
) {

  clearTimeout(
    state.toastTimer
  );


  $("#toastTitle").textContent =
    title;

  $("#toastText").textContent =
    text;


  $("#toast")
    ?.classList.add(
      "show"
    );


  state.toastTimer =
    setTimeout(
      () => {

        $("#toast")
          ?.classList.remove(
            "show"
          );

      },
      2700
    );

}


/* =========================================================
   THREE.JS
========================================================= */

/* =========================================================
   NEW CHOCO LOCO ICE CREAM HERO
   Replace the old initThreeHero() and createIceCreamScene()
========================================================= */

function initThreeHero() {

  const container = document.getElementById("iceCreamScene");

  if (!container) return;

  const waitForThree = () => {

    if (typeof THREE === "undefined") {
      setTimeout(waitForThree, 80);
      return;
    }

    createIceCreamScene(container);

  };

  waitForThree();
}


function createIceCreamScene(container) {

  /* =======================================================
     SCENE
  ======================================================= */

  const scene = new THREE.Scene();

  const width = container.clientWidth;
  const height = container.clientHeight;

  const camera = new THREE.PerspectiveCamera(
    32,
    width / height,
    0.1,
    100
  );

  camera.position.set(
    0,
    0.15,
    window.innerWidth < 800 ? 6.2 : 7.3
  );

  camera.lookAt(
    0,
    0.6,
    0
  );


  /* =======================================================
     RENDERER
  ======================================================= */

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.8)
  );

  renderer.setSize(
    width,
    height,
    false
  );

  renderer.outputEncoding =
    THREE.sRGBEncoding;

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  container.innerHTML = "";

  container.appendChild(
    renderer.domElement
  );


  /* =======================================================
     LIGHTING
  ======================================================= */

  const ambient = new THREE.HemisphereLight(
    0xffead8,
    0x24100a,
    2.4
  );

  scene.add(ambient);


  const keyLight = new THREE.DirectionalLight(
    0xfff0df,
    4.5
  );

  keyLight.position.set(
    4,
    7,
    5
  );

  keyLight.castShadow = true;

  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;

  scene.add(keyLight);


  const warmLight = new THREE.PointLight(
    0xff8a48,
    5,
    14
  );

  warmLight.position.set(
    -3.5,
    1,
    3
  );

  scene.add(warmLight);


  const softLight = new THREE.PointLight(
    0xffd1a0,
    3,
    12
  );

  softLight.position.set(
    3,
    1.5,
    -3
  );

  scene.add(softLight);


  /* =======================================================
     MASTER GROUP
  ======================================================= */

  const iceCream = new THREE.Group();

  iceCream.position.y = -0.15;

  scene.add(
    iceCream
  );


  /* =======================================================
     MATERIAL HELPERS
  ======================================================= */

  function createMaterial(
    color,
    roughness = 0.4,
    clearcoat = 0.25
  ) {

    return new THREE.MeshPhysicalMaterial({
      color,
      roughness,
      metalness: 0,
      clearcoat,
      clearcoatRoughness: 0.28
    });

  }


  /* =======================================================
     WAFFLE CONE
  ======================================================= */

  const coneGroup =
    new THREE.Group();

  coneGroup.position.y = -1.28;

  iceCream.add(
    coneGroup
  );


  const coneGeometry =
    new THREE.ConeGeometry(
      1.02,
      2.42,
      64,
      10,
      false
    );


  const coneMaterial =
    createMaterial(
      0xd68b45,
      0.72,
      0.12
    );


  const cone =
    new THREE.Mesh(
      coneGeometry,
      coneMaterial
    );

  cone.castShadow = true;
  cone.receiveShadow = true;

  coneGroup.add(
    cone
  );


  /* =======================================================
     WAFFLE DIAMOND TEXTURE
  ======================================================= */

  const waffleMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x7e3e1b,
      transparent: true,
      opacity: 0.38
    });


  /*
     Diagonal bands in both directions.
  */

  for (
    let direction = 0;
    direction < 2;
    direction++
  ) {

    for (
      let i = -7;
      i <= 7;
      i++
    ) {

      const points = [];

      for (
        let step = 0;
        step <= 40;
        step++
      ) {

        const t =
          step / 40;

        const y =
          -1.18 +
          t * 2.3;

        const radius =
          Math.max(
            0.035,
            0.97 * (1 - t)
          );

        let x =
          (i / 7) *
          radius;

        let z =
          Math.sin(
            t * Math.PI
          ) * 0.01;

        /*
          Tilt the bands.
        */

        x +=
          Math.sin(
            t * Math.PI * 2
          ) *
          0.05;

        if (direction === 0) {

          z +=
            (t - 0.5) *
            0.85;

        } else {

          z -=
            (t - 0.5) *
            0.85;

        }

        points.push(
          new THREE.Vector3(
            x,
            y,
            z
          )
        );

      }


      const geometry =
        new THREE.BufferGeometry()
          .setFromPoints(
            points
          );


      const line =
        new THREE.Line(
          geometry,
          waffleMaterial
        );


      line.rotation.y =
        direction *
        Math.PI /
        2;

      coneGroup.add(
        line
      );

    }

  }


  /* =======================================================
     INNER CONE RIM
  ======================================================= */

  const rimGeometry =
    new THREE.TorusGeometry(
      0.92,
      0.055,
      16,
      64
    );


  const rim =
    new THREE.Mesh(
      rimGeometry,
      createMaterial(
        0xc77839,
        0.5,
        0.16
      )
    );


  rim.position.y =
    0.02;

  coneGroup.add(
    rim
  );


  /* =======================================================
     SCOOP CREATOR
  ======================================================= */

  function createScoop({
    color,
    position,
    scale = 1,
    rotation = 0,
    topping = null
  }) {

    const scoopGroup =
      new THREE.Group();

    scoopGroup.position.copy(
      position
    );

    scoopGroup.rotation.z =
      rotation;

    scoopGroup.scale.setScalar(
      scale
    );


    /*
       Main ice cream.

       A slightly stretched sphere makes it
       look like a real scoop instead of a ball.
    */

    const scoopGeometry =
      new THREE.SphereGeometry(
        0.83,
        64,
        48
      );


    const scoopMaterial =
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.43,
        metalness: 0,
        clearcoat: 0.16,
        clearcoatRoughness: 0.4
      });


    const scoop =
      new THREE.Mesh(
        scoopGeometry,
        scoopMaterial
      );


    scoop.scale.set(
      1,
      0.92,
      0.96
    );


    scoop.castShadow = true;
    scoop.receiveShadow = true;


    scoopGroup.add(
      scoop
    );


    /* =====================================================
       SCOOP SWIRL
    ================================================== */

    const swirlMaterial =
      new THREE.MeshPhysicalMaterial({
        color:
          color === 0x6a2c16
            ? 0x3b130b
            : 0xffd5ab,

        roughness: 0.32,

        clearcoat: 0.2,

        transparent: true,

        opacity: 0.52
      });


    for (
      let i = 0;
      i < 3;
      i++
    ) {

      const swirl =
        new THREE.TorusGeometry(
          0.52 -
          i * 0.11,
          0.018,
          8,
          64
        );


      const swirlMesh =
        new THREE.Mesh(
          swirl,
          swirlMaterial
        );


      swirlMesh.rotation.x =
        Math.PI / 2;


      swirlMesh.rotation.z =
        i * 0.4;


      swirlMesh.position.y =
        0.36 -
        i * 0.10;


      scoopGroup.add(
        swirlMesh
      );

    }


    /* =====================================================
       TOPPINGS
    ================================================== */

    if (topping) {

      const toppingMaterial =
        new THREE.MeshStandardMaterial({
          color: topping,
          roughness: 0.32
        });


      for (
        let i = 0;
        i < 24;
        i++
      ) {

        const angle =
          Math.random() *
          Math.PI *
          2;

        const radius =
          0.2 +
          Math.random() *
          0.58;


        const chipGeometry =
          new THREE.CylinderGeometry(
            0.025,
            0.025,
            0.12,
            6
          );


        const chip =
          new THREE.Mesh(
            chipGeometry,
            toppingMaterial
          );


        chip.position.set(
          Math.cos(angle) *
          radius,

          0.45 +
          Math.random() *
          0.25,

          Math.sin(angle) *
          radius
        );


        chip.rotation.set(
          Math.random(),
          Math.random(),
          Math.random()
        );


        scoopGroup.add(
          chip
        );

      }

    }


    iceCream.add(
      scoopGroup
    );


    return scoopGroup;

  }


  /* =======================================================
     BOTTOM LEFT SCOOP
  ======================================================= */

  createScoop({

    color: 0xf7e5cc,

    position:
      new THREE.Vector3(
        -0.42,
        0.48,
        0.16
      ),

    scale: 1.02,

    rotation: -0.04,

    topping: 0x7b3519

  });


  /* =======================================================
     BOTTOM RIGHT CHOCOLATE SCOOP
  ======================================================= */

  createScoop({

    color: 0x6b2e16,

    position:
      new THREE.Vector3(
        0.43,
        0.48,
        0.10
      ),

    scale: 1.04,

    rotation: 0.045,

    topping: 0xf0c190

  });


  /* =======================================================
     TOP VANILLA / CARAMEL SCOOP
  ======================================================= */

  createScoop({

    color: 0xe7a060,

    position:
      new THREE.Vector3(
        0,
        1.18,
        -0.02
      ),

    scale: 0.88,

    rotation: -0.03,

    topping: 0x6d2c15

  });


  /* =======================================================
     CHOCOLATE SAUCE DRIPS
  ======================================================= */

  const chocolateMaterial =
    new THREE.MeshPhysicalMaterial({
      color: 0x42150b,
      roughness: 0.21,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22
    });


  const dripPositions = [
    [-0.67, 0.89, 0.38, 0.18],
    [-0.44, 0.58, 0.67, 0.27],
    [-0.10, 0.43, 0.79, 0.16],
    [0.25, 0.55, 0.70, 0.22],
    [0.58, 0.78, 0.39, 0.14],
    [0.72, 0.96, 0.15, 0.19]
  ];


  dripPositions.forEach(
    ([x, y, z, height]) => {

      const geometry =
        new THREE.SphereGeometry(
          0.11,
          24,
          20
        );


      const drip =
        new THREE.Mesh(
          geometry,
          chocolateMaterial
        );


      drip.position.set(
        x,
        y,
        z
      );


      drip.scale.set(
        1,
        height / 0.11,
        1
      );


      drip.castShadow = true;


      iceCream.add(
        drip
      );

    }
  );


  /* =======================================================
     WHIPPED CREAM
  ======================================================= */

  const creamMaterial =
    new THREE.MeshPhysicalMaterial({
      color: 0xfff2df,
      roughness: 0.48,
      clearcoat: 0.12
    });


  const cream =
    new THREE.Group();


  cream.position.y =
    1.85;


  iceCream.add(
    cream
  );


  /*
     Several overlapping cream blobs.
  */

  const creamPositions = [
    [0, 0.0, 0, 0.27],
    [-0.22, -0.05, 0.04, 0.21],
    [0.20, -0.02, 0.03, 0.22],
    [-0.10, 0.18, 0, 0.20],
    [0.12, 0.20, -0.01, 0.18]
  ];


  creamPositions.forEach(
    ([x, y, z, size]) => {

      const geometry =
        new THREE.SphereGeometry(
          size,
          28,
          24
        );


      const mesh =
        new THREE.Mesh(
          geometry,
          creamMaterial
        );


      mesh.position.set(
        x,
        y,
        z
      );


      mesh.scale.y =
        0.85;


      cream.add(
        mesh
      );

    }
  );


  /* =======================================================
     CHOCOLATE SYRUP ON TOP
  ======================================================= */

  const syrupMaterial =
    new THREE.MeshPhysicalMaterial({
      color: 0x421609,
      roughness: .17,
      clearcoat: .62
    });


  const syrup =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .24,
        24,
        18
      ),
      syrupMaterial
    );


  syrup.position.set(
    .05,
    2.12,
    .03
  );


  syrup.scale.set(
    1.25,
    .45,
    1.05
  );


  cream.add(
    syrup
  );


  /* =======================================================
     CHERRY
  ======================================================= */

  const cherryMaterial =
    new THREE.MeshPhysicalMaterial({
      color: 0xbe2d35,
      roughness: .24,
      clearcoat: .75,
      clearcoatRoughness: .16
    });


  const cherry =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .17,
        32,
        24
      ),
      cherryMaterial
    );


  cherry.position.set(
    .05,
    2.34,
    .02
  );


  cherry.castShadow = true;

  iceCream.add(
    cherry
  );


  /* =======================================================
     CHERRY STEM
  ======================================================= */

  const stem =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        .018,
        .015,
        .45,
        10
      ),
      new THREE.MeshStandardMaterial({
        color: 0x4d2616,
        roughness: .5
      })
    );


  stem.position.set(
    .08,
    2.60,
    .02
  );


  stem.rotation.z =
    -.22;


  iceCream.add(
    stem
  );


  /* =======================================================
     MINI CHOCOLATE FLAKES
  ======================================================= */

  const flakeMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x4c1a0d,
      roughness: .36
    });


  for (
    let i = 0;
    i < 18;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI *
      2;


    const radius =
      .18 +
      Math.random() *
      .66;


    const geometry =
      new THREE.BoxGeometry(
        .055,
        .025,
        .11
      );


    const flake =
      new THREE.Mesh(
        geometry,
        flakeMaterial
      );


    flake.position.set(
      Math.cos(angle) *
      radius,

      1.77 +
      Math.random() *
      .36,

      Math.sin(angle) *
      radius
    );


    flake.rotation.set(
      Math.random() * 2,
      Math.random() * 2,
      Math.random() * 2
    );


    iceCream.add(
      flake
    );

  }


  /* =======================================================
     ORBIT RINGS
  ======================================================= */

  const ringMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xe9b57a,
      transparent: true,
      opacity: .29
    });


  const ringGeometry =
    new THREE.TorusGeometry(
      2.25,
      .012,
      10,
      160
    );


  const ring =
    new THREE.Mesh(
      ringGeometry,
      ringMaterial
    );


  ring.rotation.x =
    Math.PI *
    .43;

  ring.rotation.z =
    .12;

  ring.position.y =
    .30;


  iceCream.add(
    ring
  );


  const ringTwo =
    ring.clone();


  ringTwo.scale.set(
    .76,
    .76,
    .76
  );


  ringTwo.rotation.x =
    Math.PI *
    .61;

  ringTwo.rotation.z =
    -.18;


  iceCream.add(
    ringTwo
  );


  /* =======================================================
     FLOOR SHADOW
  ======================================================= */

  const shadowGeometry =
    new THREE.CircleGeometry(
      1.5,
      64
    );


  const shadowMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: .32
    });


  const shadow =
    new THREE.Mesh(
      shadowGeometry,
      shadowMaterial
    );


  shadow.rotation.x =
    -Math.PI / 2;

  shadow.position.y =
    -2.48;

  shadow.scale.set(
    1,
    .40,
    1
  );


  iceCream.add(
    shadow
  );


  /* =======================================================
     MOUSE / TOUCH
  ======================================================= */

  let targetMouseX = 0;
  let targetMouseY = 0;

  let currentMouseX = 0;
  let currentMouseY = 0;


  window.addEventListener(
    "pointermove",
    event => {

      targetMouseX =
        (
          event.clientX /
          window.innerWidth
        ) *
        2 -
        1;


      targetMouseY =
        (
          event.clientY /
          window.innerHeight
        ) *
        2 -
        1;

    },
    {
      passive: true
    }
  );


  /* =======================================================
     SCROLL
  ======================================================= */

  let targetScrollRotation = 0;
  let currentScrollRotation = 0;


  window.addEventListener(
    "scroll",
    () => {

      targetScrollRotation =
        window.scrollY *
        0.0023;

    },
    {
      passive: true
    }
  );


  /* =======================================================
     RENDER LOOP
  ======================================================= */

  const clock =
    new THREE.Clock();


  function animate() {

    requestAnimationFrame(
      animate
    );


    const elapsed =
      clock.getElapsedTime();


    /* smooth mouse */

    currentMouseX +=
      (
        targetMouseX -
        currentMouseX
      ) *
      .035;


    currentMouseY +=
      (
        targetMouseY -
        currentMouseY
      ) *
      .035;


    /* smooth scroll */

    currentScrollRotation +=
      (
        targetScrollRotation -
        currentScrollRotation
      ) *
      .045;


    /* =====================================================
       ICE CREAM MOTION
    ================================================== */

    iceCream.rotation.y =
      (
        elapsed *
        .11
      )
      +
      currentScrollRotation
      +
      (
        currentMouseX *
        .13
      )
      -
      .20;


    iceCream.rotation.x =
      currentMouseY *
      .045;


    iceCream.position.y =
      -0.15 +
      Math.sin(
        elapsed *
        1.25
      ) *
      .055;


    /* slight breathing */

    const breathe =
      1 +
      Math.sin(
        elapsed *
        1.15
      ) *
      .008;


    iceCream.scale.setScalar(
      breathe
    );


    /* orbit rings */

    ring.rotation.z +=
      .0027;

    ringTwo.rotation.z -=
      .0034;


    /* cherry movement */

    cherry.position.y =
      2.34 +
      Math.sin(
        elapsed *
        1.7
      ) *
      .012;


    /* =====================================================
       ROTATING TEXT
    ================================================== */

    const orbitOne =
      document.getElementById(
        "orbitTextOne"
      );

    const orbitTwo =
      document.getElementById(
        "orbitTextTwo"
      );


    const degrees =
      currentScrollRotation *
      57.2958;


    if (orbitOne) {

      orbitOne.style.transform =
        `
          translate(-50%, -50%)
          rotate(${degrees}deg)
        `;

    }


    if (orbitTwo) {

      orbitTwo.style.transform =
        `
          translate(-50%, -50%)
          rotate(${-degrees * .67}deg)
        `;

    }


    /* =====================================================
       CAMERA SUBTLE FLOAT
    ================================================== */

    camera.position.y =
      .15 +
      Math.sin(
        elapsed *
        .65
      ) *
      .035;


    renderer.render(
      scene,
      camera
    );

  }


  animate();


  /* =======================================================
     RESIZE
  ======================================================= */

  function resize() {

    const w =
      container.clientWidth;

    const h =
      container.clientHeight;


    camera.aspect =
      w / h;


    camera.updateProjectionMatrix();


    renderer.setSize(
      w,
      h,
      false
    );


    if (
      window.innerWidth < 420
    ) {

      camera.position.z =
        5.95;

    } else if (
      window.innerWidth < 800
    ) {

      camera.position.z =
        6.25;

    } else {

      camera.position.z =
        7.3;

    }

  }


  window.addEventListener(
    "resize",
    resize
  );


  resize();

}


/* =========================================================
   NEW CHOCO LOCO ICE CREAM HERO
========================================================= */

function initThreeHero() {
  const container = document.getElementById("iceCreamScene");
  if (!container) return;
  const waitForThree = () => {
    if (typeof THREE === "undefined") {
      setTimeout(waitForThree, 80);
      return;
    }
    createIceCreamScene(container);
  };
  waitForThree();
}

function createIceCreamScene(container) {
  const scene = new THREE.Scene();
  const width = container.clientWidth;
  const height = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(0, 0.15, window.innerWidth < 800 ? 6.2 : 7.3);
  camera.lookAt(0, 0.6, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(width, height, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffead8, 0x24100a, 2.4));
  const keyLight = new THREE.DirectionalLight(0xfff0df, 4.5);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  scene.add(keyLight);
  const warmLight = new THREE.PointLight(0xff8a48, 5, 14);
  warmLight.position.set(-3.5, 1, 3);
  scene.add(warmLight);
  const softLight = new THREE.PointLight(0xffd1a0, 3, 12);
  softLight.position.set(3, 1.5, -3);
  scene.add(softLight);

  const iceCream = new THREE.Group();
  iceCream.position.y = -0.15;
  scene.add(iceCream);
  const material = (color, roughness = 0.4, clearcoat = 0.25) => new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, clearcoat, clearcoatRoughness: 0.28 });

  const coneGroup = new THREE.Group();
  coneGroup.position.y = -1.28;
  coneGroup.rotation.z = Math.PI;
  iceCream.add(coneGroup);
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1.02, 2.42, 64, 10, false),
    new THREE.MeshStandardMaterial({
      color: 0x4d1f0d,
      roughness: 0.9,
      metalness: 0
    })
  );
  cone.castShadow = true;
  cone.receiveShadow = true;
  coneGroup.add(cone);

  const waffleMaterial = new THREE.LineBasicMaterial({ color: 0x2a1008, transparent: true, opacity: 0.2 });
  for (let direction = 0; direction < 2; direction++) {
    for (let i = -7; i <= 7; i++) {
      const points = [];
      for (let step = 0; step <= 40; step++) {
        const t = step / 40;
        const y = -1.18 + t * 2.3;
        const radius = Math.max(0.035, 0.97 * (1 - t));
        const x = (i / 7) * radius + Math.sin(t * Math.PI * 2) * 0.05;
        let z = Math.sin(t * Math.PI) * 0.01;
        z += direction === 0 ? (t - 0.5) * 0.85 : -(t - 0.5) * 0.85;
        points.push(new THREE.Vector3(x, y, z));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), waffleMaterial);
      line.rotation.y = direction * Math.PI / 2;
      coneGroup.add(line);
    }
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.055, 16, 64), material(0xc77839, 0.5, 0.16));
  rim.position.y = 0.02;
  coneGroup.add(rim);

  function createScoop({ color, position, scale = 1, rotation = 0, topping = null }) {
    const scoopGroup = new THREE.Group();
    scoopGroup.position.copy(position);
    scoopGroup.rotation.z = rotation;
    scoopGroup.scale.setScalar(scale);
    const scoop = new THREE.Mesh(new THREE.SphereGeometry(0.83, 64, 48), new THREE.MeshPhysicalMaterial({ color, roughness: 0.43, metalness: 0, clearcoat: 0.16, clearcoatRoughness: 0.4 }));
    scoop.scale.set(1, 0.92, 0.96);
    scoop.castShadow = true;
    scoop.receiveShadow = true;
    scoopGroup.add(scoop);
    const swirlMaterial = new THREE.MeshPhysicalMaterial({ color: color === 0x6a2c16 ? 0x3b130b : 0xffd5ab, roughness: 0.32, clearcoat: 0.2, transparent: true, opacity: 0.52 });
    for (let i = 0; i < 3; i++) {
      const swirl = new THREE.Mesh(new THREE.TorusGeometry(0.52 - i * 0.11, 0.018, 8, 64), swirlMaterial);
      swirl.rotation.x = Math.PI / 2;
      swirl.rotation.z = i * 0.4;
      swirl.position.y = 0.36 - i * 0.10;
      scoopGroup.add(swirl);
    }
    if (topping) {
      const toppingMaterial = new THREE.MeshStandardMaterial({ color: topping, roughness: 0.32 });
      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.2 + Math.random() * 0.58;
        const chip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 6), toppingMaterial);
        chip.position.set(Math.cos(angle) * radius, 0.45 + Math.random() * 0.25, Math.sin(angle) * radius);
        chip.rotation.set(Math.random(), Math.random(), Math.random());
        scoopGroup.add(chip);
      }
    }
    iceCream.add(scoopGroup);
    return scoopGroup;
  }

  createScoop({ color: 0xf7e5cc, position: new THREE.Vector3(-0.42, 0.48, 0.16), scale: 1.02, rotation: -0.04, topping: 0x7b3519 });
  createScoop({ color: 0x6b2e16, position: new THREE.Vector3(0.43, 0.48, 0.10), scale: 1.04, rotation: 0.045, topping: 0xf0c190 });
  createScoop({ color: 0xe7a060, position: new THREE.Vector3(0, 1.18, -0.02), scale: 0.88, rotation: -0.03, topping: 0x6d2c15 });

  const chocolateMaterial = material(0x42150b, 0.21, 0.55);
  [[-0.67, 0.89, 0.38, 0.18], [-0.44, 0.58, 0.67, 0.27], [-0.10, 0.43, 0.79, 0.16], [0.25, 0.55, 0.70, 0.22], [0.58, 0.78, 0.39, 0.14], [0.72, 0.96, 0.15, 0.19]].forEach(([x, y, z, height]) => {
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 20), chocolateMaterial);
    drip.position.set(x, y, z);
    drip.scale.set(1, height / 0.11, 1);
    drip.castShadow = true;
    iceCream.add(drip);
  });

  const cream = new THREE.Group();
  cream.position.y = 1.85;
  iceCream.add(cream);
  const creamMaterial = material(0xfff2df, 0.48, 0.12);
  [[0, 0, 0, 0.27], [-0.22, -0.05, 0.04, 0.21], [0.20, -0.02, 0.03, 0.22], [-0.10, 0.18, 0, 0.20], [0.12, 0.20, -0.01, 0.18]].forEach(([x, y, z, size]) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 28, 24), creamMaterial);
    mesh.position.set(x, y, z);
    mesh.scale.y = 0.85;
    cream.add(mesh);
  });
  const syrup = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), material(0x421609, 0.17, 0.62));
  syrup.position.set(0.05, 2.12, 0.03);
  syrup.scale.set(1.25, 0.45, 1.05);
  cream.add(syrup);
  const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 24), material(0xbe2d35, 0.24, 0.75));
  cherry.position.set(0.05, 2.34, 0.02);
  cherry.castShadow = true;
  iceCream.add(cherry);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.015, 0.45, 10), new THREE.MeshStandardMaterial({ color: 0x4d2616, roughness: 0.5 }));
  stem.position.set(0.08, 2.60, 0.02);
  stem.rotation.z = -0.22;
  iceCream.add(stem);

  const flakeMaterial = new THREE.MeshStandardMaterial({ color: 0x4c1a0d, roughness: 0.36 });
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.18 + Math.random() * 0.66;
    const flake = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.025, 0.11), flakeMaterial);
    flake.position.set(Math.cos(angle) * radius, 1.77 + Math.random() * 0.36, Math.sin(angle) * radius);
    flake.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    iceCream.add(flake);
  }
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xe9b57a, transparent: true, opacity: 0.29 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.012, 10, 160), ringMaterial);
  ring.rotation.x = Math.PI * 0.43;
  ring.rotation.z = 0.12;
  ring.position.y = 0.30;
  iceCream.add(ring);
  const ringTwo = ring.clone();
  ringTwo.scale.set(0.76, 0.76, 0.76);
  ringTwo.rotation.x = Math.PI * 0.61;
  ringTwo.rotation.z = -0.18;
  iceCream.add(ringTwo);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.5, 64), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.48;
  shadow.scale.set(1, 0.40, 1);
  iceCream.add(shadow);

  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;
  window.addEventListener("pointermove", event => {
    targetMouseX = event.clientX / window.innerWidth * 2 - 1;
    targetMouseY = event.clientY / window.innerHeight * 2 - 1;
  }, { passive: true });
  let targetScrollRotation = 0;
  let currentScrollRotation = 0;
  window.addEventListener("scroll", () => { targetScrollRotation = window.scrollY * 0.0023; }, { passive: true });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    currentMouseX += (targetMouseX - currentMouseX) * 0.035;
    currentMouseY += (targetMouseY - currentMouseY) * 0.035;
    currentScrollRotation += (targetScrollRotation - currentScrollRotation) * 0.045;
    iceCream.rotation.y = elapsed * 0.11 + currentScrollRotation + currentMouseX * 0.13 - 0.20;
    iceCream.rotation.x = currentMouseY * 0.045;
    iceCream.position.y = -0.15 + Math.sin(elapsed * 1.25) * 0.055;
    iceCream.scale.setScalar(1 + Math.sin(elapsed * 1.15) * 0.008);
    ring.rotation.z += 0.0027;
    ringTwo.rotation.z -= 0.0034;
    cherry.position.y = 2.34 + Math.sin(elapsed * 1.7) * 0.012;
    const degrees = currentScrollRotation * 57.2958;
    const orbitOne = document.getElementById("orbitTextOne");
    const orbitTwo = document.getElementById("orbitTextTwo");
    if (orbitOne) orbitOne.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
    if (orbitTwo) orbitTwo.style.transform = `translate(-50%, -50%) rotate(${-degrees * 0.67}deg)`;
    camera.position.y = 0.15 + Math.sin(elapsed * 0.65) * 0.035;
    renderer.render(scene, camera);
  }
  animate();

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    camera.position.z = window.innerWidth < 420 ? 5.95 : window.innerWidth < 800 ? 6.25 : 7.3;
  }
  window.addEventListener("resize", resize);
  resize();
}


/* =========================================================
   SWIPE NAVIGATION
========================================================= */

let swipeStartX = 0;

let swipeStartY = 0;


document.addEventListener(
  "touchstart",
  event => {

    const touch =
      event.changedTouches[0];

    swipeStartX =
      touch.clientX;

    swipeStartY =
      touch.clientY;

  },
  {
    passive: true
  }
);


document.addEventListener(
  "touchend",
  event => {

    if (
      ![
        "home",
        "menu",
        "order",
        "profile"
      ].includes(
        state.screen
      )
    ) {
      return;
    }


    const touch =
      event.changedTouches[0];


    const dx =
      touch.clientX -
      swipeStartX;


    const dy =
      touch.clientY -
      swipeStartY;


    if (
      Math.abs(dx) < 90 ||
      Math.abs(dx) <
        Math.abs(dy) *
        1.35
    ) {

      return;

    }


    const screens = [
      "home",
      "menu",
      "order",
      "profile"
    ];


    const currentIndex =
      screens.indexOf(
        state.screen
      );


    if (
      dx < 0 &&
      currentIndex <
        screens.length - 1
    ) {

      navigate(
        screens[
          currentIndex + 1
        ]
      );

    }


    if (
      dx > 0 &&
      currentIndex > 0
    ) {

      navigate(
        screens[
          currentIndex - 1
        ]
      );

    }

  },
  {
    passive: true
  }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "/" &&
      ![
        "INPUT",
        "TEXTAREA"
      ].includes(
        document.activeElement?.tagName
      )
    ) {

      event.preventDefault();

      openSearchAndFocus();

    }


    if (
      event.key === "Escape"
    ) {

      closeSearch();

      closeBag();

    }

  }
);


/* =========================================================
   OPTIONAL PHOTO PARALLAX
========================================================= */

window.addEventListener(
  "scroll",
  () => {

    const images =
      $$(".photo-feature-image img, .visit-block img");


    images.forEach(
      image => {

        const rect =
          image
            .closest(
              ".photo-feature-image, .visit-block"
            )
            ?.getBoundingClientRect();


        if (!rect) {
          return;
        }


        const center =
          window.innerHeight /
          2;


        const offset =
          (
            rect.top +
            rect.height / 2 -
            center
          ) *
          .035;


        image.style.transform =
          `scale(1.04) translateY(${offset}px)`;

      }
    );

  },
  {
    passive: true
  }
);


/* =========================================================
   HOME PHOTO FEATURE OBSERVER
========================================================= */

const photoObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(
        entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              "is-visible"
            );

          }

        }
      );

    },
    {
      threshold: .15
    }
  );


setTimeout(
  () => {

    $$(".photo-feature")
      .forEach(
        element =>
          photoObserver.observe(
            element
          )
      );

  },
  500
);


/* =========================================================
   RE-ROUTE DYNAMIC BROWSE BUTTONS
========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-go]"
      );

    if (!button) {
      return;
    }


    const target =
      button.dataset.go;


    if (
      [
        "home",
        "menu",
        "order",
        "profile"
      ].includes(target)
    ) {

      /*
        Navigation is handled by the
        main initializer too; this
        listener intentionally stays
        harmless.
      */

    }

  }
);


/* =========================================================
   UPDATE NAV POSITION ON RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    const map = {
      home: 0,
      menu: 1,
      order: 2,
      profile: 3
    };


    setNavIndicator(
      map[
        state.screen
      ] ?? 0
    );

  }
);


/* =========================================================
   ORDER RENDER AFTER NAV
========================================================= */

const originalNavigate =
  navigate;


/*
  Keep order page alive after
  navigating into it.
*/

setInterval(
  () => {

    if (
      state.screen ===
      "order"
    ) {

      renderOrder();

    }

  },
  900
);