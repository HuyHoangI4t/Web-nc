// Chặn bôi đen toàn trang
document.addEventListener("selectstart", function(e) {
  e.preventDefault();
});

// Chặn caret nhấp nháy khi click vào phần tử không phải input/textarea/ select
document.addEventListener("mousedown", function(e) {
  if (!(e.target instanceof HTMLInputElement) &&
      !(e.target instanceof HTMLTextAreaElement) &&
      !(e.target instanceof HTMLSelectElement)) {
    e.preventDefault(); 
  }
});


const AppState = {
  currentUser: null,
  currentPage: "landing",
  sidebarCollapsed: false,
  transactions: [],
  budgets: {},
  goals: [],
  categories: [
    { id: "food", name: "Ăn uống", icon: "utensils", color: "#f59e0b" },
    { id: "transport", name: "Đi lại", icon: "car", color: "#3b82f6" },
    { id: "entertainment", name: "Giải trí", icon: "gamepad", color: "#8b5cf6" },
    { id: "shopping", name: "Mua sắm", icon: "shopping-bag", color: "#ec4899" },
    { id: "bills", name: "Hóa đơn", icon: "receipt", color: "#ef4444" },
    { id: "health", name: "Sức khỏe", icon: "heart", color: "#10b981" },
    { id: "other", name: "Khác", icon: "more-horizontal", color: "#6b7280" },
  ],
}

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Initializing Personal Finance Manager Pro")

  // Show loading screen
  showLoadingScreen()

  // Initialize app after delay
  setTimeout(() => {
    initializeApp()
    hideLoadingScreen()
  }, 100)
})

function initializeApp() {
  console.log("[v0] App initialization started")

  // Load user data from localStorage
  loadUserData()

  // Initialize event listeners
  initializeEventListeners()

  // Check authentication state
  checkAuthState()

  // Initialize charts if on dashboard
  if (AppState.currentPage === "dashboard") {
    initializeCharts()
  }

  console.log("[v0] App initialization completed")
}

function loadUserData() {
  const savedUser = localStorage.getItem("financeApp_user")
  const savedTransactions = localStorage.getItem("financeApp_transactions")
  const savedBudgets = localStorage.getItem("financeApp_budgets")
  const savedGoals = localStorage.getItem("financeApp_goals")

  if (savedUser) {
    AppState.currentUser = JSON.parse(savedUser)
  }

  if (savedTransactions) {
    AppState.transactions = JSON.parse(savedTransactions)
  } else {
    // Initialize with sample data
    AppState.transactions = generateSampleTransactions()
    saveTransactions()
  }

  if (savedBudgets) {
    AppState.budgets = JSON.parse(savedBudgets)
  } else {
    // Initialize with sample budgets
    AppState.budgets = generateSampleBudgets()
    saveBudgets()
  }

  if (savedGoals) {
    AppState.goals = JSON.parse(savedGoals)
  } else {
    // Initialize with sample goals
    AppState.goals = generateSampleGoals()
    saveGoals()
  }
}

function generateSampleTransactions() {
  const transactions = []
  const today = new Date()

  // Generate transactions for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const numTransactions = Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < numTransactions; j++) {
      const category = AppState.categories[Math.floor(Math.random() * AppState.categories.length)]
      const amount = Math.floor(Math.random() * 500000) + 50000

      transactions.push({
        id: Date.now() + Math.random(),
        date: date.toISOString().split("T")[0],
        type: "expense",
        category: category.id,
        description: generateTransactionDescription(category.id),
        amount: amount,
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Add some income transactions
  for (let i = 0; i < 3; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i * 10)

    transactions.push({
      id: Date.now() + Math.random(),
      date: date.toISOString().split("T")[0],
      type: "income",
      category: "salary",
      description: "Lương tháng " + (date.getMonth() + 1),
      amount: 25000000,
      createdAt: new Date().toISOString(),
    })
  }

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
}

function generateTransactionDescription(categoryId) {
  const descriptions = {
    food: ["Cơm trưa", "Starbucks Coffee", "Nhà hàng Sushi", "Bánh mì sáng", "Trà sữa"],
    transport: ["Xăng xe máy", "Grab", "Vé xe buýt", "Taxi", "Sửa xe"],
    entertainment: ["Xem phim", "Karaoke", "Game online", "Sách", "Âm nhạc"],
    shopping: ["Quần áo", "Siêu thị", "Mỹ phẩm", "Điện tử", "Giày dép"],
    bills: ["Tiền điện", "Tiền nước", "Internet", "Điện thoại", "Bảo hiểm"],
    health: ["Khám bệnh", "Thuốc", "Vitamin", "Gym", "Spa"],
    other: ["Quà tặng", "Từ thiện", "Khác", "Phí ngân hàng", "Đầu tư"],
  }

  const categoryDescriptions = descriptions[categoryId] || descriptions.other
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)]
}

