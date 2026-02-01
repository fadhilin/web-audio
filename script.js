// Global variables (untuk menampung)
let cart = [];
let wishlist = [];
let allProductsData = [];
let currentFilters = {
  search: "",
  categories: [],
  price: "all",
  sort: "default",
};

// Load data saat halaman dimuat
function getData() {
  // Load wishlist dan cart DULU sebelum display products
  loadWishlistFromStorage();
  loadCartFromStorage();

  fetch("./assets/data.json")
    .then((response) => response.json())
    .then((items) => {
      allProductsData = items;
      displayProducts(items);
    })
    .catch((error) => {
      console.error("Error loading products:", error);
    });
}

// Tampilkan produk card
function displayProducts(items) {
  const cards = [];
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  if (items.length === 0) {
    productList.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: white; background: rgba(0,0,0,0.7); margin: 2rem; border-radius: 10px;">
        <i class="fa fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h2>Tidak ada produk ditemukan</h2>
        <p>Coba ubah filter atau kata kunci pencarian</p>
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    const href = `detail.html?id=${encodeURIComponent(item.id)}`;
    // Cek dari array wishlist global apakah ada atau tidak
    const isInWishlist = wishlist.find((w) => w.id === item.id);

    card.className = "product";
    card.style.backgroundImage = `url(${item.image})`;
    card.innerHTML = ` 
      <div class="card-text" data-href="${href}">
        <button class="wishlist-heart-btn ${isInWishlist ? "active" : ""}" 
                data-id="${item.id}" 
                data-title="${item.title}" 
                data-price="${item.price}" 
                data-image="${item.image}"
                title="${isInWishlist ? "Hapus dari wishlist" : "Tambah ke wishlist"}">
          <i class="fa fa-heart${isInWishlist ? "" : "-o"}"></i>
        </button>

        <h1 class="title">${item.title}</h1>
        <p class="subtitle">${item.subtitle}</p>

        <div class="card-stats">
          <div class="stats">
            <span class="label">Warna</span>
            <span class="value">${item.color}</span>
          </div>
          <div class="stats">
            <span class="label">Baterai</span>
            <span class="value">${item.battery}</span>
          </div>
          <div class="stats">
            <span class="label">Bobot</span>
            <span class="value">${item.weight}</span>
          </div>
          <div class="stats">
            <span class="label">Latency</span>
            <span class="value">${item.latency}</span>
          </div>
          <div class="stats">
            <span class="label">Price</span>
            <span class="value">${item.price}</span>
          </div>
        </div>
        
        <button class="add-to-cart-btn" 
                data-id="${item.id}" 
                data-title="${item.title}" 
                data-price="${item.price}" 
                data-image="${item.image}">
          <i class="fa fa-shopping-cart"></i> Tambah ke Keranjang
        </button>
      </div>
    `;

    productList.appendChild(card);
    cards.push(card);
  });

  setupCardEvents();

  function reveal() {
    for (const card of cards) {
      const { top, bottom } = card.getBoundingClientRect();
      if (
        top < window.innerHeight * 0.85 &&
        bottom > window.innerHeight * 0.15
      ) {
        card.classList.add("show");
      }
    }
  }

  reveal();
  window.addEventListener("scroll", reveal, { passive: true });
  window.addEventListener("resize", reveal);
}

// Setup event listeners (klik button)
function setupCardEvents() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const productData = {
        id: this.getAttribute("data-id"),
        title: this.getAttribute("data-title"),
        price: this.getAttribute("data-price"),
        image: this.getAttribute("data-image"),
      };
      addToCart(productData, this);
    });
  });

  const wishlistButtons = document.querySelectorAll(".wishlist-heart-btn");
  wishlistButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const productData = {
        id: this.getAttribute("data-id"),
        title: this.getAttribute("data-title"),
        price: this.getAttribute("data-price"),
        image: this.getAttribute("data-image"),
      };
      toggleWishlistItem(productData, this);
    });
  });

  const cardTexts = document.querySelectorAll(".card-text");
  cardTexts.forEach((cardText) => {
    cardText.addEventListener("click", function (event) {
      if (
        event.target.closest(".add-to-cart-btn") ||
        event.target.closest(".wishlist-heart-btn")
      ) {
        return;
      }
      const href = this.getAttribute("data-href");
      window.location.href = href;
    });
  });
}

