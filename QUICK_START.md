# SmartMoney X - Quick Start & Usage Guide

## Getting Started

### 1. Database Setup
Run the `money.sql` file in phpMyAdmin to create the database with all tables:
```sql
-- Import the money.sql file
-- This will create the 'money' database with all required tables
```

### 2. Server Setup
- Make sure XAMPP is running
- Place this project in: `/Applications/XAMPP/xamppfiles/htdocs/r1/`
- Access via: `http://localhost/r1/`

### 3. Default Login Credentials
```
Email: tejas@example.com
Password: password
```

---

## New Features & Improvements

### 🎯 Form Validation
All forms now have built-in validation:
- **Email:** Must be valid format (user@domain.com)
- **Password:** Minimum 6 characters
- **Password Confirm:** Must match password field
- **Name:** Minimum 2 characters
- **Currency Fields:** Accepts decimal values

### 📢 Toast Notifications
Instead of alerts, you'll see elegant toast notifications:
- **Success:** Green border, appears for 3 seconds
- **Error:** Red border, appears for 3 seconds
- **Info:** Blue border, appears for 3 seconds

Example:
```javascript
ViewUtils.showToast('Transaction added!', 'success');
ViewUtils.showToast('Error loading data', 'error');
```

### 🔧 Using ViewUtils

#### API Calls
```javascript
// Safe API call with error handling
try {
    const data = await ViewUtils.apiCall('assets/api/goals.php', {
        method: 'POST',
        body: { name: 'New Goal', target: 5000 }
    });
} catch (error) {
    ViewUtils.showToast(error.message, 'error');
}
```

#### Formatting
```javascript
// Currency formatting
ViewUtils.formatCurrency(1500.50, '$'); // Returns: $1,500.50

// Date formatting
ViewUtils.formatDate('2024-01-15'); // Returns: 1/15/2024
ViewUtils.formatDate('2024-01-15', 'long'); // Returns: Monday, January 15, 2024
```

#### Validation
```javascript
if (!ViewUtils.isValidEmail(email)) {
    ViewUtils.showToast('Invalid email', 'error');
}

if (!ViewUtils.isValidPassword(password)) {
    ViewUtils.showToast('Password too short', 'error');
}
```

### 📊 View Components

#### Dashboard
- Overview of financial health
- Quick actions for common tasks
- Recent transactions display
- Market watchlist

#### Transactions
- Add/delete transactions
- View transaction history
- Filter by category
- Proper amount formatting

#### Goals
- Create financial goals
- Track progress with visual progress bars
- Set target dates and amounts
- Edit/delete goals

#### Subscriptions
- Track recurring expenses
- Monthly and yearly cost calculations
- Brand-aware color coding
- Status indicators (Active/Cancelled)

#### Settings
- Toggle between 3 themes (Dark Pro, Light Professional, Glassmorphism)
- View/edit profile information
- Reset database to default

---

## API Endpoints

### Login
```
POST /assets/api/login.php
Body: { email, password }
Response: { status, user: { id, name, email, plan, avatar } }
```

### Register
```
POST /assets/api/register.php
Body: { name, email, password }
Response: { status, user: { id, name, email, plan, avatar } }
```

### Goals
```
GET /assets/api/goals.php         - Get all goals
POST /assets/api/goals.php        - Create goal
PUT /assets/api/goals.php         - Update goal
DELETE /assets/api/goals.php?id=X - Delete goal
```

### Subscriptions
```
GET /assets/api/subscriptions.php         - Get all subscriptions
POST /assets/api/subscriptions.php        - Create subscription
PUT /assets/api/subscriptions.php         - Update subscription
DELETE /assets/api/subscriptions.php?id=X - Delete subscription
```

---

## Keyboard Shortcuts

- **Cmd+K (Mac) / Ctrl+K (Win):** Search (coming in next version)
- **Escape:** Close modals

---

## Theme System

Three available themes:
1. **Dark Pro** - Professional dark theme (default)
2. **Light Professional** - Clean light theme for daytime use
3. **Glassmorphism** - Modern frosted glass effect

Change theme in Settings or use the moon icon in the header.

---

## Error Handling

### API Errors
All API errors now show user-friendly messages:
```
Instead of: "HTTP 500: Internal Server Error"
You see:    "Failed to load goals" with a retry button
```

