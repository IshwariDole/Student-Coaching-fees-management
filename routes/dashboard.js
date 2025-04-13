const express = require('express');
const router = express.Router();

// Middleware to protect dashboard routes
function isAuthenticated(req, res, next) {
    if (req.session.admin) return next();
    res.redirect('/auth/login');
}
// Dashboard Route
router.get('/', (req, res) => {
    res.render('dashboard'); // Ensure dashboard.ejs exists in "views/"
});
module.exports = router;