// Search Products
function searchProducts() {
  const searchInput = document.getElementById("searchInput");
  currentFilters.search = searchInput.value.toLowerCase().trim();
  applyFilters();
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchProducts();
      }, 300);
    });

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchProducts();
      }
    });
  }
});

function toggleFilter(event) {
  event.stopPropagation();
  const filterDropdown = document.getElementById("filterDropdown");
  const cartDropdown = document.getElementById("cartDropdown");
  const wishlistDropdown = document.getElementById("wishlistDropdown");

  // Close cart and wishlist if open
  if (cartDropdown.classList.contains("active")) {
    cartDropdown.classList.remove("active");
  }
  if (wishlistDropdown.classList.contains("active")) {
    wishlistDropdown.classList.remove("active");
  }

  filterDropdown.classList.toggle("active");
}

function applyFilters() {
  let filteredProducts = [...allProductsData];

  if (currentFilters.search) {
    filteredProducts = filteredProducts.filter(
      (item) =>
        item.title.toLowerCase().includes(currentFilters.search) ||
        item.subtitle.toLowerCase().includes(currentFilters.search) ||
        item.badge.toLowerCase().includes(currentFilters.search) ||
        item.color.toLowerCase().includes(currentFilters.search),
    );
  }

  const categoryCheckboxes = document.querySelectorAll(
    '.filter-section input[type="checkbox"]:checked',
  );
  currentFilters.categories = Array.from(categoryCheckboxes).map(
    (cb) => cb.value,
  );

  if (currentFilters.categories.length > 0) {
    filteredProducts = filteredProducts.filter((item) => {
      const itemCategory =
        item.badge.toLowerCase().includes("earbud") ||
        item.title.toLowerCase().includes("earbud") ||
        item.weight.includes("per bud")
          ? "earbuds"
          : "headphone";
      return currentFilters.categories.includes(itemCategory);
    });
  }

  const priceFilter = document.querySelector('input[name="price"]:checked');
  currentFilters.price = priceFilter ? priceFilter.value : "all";

  if (currentFilters.price !== "all") {
    filteredProducts = filteredProducts.filter((item) => {
      const price = parseInt(item.price.replace("$", ""));
      if (currentFilters.price === "low") return price < 250;
      if (currentFilters.price === "mid") return price >= 250 && price <= 300;
      if (currentFilters.price === "high") return price > 300;
      return true;
    });
  }

  const sortBy = document.getElementById("sortBy").value;
  currentFilters.sort = sortBy;

  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => {
      const priceA = parseInt(a.price.replace("$", ""));
      const priceB = parseInt(b.price.replace("$", ""));
      return priceA - priceB;
    });
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => {
      const priceA = parseInt(a.price.replace("$", ""));
      const priceB = parseInt(b.price.replace("$", ""));
      return priceB - priceA;
    });
  } else if (sortBy === "name") {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  }

  displayProducts(filteredProducts);
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document
    .querySelectorAll('.filter-section input[type="checkbox"]')
    .forEach((cb) => {
      cb.checked = false;
    });
  document.querySelector('input[name="price"][value="all"]').checked = true;
  document.getElementById("sortBy").value = "default";

  currentFilters = {
    search: "",
    categories: [],
    price: "all",
    sort: "default",
  };

  displayProducts(allProductsData);
  document.getElementById("filterDropdown").classList.remove("active");
}

