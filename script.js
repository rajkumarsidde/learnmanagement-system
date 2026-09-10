// ===== script.js =====
// Shared across all LMS pages. Each section below handles one page's logic.

document.addEventListener("DOMContentLoaded", () => {

  // ---- Hamburger menu toggle (all pages) ----
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");
  const navActions = document.querySelector(".nav-actions");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      navActions.classList.toggle("show");
    });
  }

  // ---- Update cart count badge (all pages) ----
  updateCartCount();

  // ---- Run page-specific init functions if their elements exist ----
  if (document.getElementById("course-grid")) initCoursesPage();
  if (document.getElementById("course-details")) initCourseDetailsPage();
  if (document.getElementById("cart-items")) initCartPage();
  if (document.getElementById("checkout-items")) initCheckoutPage();
  if (document.getElementById("login-form")) initLoginForm();
  if (document.getElementById("register-form")) initRegisterForm();
  if (document.getElementById("contact-form")) initContactForm();
  if (document.getElementById("payment-form")) initPaymentForm();
  if (document.getElementById("enrolled-courses")) initDashboardPage();
  if (document.getElementById("profile-form")) initProfilePage();

  // ---- Logout button (dashboard / profile) ----
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

});

/* =========================================================
   SHARED DATA — dummy course catalog (auto-generated, 120+ courses)
   In a real app this would come from a backend/database.
========================================================= */
const COURSE_TOPICS = [
  "HTML & CSS Fundamentals", "JavaScript Essentials", "React for Beginners", "Node.js Backend Development",
  "Python Programming", "Java Programming", "C++ Basics", "SQL & Databases",
  "Git & GitHub", "Responsive Web Design", "Vue.js Development", "Angular Development",
  "UI/UX Design Basics", "Figma for Designers", "Graphic Design Principles", "Adobe Photoshop",
  "Digital Marketing 101", "SEO Fundamentals", "Social Media Marketing", "Content Writing",
  "Data Science with Python", "Machine Learning Basics", "Data Analysis with Excel", "Data Visualization",
  "Business Communication", "Project Management", "Entrepreneurship Basics", "Financial Literacy",
  "Photography Basics", "Video Editing", "Music Production", "Public Speaking",
  "Cloud Computing Basics", "Cybersecurity Fundamentals", "DevOps Essentials", "Mobile App Development",
  "WordPress Development", "E-commerce with Shopify", "Copywriting Mastery", "Excel for Professionals"
];