### Form Errors
Validation errors appear as toast notifications:
```
"Please enter a valid email address"
"Password must be at least 6 characters long"
```

### Loading States
All async operations show a spinner while loading:
- Transactions loading
- Goals loading
- Subscriptions loading

---

## Troubleshooting

### "Failed to load [view]"
1. Check internet connection
2. Verify API endpoints are running
3. Check browser console for detailed errors
4. Click "Try Again" button

### Logout button not appearing
The logout button is now in the sidebar navigation at the bottom.

### Theme not persisting
- Check localStorage is enabled
- Try a different theme and switch back
- Clear browser cache and reload

### Form validation errors
- Make sure you're entering data in the correct format
- Check required fields are filled
- Passwords must be 6+ characters

---

## Code Examples

### Adding a Transaction
```javascript
const newTx = {
    title: "Groceries",
    amount: -45.50,
    category: "Food",
    type: "expense",
    date: new Date().toISOString(),
    icon: "fa-solid fa-basket-shopping"
};

MoneyDB.addTransaction(newTx);
ViewUtils.showToast('Transaction added!', 'success');
```

### Displaying Error State
```javascript
const container = document.getElementById('data-container');
ViewUtils.showError(
    container,
    'Failed to Load Data',
    'Please check your connection and try again'
);
```

### Showing Loading State
```javascript
const container = document.getElementById('data-container');
ViewUtils.showLoading(container, 'Loading transactions...');
// Then load your data
```

### Empty State
```javascript
const container = document.getElementById('data-container');
if (items.length === 0) {
    ViewUtils.showEmpty(container, 'No transactions yet', 'fa-inbox');
}
```

---

## File Structure

```
r1/
├── index.html                 # Main HTML
├── money.sql                 # Database setup
├── IMPROVEMENTS_REPORT.md    # Detailed improvements
├── QUICK_START.md           # This file
├── assets/
│   ├── api/
│   │   ├── db.php          # Database connection
│   │   ├── login.php       # Login endpoint
│   │   ├── register.php    # Register endpoint
│   │   ├── goals.php       # Goals CRUD
│   │   ├── subscriptions.php # Subscriptions CRUD
│   │   └── ... (other endpoints)
│   ├── css/
│   │   ├── main.css        # Base styles (IMPROVED)
│   │   ├── animations.css  # Animations (ENHANCED)
│   │   ├── components.css  # Component styles
│   │   ├── layout.css      # Layout styles
│   │   ├── auth.css        # Auth pages
│   │   ├── themes.css      # Theme variables
│   │   └── notifications.css
│   ├── js/
│   │   ├── utils.js        # NEW: Utility functions
│   │   ├── app.js          # Main app (FIXED)
│   │   ├── router.js       # SPA router
│   │   ├── money_db.js     # Local database
│   │   └── views/
│   │       ├── dashboard.js
│   │       ├── transactions.js   # IMPROVED
│   │       ├── goals.js         # FIXED
│   │       ├── subscriptions.js  # FIXED
│   │       ├── login.js         # IMPROVED
│   │       ├── register.js      # IMPROVED
│   │       ├── settings.js
│   │       ├── investments.js
│   │       ├── reports.js
│   │       ├── trading.js
│   │       ├── insights.js
│   │       └── ... (other views)
│   └── images/
└── README.md (if exists)
```

---

## Support & Next Steps

### To Continue Development:
1. Review `IMPROVEMENTS_REPORT.md` for detailed technical changes
2. Look at `utils.js` for available helper functions
3. Use `ViewUtils` functions in new views
4. Follow the validation patterns in login.js and register.js
5. Implement proper API calls with error handling

### Common Tasks:

**Add a new view:**
1. Create `assets/js/views/myview.js`
2. Define `window.MyViewView = { render() { ... } }`
3. Register in `app.js` setupRoutes()
4. Add navigation link to `index.html` sidebar

**Add an API endpoint:**
1. Create new file in `assets/api/`
2. Connect to database via `db.php`
3. Return JSON responses
4. Call with `ViewUtils.apiCall()`

---

## Version Info
- **Current Version:** 1.1
- **Last Updated:** February 1, 2026
- **Status:** Ready for Production (with backend API)

---

Enjoy using SmartMoney X! 🚀