function generateSampleBudgets() {
  return {
    food: { limit: 7000000, spent: 0, period: "monthly" },
    transport: { limit: 3000000, spent: 0, period: "monthly" },
    entertainment: { limit: 2000000, spent: 0, period: "monthly" },
    shopping: { limit: 5000000, spent: 0, period: "monthly" },
    bills: { limit: 4000000, spent: 0, period: "monthly" },
    health: { limit: 2000000, spent: 0, period: "monthly" },
    other: { limit: 3000000, spent: 0, period: "monthly" },
  }
}

function generateSampleGoals() {
  return [
    {
      id: 1,
      name: "Mua xe ô tô",
      target: 500000000,
      current: 175000000,
      deadline: "2025-12-31",
      category: "transport",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Mua nhà",
      target: 2000000000,
      current: 300000000,
      deadline: "2027-12-31",
      category: "housing",
      createdAt: new Date().toISOString(),
    },
  ]
}

function initializeEventListeners() {
  // Modal close events
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      closeModal(event.target.id)
    }
  })

  // Keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    // Escape key to close modals
    if (event.key === "Escape") {
      const activeModal = document.querySelector(".modal.active")
      if (activeModal) {
        closeModal(activeModal.id)
      }
    }

    // Ctrl/Cmd + N to add new transaction
    if ((event.ctrlKey || event.metaKey) && event.key === "n") {
      event.preventDefault()
      if (AppState.currentUser) {
        showQuickAdd()
      }
    }
  })

  // Navigation events
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      const page = this.getAttribute("data-page")
      if (page) {
        navigateToPage(page)
      }
    })
  })

  // Sidebar toggle
  const sidebarToggle = document.querySelector(".sidebar-toggle")
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar)
  }

  const mobileSidebarToggle = document.querySelector(".mobile-sidebar-toggle")
  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener("click", toggleMobileSidebar)
  }
}

function checkAuthState() {
  if (AppState.currentUser) {
    showDashboard()
  } else {
    showLandingPage()
  }
}

// Page Management Functions
function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen")
  if (loadingScreen) {
    loadingScreen.classList.remove("hidden")
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen")
  if (loadingScreen) {
    loadingScreen.classList.add("hidden")
    setTimeout(() => {
      loadingScreen.style.display = "none"
    }, 100)
  }
}

function showLandingPage() {
  hideAllPages()
  const landingPage = document.getElementById("landing-page")
  if (landingPage) {
    landingPage.classList.add("active")
    AppState.currentPage = "landing"
  }

  // Hide floating button
  const fab = document.getElementById("floating-add-btn")
  if (fab) {
    fab.style.display = "none"
  }
}

function showDashboard() {
  hideAllPages()
  const dashboard = document.getElementById("dashboard")
  if (dashboard) {
    dashboard.classList.add("active")
    AppState.currentPage = "dashboard"
  }

  // Show floating button
  const fab = document.getElementById("floating-add-btn")
  if (fab) {
    fab.style.display = "flex"
  }

  // Update dashboard data
  updateDashboardData()

  // Initialize charts
  setTimeout(() => {
    initializeCharts()
  }, 100)
}

function hideAllPages() {
  const pages = document.querySelectorAll(".page")
  pages.forEach((page) => {
    page.classList.remove("active")
  })
}