const CATEGORIES = ["Web Dev", "Programming", "Design", "Marketing", "Data Science", "Business", "Creative", "IT & Cloud"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const COURSES = [];
let courseId = 1;

COURSE_TOPICS.forEach((topic, index) => {
  LEVELS.forEach(level => {
    const category = CATEGORIES[index % CATEGORIES.length];
    const basePrice = 14.99 + (LEVELS.indexOf(level) * 10);

    COURSES.push({
      id: courseId++,
      title: `${topic} (${level})`,
      price: parseFloat(basePrice.toFixed(2)),
      category: category,
      level: level,
      image: `images/course-thumbnails/course-${((courseId - 1) % 12) + 1}.jpg`,
      description: `A ${level.toLowerCase()}-level course covering ${topic}. Learn practical skills through hands-on lessons and real examples.`
    });
  });
});

/* =========================================================
   CART HELPERS (used across cart, checkout, course-details)
========================================================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const countEl = document.getElementById("cart-count");
  if (countEl) countEl.textContent = cart.length;
}

function addToCart(courseId) {
  const cart = getCart();
  const alreadyInCart = cart.find(item => item.id === courseId);
  if (alreadyInCart) {
    alert("This course is already in your cart!");
    return;
  }
  const course = COURSES.find(c => c.id === courseId);
  cart.push(course);
  saveCart(cart);
  alert(`"${course.title}" added to cart!`);
}

/* =========================================================
   COURSES PAGE (courses.html)
========================================================= */
function initCoursesPage() {
  const grid = document.getElementById("course-grid");
  const searchInput = document.getElementById("course-search");
  const categoryFilter = document.getElementById("category-filter");

  renderCourses(COURSES, grid);

  function applyFilters() {
    const query = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = COURSES.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(query) ||
                             c.category.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    renderCourses(filtered, grid);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
}

function renderCourses(courseList, container) {
  container.innerHTML = "";

  if (courseList.length === 0) {
    container.innerHTML = "<p>No courses found.</p>";
    return;
  }

  courseList.forEach(course => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <img src="${course.image}" alt="${course.title}">
      <div class="course-card-body">
        <h3>${course.title}</h3>
        <p>${course.category}</p>
        <div class="course-card-footer">
          <span class="course-price">$${course.price}</span>
          <a href="course-details.html?id=${course.id}" class="btn btn-outline">View</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

/* =========================================================
   COURSE DETAILS PAGE (course-details.html)
========================================================= */
function initCourseDetailsPage() {
  const container = document.getElementById("course-details");
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  const course = COURSES.find(c => c.id === id);

  if (!course) {
    container.innerHTML = "<p>Course not found. <a href='courses.html'>Back to courses</a></p>";
    return;
  }

  container.innerHTML = `
    <img src="${course.image}" alt="${course.title}">
    <h1>${course.title}</h1>
    <p>${course.category} · ${course.level}</p>
    <p>${course.description}</p>
    <span class="course-price">$${course.price}</span>
    <br>
    <button class="btn btn-primary btn-large" id="add-to-cart-btn">Add to Cart</button>
  `;

  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    addToCart(course.id);
  });
}

/* =========================================================
   CART PAGE (cart.html)
========================================================= */
function initCartPage() {
  renderCartItems();
}

function renderCartItems() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty. <a href='courses.html'>Browse courses</a></p>";
    totalEl.textContent = "0";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image}" alt="${item.title}">
        <div>
          <h4>${item.title}</h4>
          <p>$${item.price}</p>
        </div>
      </div>
      <button class="remove-item" data-id="${item.id}">Remove</button>
    `;
    container.appendChild(row);
  });

  totalEl.textContent = total.toFixed(2);

  // Attach remove handlers
  container.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const updatedCart = getCart().filter(item => item.id !== id);
      saveCart(updatedCart);
      renderCartItems();
    });
  });
}

/* =========================================================
   CHECKOUT PAGE (checkout.html)
========================================================= */
function initCheckoutPage() {
  const cart = getCart();
  const container = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    totalEl.textContent = "0";
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    total += item.price;
    return `<p>${item.title} — $${item.price}</p>`;
  }).join("");

  totalEl.textContent = total.toFixed(2);

  const billingForm = document.getElementById("billing-form");
  billingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Save billing info so payment/success pages could use it later
    const formData = new FormData(billingForm);
    localStorage.setItem("billingInfo", JSON.stringify(Object.fromEntries(formData)));
  });
}

/* =========================================================
   LOGIN FORM (login.html)
========================================================= */
function initLoginForm() {
  const form = document.getElementById("login-form");
  const status = document.getElementById("login-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      status.textContent = "Please fill in all fields.";
      status.style.color = "#dc2626";
      return;
    }

    // Simulated login (no real backend) — treat any valid input as success
    localStorage.setItem("currentUser", JSON.stringify({ email }));
    status.textContent = "Login successful! Redirecting...";
    status.style.color = "#22c55e";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  });
}

/* =========================================================
   REGISTER FORM (register.html)
========================================================= */
function initRegisterForm() {
  const form = document.getElementById("register-form");
  const status = document.getElementById("register-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!name || !email || !password || !confirmPassword) {
      status.textContent = "Please fill in all fields.";
      status.style.color = "#dc2626";
      return;
    }

    if (password !== confirmPassword) {
      status.textContent = "Passwords do not match.";
      status.style.color = "#dc2626";
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify({ name, email }));
    status.textContent = "Account created! Redirecting to login...";
    status.style.color = "#22c55e";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  });
}

/* =========================================================
   CONTACT FORM (contact.html)
========================================================= */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "Thanks for reaching out! We'll get back to you soon.";
    status.style.color = "#22c55e";
    form.reset();
  });
}

/* =========================================================
   PAYMENT FORM (payment.html)
========================================================= */
function initPaymentForm() {
  const form = document.getElementById("payment-form");
  const status = document.getElementById("payment-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cardNumber = document.getElementById("card-number").value.trim();

    if (cardNumber.length !== 16 || isNaN(cardNumber)) {
      status.textContent = "Please enter a valid 16-digit card number.";
      status.style.color = "#dc2626";
      return;
    }

    // Simulate successful payment: move cart items into "enrolledCourses"
    const cart = getCart();
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const updatedEnrolled = [...enrolled, ...cart];
    localStorage.setItem("enrolledCourses", JSON.stringify(updatedEnrolled));

    // Clear cart
    saveCart([]);

    status.textContent = "Processing payment...";
    status.style.color = "#4f46e5";

    setTimeout(() => {
      window.location.href = "success.html";
    }, 1000);
  });
}

/* =========================================================
   DASHBOARD PAGE (dashboard.html)
========================================================= */
function initDashboardPage() {
  const container = document.getElementById("enrolled-courses");
  const enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];

  if (enrolled.length === 0) {
    container.innerHTML = "<p>You haven't enrolled in any courses yet. <a href='courses.html'>Browse courses</a></p>";
    return;
  }

  container.innerHTML = "";
  enrolled.forEach(course => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <img src="${course.image}" alt="${course.title}">
      <div class="course-card-body">
        <h3>${course.title}</h3>
        <p>${course.category}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

/* =========================================================
   PROFILE PAGE (profile.html)
========================================================= */
function initProfilePage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  const form = document.getElementById("profile-form");
  const status = document.getElementById("profile-status");

  // Show current user info if logged in
  if (currentUser) {
    nameEl.textContent = currentUser.name || "SkillUp Learner";
    emailEl.textContent = currentUser.email;
    document.getElementById("full-name").value = currentUser.name || "";
    document.getElementById("email").value = currentUser.email || "";
    document.getElementById("bio").value = currentUser.bio || "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name: document.getElementById("full-name").value.trim(),
      email: document.getElementById("email").value.trim(),
      bio: document.getElementById("bio").value.trim()
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    nameEl.textContent = updatedUser.name || "SkillUp Learner";
    emailEl.textContent = updatedUser.email;
    status.textContent = "Profile updated successfully!";
  });
}