// CART FUNCTIONS
function addToCart(productData, buttonElement) {
  const existingItem = cart.find((item) => item.id === productData.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: productData.id,
      title: productData.title,
      price: productData.price,
      image: productData.image,
      quantity: 1,
    });
  }

  updateCart();
  saveCartToStorage();
  showNotification(`${productData.title} ditambahkan ke keranjang!`);

  if (buttonElement) {
    const originalHTML = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fa fa-check"></i> Ditambahkan';
    buttonElement.style.background = "#2ecc71";

    setTimeout(() => { 
      buttonElement.innerHTML = originalHTML;
      buttonElement.style.background = "#4CAF50";
    }, 1500);
  }
}

function toggleCart(event) {
  if (event) event.stopPropagation();
  const cartDropdown = document.getElementById("cartDropdown");
  const wishlistDropdown = document.getElementById("wishlistDropdown");
  const filterDropdown = document.getElementById("filterDropdown");

  // Close wishlist and filter if open
  if (wishlistDropdown.classList.contains("active")) {
    wishlistDropdown.classList.remove("active");
  }
  if (filterDropdown.classList.contains("active")) {
    filterDropdown.classList.remove("active");
  }

  cartDropdown.classList.toggle("active");
}

function updateCart() {
  const cartCount = document.querySelector(".cart-count");
  const cartItems = document.getElementById("cartItems");
  const totalPrice = document.getElementById("totalPrice");
  const clearCartBtn = document.getElementById("clearCartBtn");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  // Show/hide clear all button
  if (cart.length > 0) {
    clearCartBtn.style.display = "block";
  } else {
    clearCartBtn.style.display = "none";
  }

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<div class="cart-empty"><p>Keranjang kosong</p></div>';  
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.title}</div>
          <div class="cart-item-price">${item.price}</div>
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="updateQuantity(event, '${item.id}', -1)">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(event, '${item.id}', 1)">+</button>
            <button class="remove-item" onclick="removeItem(event, '${item.id}')">Hapus</button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  }

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("$", ""));
    return sum + price * item.quantity;
  }, 0);
  totalPrice.textContent = `$${total.toFixed(0)}`;
}

function updateQuantity(event, id, change) {
  event.stopPropagation();
  const item = cart.find((item) => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeItem(event, id);
    } else {
      updateCart();
      saveCartToStorage();
    }
  }
}

function removeItem(event, id) {
  event.stopPropagation();
  cart = cart.filter((item) => item.id !== id);
  updateCart();
  saveCartToStorage();
  showNotification("Produk dihapus dari keranjang");
}

function checkout(event) {
  if (event) event.stopPropagation();

  if (cart.length === 0) {
    alert("Keranjang kosong!");
    return;
  }

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("$", ""));
    return sum + price * item.quantity;
  }, 0);

  const itemList = cart
    .map((item) => `${item.title} (${item.quantity}x)`)
    .join("\n");

  alert(
    `Checkout Berhasil!\n\n${itemList}\n\nTotal Pembayaran: $${total.toFixed(0)}\n\nTerima kasih telah berbelanja!`,
  );

  cart = [];
  updateCart();
  saveCartToStorage();

  const cartDropdown = document.getElementById("cartDropdown");
  cartDropdown.classList.remove("active");
}

function clearAllCart(event) {
  if (event) event.stopPropagation();

  if (cart.length === 0) return;

  const confirmation = confirm(
    "Apakah Anda yakin ingin menghapus semua item dari keranjang?",
  );

  if (confirmation) {
    cart = [];
    updateCart();
    saveCartToStorage();
    showNotification("Semua item berhasil dihapus dari keranjang");
  }
}

function saveCartToStorage() {
  localStorage.setItem("audioShopCart", JSON.stringify(cart));
}

function loadCartFromStorage() {
  const savedCart = localStorage.getItem("audioShopCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCart();
  }
}

