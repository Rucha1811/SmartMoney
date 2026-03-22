# SmartMoney X - Comprehensive Code Documentation

**Version:** 1.0.0  
**Type:** Full-Stack Financial Management Application  
**Tech Stack:** HTML5, CSS3, JavaScript (ES6+), PHP 7.4+, MySQL 5.7+  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Structure](#architecture--structure)
3. [Core JavaScript Files](#core-javascript-files)
4. [View Components](#view-components)
5. [Backend API](#backend-api)
6. [Database Schema](#database-schema)
7. [Installation & Setup](#installation--setup)
8. [Usage Guide](#usage-guide)
9. [Function Reference](#function-reference)

---

## 🎯 Project Overview

**SmartMoney X** is an intelligent personal finance management application designed to help users track income, expenses, investments, and financial goals in real-time. The application features an AI-powered wealth management system with comprehensive analytics and portfolio management.

### Key Features
- 📊 **Financial Dashboard** - Real-time overview of net worth, income, expenses, and investments
- 💳 **Transaction Management** - Track and categorize all financial transactions
- 💰 **Budget Planning** - Create and monitor spending budgets by category
- 📈 **Investment Portfolio** - Manage stocks, ETFs, and cryptocurrency holdings
- 🎯 **Goal Tracking** - Set and monitor financial goals with progress tracking
- 📋 **Subscription Management** - Track recurring subscriptions and payments
- 📊 **Advanced Reports** - Detailed financial analysis and spending insights
- 🎮 **Virtual Trading** - Practice trading with virtual currency
- 🤖 **AI Insights** - AI-powered financial recommendations
- 🎨 **Theme System** - Dark and light professional themes with seamless switching

---

## 🏗️ Architecture & Structure

### Directory Layout
```
r1/
├── index.html                 # Main entry point & app shell
├── money.sql                  # Database schema
├── CHANGELOG.md               # Version history
├── QUICK_START.md             # Quick setup guide
├── README.md                  # Original README
│
├── assets/
│   ├── api/                   # PHP Backend APIs
│   │   ├── db.php            # Database connection & configuration
│   │   ├── login.php         # Authentication (login)
│   │   ├── register.php      # User registration
│   │   ├── transactions.php  # Transaction CRUD operations
│   │   ├── budget.php        # Budget management
│   │   ├── goals.php         # Financial goals management
│   │   ├── subscriptions.php # Subscription tracking
│   │   ├── reports.php       # Financial reports generation
│   │   ├── chat.php          # Chat/messaging API
│   │   └── check_tables.php  # Database table verification
│   │
│   ├── css/                   # Stylesheets
│   │   ├── main.css          # Base styles & typography
│   │   ├── layout.css        # Layout and grid system
│   │   ├── components.css    # UI component styles
│   │   ├── themes.css        # Dark/light theme definitions
│   │   ├── animations.css    # Transition & animation effects
│   │   ├── auth.css          # Authentication page styles
│   │   └── notifications.css # Toast notification styles
│   │
│   ├── js/                    # JavaScript Core
│   │   ├── app.js            # Main application controller
│   │   ├── router.js         # Hash-based routing engine
│   │   ├── utils.js          # Utility functions & helpers
│   │   ├── money_db.js       # Client-side data storage (localStorage)
│   │   │
│   │   └── views/            # View Components
│   │       ├── dashboard.js    # Home/overview dashboard
│   │       ├── transactions.js # Transaction listing & management
│   │       ├── budget.js       # Budget creation & monitoring
│   │       ├── investments.js  # Portfolio & investment management
│   │       ├── goals.js        # Financial goals interface
│   │       ├── subscriptions.js# Recurring payments management
│   │       ├── trading.js      # Virtual trading simulator
│   │       ├── insights.js     # AI financial insights
│   │       ├── reports.js      # Financial reports & analytics
│   │       ├── settings.js     # User preferences & settings
│   │       ├── login.js        # Login form & flow
│   │       ├── register.js     # Registration form & flow
│   │       └── forgot_password.js # Password recovery
│   │
│   └── images/               # Image assets
```

---

## 🔧 Core JavaScript Files

### 1. **index.html** - Main Application Shell
**Purpose:** Renders the complete application UI structure  
**Key Elements:**
- App shell with sidebar and main viewport
- Navigation menu with all routes
- User profile section
- Theme toggle
- Logout functionality

**Structure:**
```html
<div id="app-shell">
  <aside id="sidebar"> - Main navigation menu
  <main id="main-container">
    <header> - Page title and controls
    <div id="view-container"> - Dynamic view renderer
```

### 2. **app.js** - Application Controller
**Purpose:** Initialize and orchestrate the entire application

**Key Functions:**

#### `App.init()`
- **Called:** On page load
- **Responsibility:** Bootstrap the entire application
- **Flow:**
  1. Initialize MoneyDB (localStorage database)
  2. Load user profile information
  3. Setup routing system
  4. Initialize theme engine
  5. Attach global event listeners
  6. Check authentication status

```javascript
App.init() {
  MoneyDB.init();        // 1. Initialize data layer
  this.loadProfile();    // 2. Load user data
  this.setupRoutes();    // 3. Setup all view routes
  this.setupTheme();     // 4. Initialize theme switching
  this.setupEventListeners();  // 5. Global event handlers
  this.checkAuth();      // 6. Verify user is authenticated
}
```

#### `App.checkAuth()`
- **Called:** On init and hash changes
- **Purpose:** Ensure authenticated users don't access auth pages
- **Logic:**
  - If NOT authenticated → redirect to login
  - If authenticated → prevent access to login/register
  - Allow public pages: `/login`, `/register`, `/forgot-password`

#### `App.logout()`
- **Called:** Click logout button in sidebar
- **Purpose:** Clear session and redirect to login
- **Steps:**
  1. Remove `smartmoney_auth` from localStorage
  2. Navigate to login page
  3. Reload page to clear state

#### `App.loadProfile()`
- **Called:** During initialization
- **Purpose:** Display user information in sidebar
- **Updates:**
  - User name
  - Current plan (Premium/Free)
  - Avatar initials

#### `App.setupRoutes()`
- **Called:** During initialization
- **Purpose:** Register all view routes with lazy loading
- **Pattern:** Each route is registered with async handler
- **Routes Registered:**
  - `dashboard` → DashboardView
  - `transactions` → TransactionsView
  - `budget` → BudgetView
  - `investments` → InvestmentsView
  - `goals` → GoalsView
  - `subscriptions` → SubscriptionsView
  - `trading` → TradingView
  - `insights` → InsightsView
  - `reports` → ReportsView
  - `settings` → SettingsView
  - `login` → LoginView
  - `register` → RegisterView
  - `forgot-password` → ForgotPasswordView

#### `App.setupTheme()`
- **Called:** During initialization
- **Purpose:** Initialize theme switching system
- **Function:** Checks stored theme preference and applies it
- **Themes Available:** "dark-pro" and "light-professional"

#### `App.setupEventListeners()`
- **Called:** During initialization
- **Purpose:** Attach global event handlers
- **Events:** Theme toggle, logout, navigation

#### `App.loadScript(scriptPath)`
- **Purpose:** Dynamically load JavaScript modules
- **Used For:** Lazy loading view components on demand
- **Returns:** Promise that resolves when script loads

### 3. **router.js** - Hash-Based Routing Engine
**Purpose:** Simple Single-Page Application (SPA) router

**Key Features:**
- Hash-based routing (`#dashboard`, `#transactions`)
- Lazy view loading
- Active navigation highlighting
- Dynamic page titles

**Key Functions:**

#### `Router.init()`
- **Called:** From App.init()
- **Purpose:** Initialize router and setup event listeners
- **Listeners:**
  - `hashchange` - triggered when URL hash changes
  - `load` - triggered on initial page load

#### `Router.add(path, handler)`
- **Parameters:**
  - `path` - Route name (e.g., "dashboard")
  - `handler` - Async function that returns HTML
- **Purpose:** Register a new route with its render handler
- **Called From:** App.setupRoutes()

#### `Router.handleRoute()`
- **Called:** On hash change or page load
- **Process:**
  1. Extract hash from URL (default to "dashboard")
  2. Update active navigation item styling
  3. Show loading spinner
  4. Execute route handler
  5. Render returned HTML
  6. Update page title
  7. Dispatch `viewLoaded` event

### 4. **utils.js** - Utility & Helper Functions
**Purpose:** Shared utility functions used across all views

**Key Functions:**

#### `ViewUtils.formatCurrency(amount)`
- **Purpose:** Format numbers as currency with $ sign
- **Input:** Numeric amount
- **Output:** Formatted string (e.g., "$1,234.56")
- **Used In:** All views displaying money values
- **Example:**
  ```javascript
  ViewUtils.formatCurrency(1234.56) // Returns: "$1,234.56"
  ```

#### `ViewUtils.formatDate(dateString)`
- **Purpose:** Convert date strings to readable format
- **Input:** ISO date string (e.g., "2024-01-15")
- **Output:** Localized date (e.g., "Jan 15, 2024")
- **Used In:** Transaction lists, goal dates, subscription dates
- **Example:**
  ```javascript
  ViewUtils.formatDate("2024-01-15") // Returns: "Jan 15, 2024"
  ```

#### `ViewUtils.showToast(message, type)`
- **Purpose:** Display non-intrusive notification messages
- **Parameters:**
  - `message` - Text to display
  - `type` - "success", "error", or "info"
- **Duration:** Auto-dismisses after 3 seconds
- **Used In:** Form submissions, API responses, confirmations
- **Example:**
  ```javascript
  ViewUtils.showToast('Transaction saved successfully!', 'success');
  ViewUtils.showToast('Failed to save budget', 'error');
  ViewUtils.showToast('Loading your data...', 'info');
  ```

#### `ViewUtils.showError(container, title, message)`
- **Purpose:** Display error states in containers
- **Parameters:**
  - `container` - DOM element to display in
  - `title` - Error title
  - `message` - Detailed error message
- **Features:** Includes retry button
- **Used In:** Failed API calls, data loading errors
- **Example:**
  ```javascript
  ViewUtils.showError(document.getElementById('container'), 
    'Failed to Load', 
    'Unable to fetch transactions. Please try again.');
  ```

#### `ViewUtils.showLoading(container, message)`
- **Purpose:** Display loading spinner and message
- **Parameters:**
  - `container` - DOM element to display in
  - `message` - Loading message (default: "Loading...")
- **Used In:** Views with async data loading
- **Example:**
  ```javascript
  ViewUtils.showLoading(document.getElementById('container'), 
    'Fetching your portfolio...');
  ```

#### `ViewUtils.isValidEmail(email)`
- **Purpose:** Validate email format
- **Input:** Email string
- **Output:** Boolean (true if valid)
- **Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Used In:** Login form, registration form
- **Example:**
  ```javascript
  ViewUtils.isValidEmail('user@example.com') // Returns: true
  ViewUtils.isValidEmail('invalid-email') // Returns: false
  ```

#### `ViewUtils.isValidPassword(password)`
- **Purpose:** Validate password strength
- **Rule:** Minimum 6 characters
- **Input:** Password string
- **Output:** Boolean (true if valid)
- **Used In:** Registration form, password reset
- **Example:**
  ```javascript
  ViewUtils.isValidPassword('pass123') // Returns: true
  ViewUtils.isValidPassword('123') // Returns: false
  ```

#### `ViewUtils.apiCall(endpoint, options)`
- **Purpose:** Make HTTP requests with error handling
- **Parameters:**
  - `endpoint` - API URL
  - `options.method` - HTTP method (GET, POST, etc.)
  - `options.headers` - Custom headers
  - `options.body` - Request body (auto-JSON stringified)
- **Returns:** Promise with JSON response
- **Error Handling:** Throws error on failure
- **Used In:** All API requests
- **Example:**
  ```javascript
  // GET request
  ViewUtils.apiCall('assets/api/transactions.php')
    .then(data => console.log(data))
    .catch(err => ViewUtils.showToast(err.message, 'error'));
  
  // POST request
  ViewUtils.apiCall('assets/api/transactions.php', {
    method: 'POST',
    body: { title: 'Rent', amount: 1200, category: 'Housing' }
  })
    .then(data => ViewUtils.showToast('Transaction added!', 'success'))
    .catch(err => ViewUtils.showToast(err.message, 'error'));
  ```

### 5. **money_db.js** - Client-Side Data Storage
**Purpose:** Simulate database using browser's localStorage

**Key Features:**
- JSON serialization/deserialization
- Seed data for demo
- Helper methods for common operations

**Key Functions:**

#### `MoneyDB.init()`
- **Called:** During App.init()
- **Purpose:** Initialize database with seed data if empty
- **Check:** Looks for existing data in localStorage
- **Seed Data Includes:**
  - User profile information
  - Sample transactions
  - Portfolio with stocks and crypto
  - Financial stats
  - Budget categories

#### `MoneyDB.get()`
- **Purpose:** Retrieve entire database object
- **Returns:** Parsed JSON object from localStorage
- **Used In:** All data access operations
- **Example:**
  ```javascript
  const db = MoneyDB.get();
  console.log(db.user);
  console.log(db.transactions);
  ```

#### `MoneyDB.save(data)`
- **Purpose:** Save data to localStorage
- **Parameters:** Complete database object
- **Used In:** After any data modification
- **Example:**
  ```javascript
  const db = MoneyDB.get();
  db.user.name = "John Doe";
  MoneyDB.save(db);
  ```

#### `MoneyDB.getUser()`
- **Purpose:** Retrieve current user profile
- **Returns:** User object with properties:
  - `name` - Full name
  - `email` - Email address
  - `plan` - Plan type (Premium/Free)
  - `avatar` - Avatar initials (e.g., "TG")
  - `currency` - Currency symbol (e.g., "$")
- **Used In:** Profile display, user context

#### `MoneyDB.getTransactions()`
- **Purpose:** Get all transactions sorted by date (newest first)
- **Returns:** Array of transaction objects
- **Transaction Properties:**
  - `id` - Unique identifier
  - `title` - Transaction name
  - `category` - Category (Shopping, Income, etc.)
  - `date` - ISO date string
  - `amount` - Numeric amount (negative for expenses)
  - `type` - "income" or "expense"
  - `icon` - Font Awesome icon class
- **Used In:** Transactions view, dashboard

#### `MoneyDB.addTransaction(tx)`
- **Purpose:** Add new transaction and update stats
- **Parameters:** Transaction object without ID
- **Auto-assigns:** ID (current timestamp)
- **Updates:** Monthly income/expense stats, budget spent amounts
- **Returns:** Created transaction with ID
- **Category Matching:** Updates budget if category matches
- **Example:**
  ```javascript
  const newTx = MoneyDB.addTransaction({
    title: 'Grocery Store',
    category: 'Food',
    date: '2024-01-15',
    amount: -125.50,
    type: 'expense',
    icon: 'fa-solid fa-shopping-cart'
  });
  ```

#### `MoneyDB.getPortfolio()`
- **Purpose:** Retrieve investment portfolio
- **Returns:** Object with `stocks` and `crypto` arrays
- **Stock Properties:**
  - `symbol` - Ticker symbol (e.g., "AAPL")
  - `name` - Company name
  - `shares` - Number of shares owned
  - `avgPrice` - Average purchase price
  - `currentPrice` - Current market price
  - `change` - Percentage change
- **Crypto Properties:** Similar to stocks
- **Used In:** Investments view, dashboard

#### `MoneyDB.getStats()`
- **Purpose:** Get financial overview statistics
- **Returns:** Object with:
  - `netWorth` - Total asset value
  - `monthlyIncome` - Total income this month
  - `monthlyExpense` - Total expenses this month
  - `savingsRate` - Percentage saved
- **Used In:** Dashboard stats cards

#### `MoneyDB.getBudgets()`
- **Purpose:** Retrieve all budgets
- **Returns:** Array of budget objects
- **Budget Properties:**
  - `id` - Unique identifier
  - `category` - Category name
  - `limit` - Monthly limit amount
  - `spent` - Current spending in category
  - `color` - CSS color for UI display
- **Used In:** Budget view

#### `MoneyDB.addBudget(budget)`
- **Purpose:** Create new budget
- **Parameters:** Budget object without ID or spent
- **Auto-assigns:** ID (timestamp), spent (0)
- **Returns:** Created budget with ID
- **Example:**
  ```javascript
  const newBudget = MoneyDB.addBudget({
    category: 'Entertainment',
    limit: 150.00,
    color: 'var(--color-secondary)'
  });
  ```

---

## 📱 View Components

All view components follow a consistent pattern:
- Export as `window.ViewName` object
- Implement `render()` method returning HTML string
- Include event handlers for user interactions
- Use ViewUtils for formatting and API calls
- Support async data loading

### 1. **DashboardView** (dashboard.js)
**Purpose:** Home screen with financial overview

**Renders:**
- Welcome greeting with user name
- Current date display
- Financial stats cards:
  - Net Worth
  - Monthly Income
  - Monthly Expenses
  - Investments Total
- Cash flow analytics chart (income vs expenses)
- Recent transactions (latest 5)
- Quick action buttons
- Portfolio overview

**Key Functions:**

#### `render()`
- Fetches data from MoneyDB
- Calculates totals (stocks + crypto)
- Returns formatted HTML with all stats
- Calls `addTransaction()` on button click

#### `addTransaction()`
- Opens transaction modal
- Validates form inputs
- Adds transaction via MoneyDB
- Updates UI

### 2. **TransactionsView** (transactions.js)
**Purpose:** View and manage all transactions

**Renders:**
- Transaction table with columns:
  - Transaction name + icon
  - Category (with badge)
  - Date
  - Amount (formatted currency)
  - Delete button
- Filter options
- Add transaction button
- Empty state message

**Key Functions:**

#### `render()`
- Gets all transactions from MoneyDB
- Sorts by date (newest first)
- Renders as table
- Handles empty state

#### `openAddModal()`
- Shows transaction entry form
- Validates required fields
- Allows category selection
- Handles transaction type (income/expense)

#### `deleteTransaction(id)`
- Removes transaction from database
- Updates related stats
- Refreshes view

### 3. **BudgetView** (budget.js)
**Purpose:** Create and monitor spending budgets

**Renders:**
- Total budget and spent stats cards
- Budget list with:
  - Category name
  - Spending progress bar
  - Amount spent / limit
  - Percentage used
  - Spending indicators (colors)
- Add budget button
- Budget form modal

**Key Functions:**

#### `render()`
- Loads budgets from API
- Calculates totals
- Returns header and modal HTML
- Triggers `loadBudgets()` via setTimeout

#### `loadBudgets()`
- Fetches from `assets/api/budget.php`
- Calculates total budget and spent
- Updates stat cards
- Renders budget list with progress bars
- Handles empty state

#### `handleSubmit(event)`
- Validates form inputs:
  - Category name required
  - Limit must be valid number
  - Minimum value checks
- Sends POST to API
- Shows success/error toast
- Refreshes budget list

#### `openAddModal()`
- Clears form fields
- Shows modal overlay
- Focuses on category input

#### `closeModal()`
- Hides modal
- Clears any errors

### 4. **InvestmentsView** (investments.js)
**Purpose:** Manage investment portfolio (stocks and crypto)

**Renders:**
- Portfolio summary cards:
  - Total invested value
  - Unrealized gains/losses
  - Portfolio allocation
- Holdings table:
  - Symbol and name
  - Shares owned
  - Average purchase price
  - Current price
  - Change percentage (with color coding)
  - Current value
- Two sections: Stocks and Cryptocurrency
- Add investment form

**Data Fields:**
- For each holding:
  - `symbol` - Ticker
  - `name` - Company/asset name
  - `shares` - Quantity owned
  - `avgPrice` - Cost basis
  - `currentPrice` - Market price
  - `change` - % change from cost

### 5. **GoalsView** (goals.js)
**Purpose:** Track financial goals with progress

**Renders:**
- Goal creation form
- Goals list with:
  - Goal name and description
  - Target amount
  - Current saved amount
  - Progress bar
  - Target date
  - Status indicators
- Goal achievement metrics

### 6. **SubscriptionsView** (subscriptions.js)
**Purpose:** Track recurring subscriptions and payments

**Renders:**
- Subscription list with:
  - Service name
  - Monthly cost
  - Billing cycle (monthly, yearly, etc.)
  - Next renewal date
  - Cancel button
- Monthly subscription cost total
- Add subscription form
- Subscription categories

### 7. **TradingView** (trading.js)
**Purpose:** Virtual trading simulator with paper money

**Features:**
- Practice trading environment
- Virtual account with starting capital
- Buy/sell stocks with simulated prices
- Trade history
- Portfolio tracking

### 8. **InsightsView** (insights.js)
**Purpose:** AI-powered financial recommendations

**Displays:**
- Spending pattern analysis
- Budget recommendations
- Savings opportunities
- Investment suggestions
- Financial health score

### 9. **ReportsView** (reports.js)
**Purpose:** Generate financial reports and analytics

**Includes:**
- Expense breakdown by category (pie chart)
- Income vs expense trends (line chart)
- Monthly comparison charts
- Downloadable reports
- Custom date range selection

### 10. **SettingsView** (settings.js)
**Purpose:** User preferences and account settings

**Options:**
- Theme selection (Dark Pro / Light Professional)
- Currency preference
- Account information
- Notification preferences
- Data export/import
- Password change

### 11. **LoginView** (login.js)
**Purpose:** User authentication entry point

**Features:**
- Professional login form
- Email and password validation
- "Remember me" checkbox
- Link to registration page
- Link to password recovery
- Brand/feature showcase panel

**Key Functions:**

#### `render()`
- Returns HTML with two-panel layout:
  - Left: Feature showcase
  - Right: Login form
- Adds auth-mode class to app shell
- Displays features:
  - Smart Analytics
  - Goal Tracking
  - Learn & Grow
  - Gamified Rewards

#### `handleLogin(event)`
- Prevents form submission
- Validates email and password:
  - Email must be valid format
  - Password must not be empty
- Shows loading state on button
- Makes POST to `assets/api/login.php`
- On success:
  - Saves user to localStorage
  - Sets `smartmoney_auth` flag
  - Redirects to dashboard
- On error:
  - Shows error toast
  - Restores button state

### 12. **RegisterView** (register.js)
**Purpose:** New user account creation

**Form Fields:**
- Full name (minimum 2 characters)
- Email (valid format required)
- Password (minimum 6 characters)
- Password confirmation (must match)
- Avatar initials (auto-generated from name)

**Validation:**
- All fields required
- Email must be unique
- Passwords must match
- Strong password requirements

**On Success:**
- Creates user account
- Automatically logs in
- Redirects to dashboard

**Link:** Link to login page for existing users

### 13. **ForgotPasswordView** (forgot_password.js)
**Purpose:** Password recovery flow

**Features:**
- Email-based password reset
- Security questions option
- Reset link generation
- Password creation form
- Confirmation message

---

## 🔌 Backend API

All APIs are in `assets/api/` directory. Each endpoint handles specific data operations.

### 1. **db.php** - Database Connection
**Purpose:** Establish and manage database connection

**Configuration:**
```php
$host = 'localhost';
$db_name = 'money';
$username = 'root';
$password = '';
```

**Connection Details:**
- Uses PDO (PHP Data Objects)
- MySQL socket for XAMPP
- UTF-8 charset
- Exception mode error handling
- Auto-associative array fetch mode

**Error Handling:**
- Catches PDOException
- Returns JSON error response
- HTTP 500 status on failure

**CORS Headers:**
- Allows cross-origin requests
- Handles preflight OPTIONS requests

### 2. **login.php** - User Authentication
**Purpose:** Authenticate user and return session

**Endpoint:** `POST /assets/api/login.php`

**Request Body:**
```json
{
  "email": "tejas@example.com",
  "password": "password"
}
```

**Process:**
1. Validates email and password provided
2. Queries users table for email
3. Verifies password using `password_verify()`
4. Returns user data on success

**Response (Success - 200):**
```json
{
  "id": 1,
  "name": "Tejas Gandhi",
  "email": "tejas@example.com",
  "plan": "Premium",
  "avatar": "TG",
  "currency": "$"
}
```

**Response (Errors):**
- **401 (Unauthorized):** Invalid password
- **404 (Not Found):** User email not found
- **400 (Bad Request):** Missing email or password

### 3. **register.php** - User Registration
**Purpose:** Create new user account

**Endpoint:** `POST /assets/api/register.php`

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "avatar_initials": "JD"
}
```

**Validation:**
- All fields required
- Email must be unique (checks existing records)
- Password hashed with `password_hash()`
- Default plan: "Free"

**Response (Success - 201):**
```json
{
  "id": 2,
  "message": "User registered successfully",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "Free",
    "avatar": "JD"
  }
}
```

**Response (Errors):**
- **400:** Email already exists
- **400:** Missing required fields

### 4. **transactions.php** - Transaction Management
**Purpose:** CRUD operations for financial transactions

**Endpoints:**
- `GET` - Retrieve all transactions
- `POST` - Create new transaction
- `PUT` - Update transaction
- `DELETE` - Remove transaction

**GET Request:**
```
GET /assets/api/transactions.php
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Apple Store",
    "category": "Shopping",
    "date": "2024-01-15",
    "amount": -1299.00,
    "type": "expense",
    "icon": "fa-brands fa-apple"
  },
  ...
]
```

**POST Request:**
```json
{
  "title": "Grocery Shopping",
  "category": "Food",
  "date": "2024-01-15",
  "amount": -125.50,
  "type": "expense"
}
```

**Database Table:** `transactions`
- `id` - Primary key
- `user_id` - Foreign key to users
- `title` - Transaction description
- `category` - Expense/income category
- `date` - ISO date
- `amount` - Numeric amount (negative for expenses)
- `type` - "income" or "expense"
- `created_at` - Timestamp

### 5. **budget.php** - Budget Management
**Purpose:** Create and track spending budgets

**Endpoints:**
- `GET` - Retrieve all budgets
- `POST` - Create new budget
- `PUT` - Update budget
- `DELETE` - Remove budget

**GET Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "category": "Shopping",
    "limit_amount": 500.00,
    "spent": 350.00,
    "month": "2024-01",
    "color": "var(--color-primary)"
  },
  ...
]
```

**POST Request:**
```json
{
  "category": "Entertainment",
  "limit_amount": 150.00,
  "color": "var(--color-secondary)"
}
```

**Database Table:** `budgets`
- `id` - Primary key
- `user_id` - Foreign key
- `category` - Category name
- `limit_amount` - Monthly budget limit
- `spent` - Amount spent this month
- `month` - Budget period (YYYY-MM)
- `color` - UI color variable

### 6. **goals.php** - Financial Goals
**Purpose:** Create and monitor financial goals

**Endpoints:**
- `GET` - List all goals
- `POST` - Create goal
- `PUT` - Update goal progress
- `DELETE` - Remove goal

**GET Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Save for Car",
    "description": "Buy a used car",
    "target_amount": 15000.00,
    "current_amount": 8500.00,
    "target_date": "2024-12-31",
    "status": "in_progress",
    "priority": "high"
  },
  ...
]
```

**Progress Calculation:**
```
progress_percentage = (current_amount / target_amount) * 100
```

### 7. **subscriptions.php** - Recurring Payments
**Purpose:** Track subscription services and recurring payments

**GET Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Netflix",
    "amount": 15.99,
    "billing_cycle": "monthly",
    "next_renewal": "2024-02-15",
    "category": "Entertainment",
    "status": "active"
  },
  ...
]
```

**Billing Cycles:** monthly, yearly, quarterly, biweekly

**Database Table:** `subscriptions`
- `id` - Primary key
- `user_id` - Foreign key
- `name` - Service name
- `amount` - Cost per billing cycle
- `billing_cycle` - Frequency
- `next_renewal` - Next payment date
- `category` - Expense category
- `status` - "active", "paused", "cancelled"
- `start_date` - Subscription start

### 8. **reports.php** - Financial Reports
**Purpose:** Generate analytics and reports

**Request Parameters:**
```
GET /assets/api/reports.php?type=monthly&month=2024-01
GET /assets/api/reports.php?type=category&period=yearly
```

**Report Types:**
- `monthly` - Monthly breakdown
- `category` - By category analysis
- `trending` - Trend analysis
- `comparison` - Month-over-month comparison

**Response Example (Monthly):**
```json
{
  "period": "2024-01",
  "total_income": 6200.00,
  "total_expense": 2450.00,
  "savings": 3750.00,
  "categories": {
    "Food": 450.00,
    "Transportation": 200.00,
    "Entertainment": 150.00,
    ...
  },
  "average_daily_spending": 79.03
}
```

### 9. **check_tables.php** - Database Verification
**Purpose:** Verify all required tables exist

**Endpoint:** `GET /assets/api/check_tables.php`

**Checks for Tables:**
- `users` - User accounts
- `transactions` - Financial transactions
- `budgets` - Budget definitions
- `goals` - Financial goals
- `subscriptions` - Recurring payments
- `portfolio` - Investment holdings
- `chat` - Chat messages

**Response:**
```json
{
  "status": "ok",
  "tables_found": 7,
  "missing_tables": [],
  "database": "money"
}
```

---

## 🗄️ Database Schema

### **users** Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_initials VARCHAR(5),
  plan_type VARCHAR(50) DEFAULT 'Free',
  currency VARCHAR(5) DEFAULT '$',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **transactions** Table
```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id, date)
);
```

### **budgets** Table
```sql
CREATE TABLE budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  limit_amount DECIMAL(10,2) NOT NULL,
  spent DECIMAL(10,2) DEFAULT 0,
  month VARCHAR(7),
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id, month)
);
```

### **goals** Table
```sql
CREATE TABLE goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  status ENUM('not_started', 'in_progress', 'completed', 'failed') DEFAULT 'not_started',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id, status)
);
```

### **subscriptions** Table
```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_cycle ENUM('monthly', 'yearly', 'quarterly', 'biweekly'),
  next_renewal DATE,
  category VARCHAR(100),
  status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
  start_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id, next_renewal)
);
```

### **portfolio** Table
```sql
CREATE TABLE portfolio (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  asset_type ENUM('stock', 'crypto', 'etf') NOT NULL,
  quantity DECIMAL(18,8) NOT NULL,
  avg_price DECIMAL(12,2) NOT NULL,
  current_price DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, symbol, asset_type)
);
```

---

## 🚀 Installation & Setup

### Prerequisites
- XAMPP (with Apache, MySQL, PHP)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of web applications

### Step-by-Step Setup

#### 1. **Database Setup**
```bash
# Open phpMyAdmin
http://localhost/phpmyadmin

# Import money.sql
1. Click "Import" tab
2. Select money.sql file
3. Click "Go"
```

#### 2. **File Placement**
```bash
# Copy project to XAMPP document root
cp -r r1 /Applications/XAMPP/xamppfiles/htdocs/
```

#### 3. **Start Services**
- Open XAMPP Control Panel
- Start Apache Web Server
- Start MySQL Database

#### 4. **Access Application**
```
http://localhost/r1/
```

#### 5. **Default Credentials**
```
Email: tejas@example.com
Password: password
```

### Configuration

**Database Connection** (`assets/api/db.php`):
```php
$host = 'localhost';
$db_name = 'money';
$username = 'root';
$password = '';
```

**Theme Selection** (stored in localStorage):
```
Key: smartmoney_theme
Values: "dark-pro" or "light-professional"
```

**Authentication Flag** (stored in localStorage):
```
Key: smartmoney_auth
Value: User object (JSON string)
```

---

## 📖 Usage Guide

### Adding a Transaction

1. Click **Transactions** in sidebar
2. Click **Add New** button
3. Fill in form:
   - **Title:** Transaction name
   - **Category:** Select from dropdown
   - **Date:** Pick date from calendar
   - **Amount:** Enter number (auto-negative for expenses)
   - **Type:** Income or Expense
4. Click **Save Transaction**
5. Success toast appears, transaction added to list

### Creating a Budget

1. Click **Budgets** in sidebar
2. Click **New Budget** button
3. Enter details:
   - **Category:** Budget category name
   - **Monthly Limit:** Maximum spend amount
4. Click **Save Budget**
5. Budget appears in list with progress tracking
6. As you add transactions, progress bar updates

### Setting Financial Goals

1. Click **Goals** in sidebar
2. Click **Create Goal** button
3. Define goal:
   - **Title:** Goal name (e.g., "Buy House")
   - **Target Amount:** Goal amount
   - **Target Date:** When to achieve
   - **Description:** Optional details
   - **Priority:** Low/Medium/High
4. Click **Save Goal**
5. Track progress as you contribute funds

### Viewing Investment Portfolio

1. Click **Investments** in sidebar
2. View holdings in two sections:
   - **Stocks:** Individual company shares
   - **Crypto:** Cryptocurrency holdings
3. Each showing:
   - Current price and change percentage
   - Shares owned and total value
   - Color-coded gains (green) and losses (red)

### Changing Theme

1. Click **Settings** in sidebar
2. Select theme:
   - **Dark Pro:** Dark background with neon accents
   - **Light Professional:** Light background
3. Theme applies immediately
4. Preference saved to localStorage

### Generating Reports

1. Click **Reports** in sidebar
2. Select report type:
   - **Monthly:** Current month breakdown
   - **Trending:** Historical trends
   - **By Category:** Spending by type
3. Choose date range
4. View charts and export option

---

## 🔍 Function Reference

### Global Objects & Methods

#### **App Object**
```javascript
App.init()                  // Initialize application
App.checkAuth()            // Verify authentication
App.logout()               // Clear session, redirect to login
App.loadProfile()          // Load user info to sidebar
App.setupRoutes()          // Register all view routes
App.setupTheme()           // Initialize theme system
App.setupEventListeners()  // Attach global listeners
App.loadScript(path)       // Dynamically load JS files
```

#### **Router Object**
```javascript
Router.init()              // Initialize routing system
Router.add(path, handler)  // Register new route
Router.handleRoute()       // Process hash change event
```

#### **ViewUtils Object**
```javascript
ViewUtils.formatCurrency(amount)    // Format as currency
ViewUtils.formatDate(dateString)    // Format as date
ViewUtils.showToast(message, type)  // Show notification
ViewUtils.showError(container, title, msg)      // Error display
ViewUtils.showLoading(container, msg)           // Loading state
ViewUtils.isValidEmail(email)       // Validate email
ViewUtils.isValidPassword(password) // Validate password
ViewUtils.apiCall(endpoint, options) // HTTP request
```

#### **MoneyDB Object**
```javascript
MoneyDB.init()             // Initialize data storage
MoneyDB.get()              // Get full database
MoneyDB.save(data)         // Save to localStorage
MoneyDB.getUser()          // Get user profile
MoneyDB.getTransactions()  // Get all transactions
MoneyDB.addTransaction(tx) // Create transaction
MoneyDB.getPortfolio()     // Get investments
MoneyDB.getStats()         // Get financial stats
MoneyDB.getBudgets()       // Get all budgets
MoneyDB.addBudget(budget)  // Create budget
```

#### **View Objects**
```javascript
DashboardView.render()     // Render dashboard
TransactionsView.render()  // Render transactions list
BudgetView.render()        // Render budget manager
InvestmentsView.render()   // Render portfolio
GoalsView.render()         // Render goals tracker
SubscriptionsView.render() // Render subscriptions
TradingView.render()       // Render trading simulator
InsightsView.render()      // Render AI insights
ReportsView.render()       // Render reports
SettingsView.render()      // Render settings
LoginView.render()         // Render login form
LoginView.handleLogin()    // Process login
RegisterView.render()      // Render signup form
RegisterView.handleRegister() // Process signup
```

---

## 🎨 Theme System

### Available Themes

#### Dark Pro (default)
- Dark background (#0a0e27)
- Neon primary blue (#00d9ff)
- High contrast text
- Professional appearance
- Better for night use

#### Light Professional
- Light background (#ffffff)
- Professional blue (#0066cc)
- Good readability
- Business-appropriate
- Better for day use

### Theme Colors (CSS Variables)

```css
--bg-primary         /* Main background */
--bg-card           /* Card background */
--bg-card-hover     /* Card hover state */
--border-color      /* Border color */
--text-primary      /* Main text color */
--text-secondary    /* Secondary text color */
--color-primary     /* Primary accent */
--color-secondary   /* Secondary accent */
--color-success     /* Success green */
--color-warning     /* Warning orange */
--color-danger      /* Danger red */
--color-accent      /* Special accent */
```

---

## 🐛 Troubleshooting

### Authentication Issues
- **Problem:** Can't login
- **Solution:** Check browser localStorage, clear and refresh
- **Check:** Verify database has users table

### Data Not Saving
- **Problem:** Changes disappear on reload
- **Solution:** Check browser localStorage is enabled
- **Check:** Verify API endpoints are accessible

### API Errors
- **Problem:** 500 errors from backend
- **Solution:** Check database connection in db.php
- **Check:** Verify MySQL is running in XAMPP

### Theme Not Changing
- **Problem:** Theme switch doesn't work
- **Solution:** Hard refresh browser (Cmd+Shift+R)
- **Check:** Check localStorage for theme key

### Empty Data
- **Problem:** No transactions/budgets showing
- **Solution:** Run money.sql to reset database
- **Check:** Verify MoneyDB.init() creates seed data

---

## 📝 Notes for Developers

### Code Patterns Used

**Module Pattern:**
```javascript
const ModuleName = {
  property: value,
  method() { ... }
};
```

**Async/Await:**
```javascript
async function loadData() {
  try {
    const data = await ViewUtils.apiCall(endpoint);
    // Process data
  } catch (error) {
    ViewUtils.showToast(error.message, 'error');
  }
}
```

**Event Delegation:**
```javascript
document.addEventListener('click', (e) => {
  if (e.target.matches('.button-class')) {
    // Handle click
  }
});
```

### Best Practices

1. **Always use ViewUtils.apiCall()** for API requests
2. **Show loading states** during async operations
3. **Validate form input** before submission
4. **Use ViewUtils.showToast()** for user feedback
5. **Store sensitive data** properly (never in localStorage for production)
6. **Handle errors gracefully** with try-catch blocks
7. **Use semantic HTML** for accessibility
8. **Lazy load views** for performance

---

## 🔒 Security Considerations

### Current Implementation
- localStorage for demo data (not secure)
- Session-based authentication
- Password hashing with PHP password_hash()
- CORS headers configured

### Production Recommendations
1. Use secure sessions instead of localStorage
2. Implement HTTPS/SSL
3. Add CSRF protection
4. Validate all inputs on backend
5. Use prepared statements (already done with PDO)
6. Implement rate limiting
7. Add user permission checks
8. Sanitize all output

---

## 📊 Performance Optimizations

### Current Features
- Lazy loading of view scripts
- localStorage caching
- CSS animations with hardware acceleration
- Minimal DOM manipulation

### Recommended Improvements
1. Implement service workers for offline support
2. Add image compression
3. Minify CSS and JavaScript
4. Implement pagination for large datasets
5. Add database indexes (partially done)
6. Cache API responses

---

## 🤝 Contributing

### Adding New Features

1. **Create View Component:**
   ```javascript
   window.NewFeatureView = {
     render() {
       return `<html>...</html>`;
     }
   };
   ```

2. **Register Route in app.js:**
   ```javascript
   Router.add('newfeature', async () => {
     await this.loadScript('assets/js/views/newfeature.js');
     return window.NewFeatureView.render();
   });
   ```

3. **Add to Sidebar Navigation in index.html**

4. **Create Backend API if needed in assets/api/**

---

## 📄 License & Credits

**SmartMoney X** © 2024
- Original concept and development
- Designed for comprehensive financial management
- Continuously improved with community feedback

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review code comments
3. Check browser console for errors
4. Verify database and server setup

---

**Last Updated:** February 1, 2026
**Version:** 1.0.0
**Status:** Production Ready

