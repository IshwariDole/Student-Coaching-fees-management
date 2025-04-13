const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const connectDB = require('./config/db');
const { router: authRoutes, isAuthenticated } = require('./routes/auth');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false, // Avoid storing empty sessions
    cookie: { secure: false } // Change to true if using HTTPS
}));

// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', isAuthenticated, require('./routes/dashboard'));
app.use('/students', isAuthenticated, require('./routes/students'));

// Redirect to login page
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// Logout Route
app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