// WISHLIST FUNCTIONS
function toggleWishlistItem(productData, buttonElement) {
  const existingIndex = wishlist.findIndex(
    (item) => item.id === productData.id,
  );

  if (existingIndex !== -1) {
    // Remove from wishlist
    wishlist.splice(existingIndex, 1);
    showNotification(`${productData.title} dihapus dari wishlist`);

    if (buttonElement) {
      buttonElement.classList.remove("active");
      buttonElement.querySelector("i").className = "fa fa-heart-o";
      buttonElement.setAttribute("title", "Tambah ke wishlist");
    }
  } else {
    // Add to wishlist
    wishlist.push({
      id: productData.id,
      title: productData.title,
      price: productData.price,
      image: productData.image,
    });
    showNotification(`${productData.title} ditambahkan ke wishlist!`);

    if (buttonElement) {
      buttonElement.classList.add("active");
      buttonElement.querySelector("i").className = "fa fa-heart";
      buttonElement.setAttribute("title", "Hapus dari wishlist");
    }
  }

  updateWishlist();
  saveWishlistToStorage();
}

function toggleWishlist(event) {
  if (event) event.stopPropagation();
  const wishlistDropdown = document.getElementById("wishlistDropdown");
  const cartDropdown = document.getElementById("cartDropdown");
  const filterDropdown = document.getElementById("filterDropdown");

  // Tutup cart dan filter ketika buka wishlist
  if (cartDropdown.classList.contains("active")) {
    cartDropdown.classList.remove("active");
  }
  if (filterDropdown.classList.contains("active")) {
    filterDropdown.classList.remove("active");
  }

  wishlistDropdown.classList.toggle("active");
}