function navigateToPage(pageId) {
  // Update navigation
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.classList.remove("active")
    if (item.getAttribute("data-page") === pageId) {
      item.classList.add("active")
    }
  })

  // Show content section
  const contentSections = document.querySelectorAll(".content-section")
  contentSections.forEach((section) => {
    section.classList.remove("active")
  })

  const targetSection = document.getElementById(pageId)
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Update page title
  const pageTitle = document.getElementById("page-title")
  const activeNav = document.querySelector(".nav-item.active span")
  if (pageTitle && activeNav) {
    pageTitle.textContent = activeNav.textContent
  }

  // Load page-specific content
  loadPageContent(pageId)
}

function loadPageContent(pageId) {
  switch (pageId) {
    case "transactions":
      loadTransactionsPage()
      break
    case "budget":
      loadBudgetPage()
      break
    case "reports":
      loadReportsPage()
      break
    case "goals":
      loadGoalsPage()
      break
    case "banks":
      loadBanksPage()
      break
    default:
      break
  }
}

// Modal Management Functions
function showModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add("active")
    document.body.style.overflow = "hidden"
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("active")
    document.body.style.overflow = "auto"
  }
}

// Authentication Functions
function showLogin() {
  showModal("login-modal")
}

function showRegister() {
  showModal("register-modal")
}

function switchToRegister() {
  closeModal("login-modal")
  showModal("register-modal")
}

function switchToLogin() {
  closeModal("register-modal")
  showModal("login-modal")
}

function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  if (email && password) {
    // Simulate login
    AppState.currentUser = {
      id: 1,
      name: "Nguyễn Văn A",
      email: email,
      avatar: "https://via.placeholder.com/32",
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem("financeApp_user", JSON.stringify(AppState.currentUser))
    closeModal("login-modal")
    showDashboard()
    showNotification("Đăng nhập thành công!", "success")

    // Reset form
    document.getElementById("login-email").value = ""
    document.getElementById("login-password").value = ""
  } else {
    showNotification("Vui lòng nhập đầy đủ thông tin!", "error")
  }
}

// thay thế/ghi đè vào script.js (thay thế hàm handleGoogleLogin hiện tại)
let _gisInitialized = false;

function handleGoogleLogin() {
  if (!_gisInitialized) {
    google.accounts.id.initialize({
      client_id: "908594978339-3dphku6que1ds8q9s6ml4lb3d3ojcs18.apps.googleusercontent.com", // thay bằng Client ID của bạn nếu cần
      callback: handleGoogleCredentialResponse,
      ux_mode: 'popup' // 'popup' hoặc 'redirect' - dùng 'popup' cho trải nghiệm trong app
    });
    _gisInitialized = true;
  }
  // Gợi prompt One Tap / hoặc show button
  google.accounts.id.prompt(); // gọi prompt để bật OneTap (nếu khả dụng)
}

function logout() {
  AppState.currentUser = null
  localStorage.removeItem("financeApp_user")
  showLandingPage()
  showNotification("Đã đăng xuất!", "success")
}

// Sidebar Functions
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar")
  if (sidebar) {
    sidebar.classList.toggle("collapsed")
    AppState.sidebarCollapsed = !AppState.sidebarCollapsed
  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar")
  if (sidebar) {
    sidebar.classList.toggle("active")
  }
}

function toggleUserMenu() {
  const userMenu = document.getElementById("user-menu")
  if (userMenu) {
    userMenu.classList.toggle("active")
  }
}

// Quick Actions
function showQuickAdd() {
  showModal("quick-add-modal")

  // Set current date
  const dateInput = document.getElementById("quick-date")
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0]
  }
}

function handleQuickAdd(event) {
  event.preventDefault()

  const type = document.getElementById("quick-type").value
  const amount = Number.parseFloat(document.getElementById("quick-amount").value)
  const category = document.getElementById("quick-category").value
  const description = document.getElementById("quick-description").value
  const date = document.getElementById("quick-date").value

  if (type && amount && category && description && date) {
    const transaction = {
      id: Date.now() + Math.random(),
      date: date,
      type: type,
      category: category,
      description: description,
      amount: amount,
      createdAt: new Date().toISOString(),
    }

    AppState.transactions.unshift(transaction)
    saveTransactions()
    updateDashboardData()
    closeModal("quick-add-modal")
    showNotification("Đã thêm giao dịch thành công!", "success")

    // Reset form
    document.getElementById("quick-type").value = ""
    document.getElementById("quick-amount").value = ""
    document.getElementById("quick-category").value = ""
    document.getElementById("quick-description").value = ""
    document.getElementById("quick-date").value = new Date().toISOString().split("T")[0]
  } else {
    showNotification("Vui lòng nhập đầy đủ thông tin!", "error")
  }
}

