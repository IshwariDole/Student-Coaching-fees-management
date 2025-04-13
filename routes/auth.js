const express = require('express');
const router = express.Router();

// Dummy admin credentials
const ADMIN = { username: 'admin', password: 'password' };

// Admin Login Page
router.get('/login', (req, res) => {
    res.render('index'); // Render the login page
});

// Handle Admin Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN.username && password === ADMIN.password) {
        req.session.admin = username; // Store admin in session
        console.log('🔹 Session Created:', req.session); // Debugging
        res.redirect('/dashboard');
    } else {
        res.render('index', { error: 'Invalid Credentials' }); // Show error message on login page
    }
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    console.log('🔹 Checking Session:', req.session); // Debugging
    if (req.session.admin) {
        return next(); // Allow access
    }
    res.redirect('/auth/login'); // Redirect if not logged in
};

// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = { router, isAuthenticated }; // Exporting authentication middleware