function updateWishlist() {
  const wishlistCount = document.querySelector(".wishlist-count");
  const wishlistItems = document.getElementById("wishlistItems");
  const clearWishlistBtn = document.getElementById("clearWishlistBtn");

  wishlistCount.textContent = wishlist.length;

  // Show/hide clear all button
  if (wishlist.length > 0) {
    clearWishlistBtn.style.display = "block";
  } else {
    clearWishlistBtn.style.display = "none";
  }

  if (wishlist.length === 0) {
    wishlistItems.innerHTML =
      '<div class="wishlist-empty"><p>Wishlist kosong</p></div>';
  } else {
    wishlistItems.innerHTML = wishlist
      .map(
        (item) => `
      <div class="wishlist-item">
        <img src="${item.image}" alt="${item.title}" class="wishlist-item-img">
        <div class="wishlist-item-details">
          <div class="wishlist-item-name">${item.title}</div>
          <div class="wishlist-item-price">${item.price}</div>
          <div class="wishlist-item-actions">
            <button class="add-to-cart-from-wishlist" onclick="addToCartFromWishlist(event, '${item.id}')">
              <i class="fa fa-shopping-cart"></i> Tambah ke Keranjang
            </button>
            <button class="remove-wishlist" onclick="removeFromWishlist(event, '${item.id}')">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  }
}

function addToCartFromWishlist(event, id) {
  event.stopPropagation();
  const item = wishlist.find((item) => item.id === id);
  if (item) {
    addToCart(item);
  }
}

function removeFromWishlist(event, id) {
  event.stopPropagation();
  const item = wishlist.find((w) => w.id === id);
  wishlist = wishlist.filter((item) => item.id !== id);
  updateWishlist();
  saveWishlistToStorage();

  // Refresh layar ketika diklik logo love wishlist
  const currentDisplayedProducts = getCurrentDisplayedProducts();
  displayProducts(currentDisplayedProducts);

  if (item) {
    showNotification(`${item.title} dihapus dari wishlist`);
  }
}

function clearAllWishlist(event) {
  if (event) event.stopPropagation();

  if (wishlist.length === 0) return;

  const confirmation = confirm(
    "Apakah Anda yakin ingin menghapus semua item dari wishlist?",
  );

  if (confirmation) {
    wishlist = [];
    updateWishlist();
    saveWishlistToStorage();

    // Refresh product ketika wishlist dihapus
    const currentDisplayedProducts = getCurrentDisplayedProducts();
    displayProducts(currentDisplayedProducts);

    showNotification("Semua item berhasil dihapus dari wishlist");
  }
}

// Function untuk filter
function getCurrentDisplayedProducts() {
  let products = [...allProductsData];

  // Filter Search
  if (currentFilters.search) {
    products = products.filter(
      (item) =>
        item.title.toLowerCase().includes(currentFilters.search) ||
        item.subtitle.toLowerCase().includes(currentFilters.search) ||
        item.badge.toLowerCase().includes(currentFilters.search) ||
        item.color.toLowerCase().includes(currentFilters.search),
    );
  }

  // Filter Kategori
  if (currentFilters.categories.length > 0) {
    products = products.filter((item) => {
      const itemCategory =
        item.badge.toLowerCase().includes("earbud") ||
        item.title.toLowerCase().includes("earbud") ||
        item.weight.includes("per bud")
          ? "earbuds"
          : "headphone";
      return currentFilters.categories.includes(itemCategory);
    });
  }

  // Filter Harga
  if (currentFilters.price !== "all") {
    products = products.filter((item) => {
      const price = parseInt(item.price.replace("$", ""));
      if (currentFilters.price === "low") return price < 250;
      if (currentFilters.price === "mid") return price >= 250 && price <= 300;
      if (currentFilters.price === "high") return price > 300;
      return true;
    });
  }

  // Sortir
  if (currentFilters.sort === "price-low") {
    products.sort((a, b) => {
      const priceA = parseInt(a.price.replace("$", ""));
      const priceB = parseInt(b.price.replace("$", ""));
      return priceA - priceB;
    });
  } else if (currentFilters.sort === "price-high") {
    products.sort((a, b) => {
      const priceA = parseInt(a.price.replace("$", ""));
      const priceB = parseInt(b.price.replace("$", ""));
      return priceB - priceA;
    });
  } else if (currentFilters.sort === "name") {
    products.sort((a, b) => a.title.localeCompare(b.title));
  }

  return products;
}

function saveWishlistToStorage() {
  localStorage.setItem("audioShopWishlist", JSON.stringify(wishlist));
}

function loadWishlistFromStorage() {
  const savedWishlist = localStorage.getItem("audioShopWishlist");
  if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist);
    updateWishlist();
  }
}

// NOTIFICATION
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("hide");
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Close dropdowns when click outside
document.addEventListener("click", function (e) {
  const cartContainer = document.querySelector(".cart-container");
  const cartDropdown = document.getElementById("cartDropdown");
  const wishlistContainer = document.querySelector(".wishlist-container");
  const wishlistDropdown = document.getElementById("wishlistDropdown");
  const filterContainer = document.querySelector(".filter-container");
  const filterDropdown = document.getElementById("filterDropdown");

  if (
    cartContainer &&
    cartDropdown &&
    !cartContainer.contains(e.target) &&
    !cartDropdown.contains(e.target)
  ) {
    cartDropdown.classList.remove("active");
  }

  if (
    wishlistContainer &&
    wishlistDropdown &&
    !wishlistContainer.contains(e.target) &&
    !wishlistDropdown.contains(e.target)
  ) {
    wishlistDropdown.classList.remove("active");
  }

  if (
    filterContainer &&
    filterDropdown &&
    !filterContainer.contains(e.target) &&
    !filterDropdown.contains(e.target)
  ) {
    filterDropdown.classList.remove("active");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const cartDropdown = document.getElementById("cartDropdown");
  if (cartDropdown) {
    cartDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  const wishlistDropdown = document.getElementById("wishlistDropdown");
  if (wishlistDropdown) {
    wishlistDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  const filterDropdown = document.getElementById("filterDropdown");
  if (filterDropdown) {
    filterDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
});

getData();