// Data Management Functions
function saveTransactions() {
  localStorage.setItem("financeApp_transactions", JSON.stringify(AppState.transactions))
}

function saveBudgets() {
  localStorage.setItem("financeApp_budgets", JSON.stringify(AppState.budgets))
}

function saveGoals() {
  localStorage.setItem("financeApp_goals", JSON.stringify(AppState.goals))
}

// Notification System
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`

  const colors = {
    success: { bg: "#d1fae5", color: "#065f46", border: "#10b981" },
    error: { bg: "#fef2f2", color: "#991b1b", border: "#ef4444" },
    warning: { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" },
    info: { bg: "#e0f2fe", color: "#0c4a6e", border: "#3b82f6" },
  }

  const style = colors[type] || colors.info

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${style.bg};
        color: ${style.color};
        border-left: 4px solid ${style.border};
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        font-weight: 500;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
    `

  notification.textContent = message
  document.body.appendChild(notification)

  // Show notification
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Hide notification
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫"
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN")
}

function getCategoryById(categoryId) {
  return (
    AppState.categories.find((cat) => cat.id === categoryId) || AppState.categories.find((cat) => cat.id === "other")
  )
}

// Demo Functions
function showDemo() {
  showNotification("Demo sẽ được triển khai sớm!", "info")
}

function showFeatures() {
  const featuresSection = document.getElementById("features")
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: "smooth" })
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const navMenu = document.querySelector(".nav-menu")
  if (navMenu) {
    navMenu.classList.toggle("active")
  }
}

// Export for other modules
window.AppState = AppState
window.showNotification = showNotification
window.formatCurrency = formatCurrency
window.formatDate = formatDate
window.getCategoryById = getCategoryById

// Placeholder functions for undeclared variables
function initializeCharts() {
  console.log("initializeCharts function is not implemented yet.")
}

function updateDashboardData() {
  console.log("updateDashboardData function is not implemented yet.")
}

function loadTransactionsPage() {
  console.log("loadTransactionsPage function is not implemented yet.")
}

function loadBudgetPage() {
  console.log("loadBudgetPage function is not implemented yet.")
}

function loadReportsPage() {
  console.log("loadReportsPage function is not implemented yet.")
}

function loadGoalsPage() {
  console.log("loadGoalsPage function is not implemented yet.")
}

function loadBanksPage() {
  console.log("loadBanksPage function is not implemented yet.")
}

// New function to handle Google login (used by both login and register modals)
function handleGoogleLogin() {
  google.accounts.id.initialize({
    client_id: "908594978339-3dphku6que1ds8q9s6ml4lb3d3ojcs18.apps.googleusercontent.com", // Replace with your actual client ID
    callback: handleGoogleCredentialResponse
  });
  google.accounts.id.prompt();
}

// Callback function when GIS returns a credential
function handleGoogleCredentialResponse(response) {
  if (response.credential) {
    try {
      const decoded = jwt_decode(response.credential);
      const { name, email, picture } = decoded;
      AppState.currentUser = {
        id: Date.now(), // or use decoded.sub if available
        name: name,
        email: email,
        avatar: picture || "https://via.placeholder.com/32",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("financeApp_user", JSON.stringify(AppState.currentUser));
      // Update sidebar user info
      const userNameEl = document.querySelector('.user-info .user-name');
      const userEmailEl = document.querySelector('.user-info .user-email');
      if (userNameEl && userEmailEl) {
        userNameEl.textContent = name;
        userEmailEl.textContent = email;
      }
      // Close modal(s) and show dashboard
      closeModal("login-modal");
      closeModal("register-modal");
      showDashboard();
      showNotification("Đăng nhập thành công!", "success");
    } catch (error) {
      console.error("Error decoding Google token", error);
      showNotification("Xác thực Google thất bại!", "error");
    }
  } else {
    showNotification("Không nhận được thông tin từ Google!", "error");
  }
}
