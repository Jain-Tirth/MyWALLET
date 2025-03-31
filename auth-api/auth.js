const express = require('express');
const { Client, Account, ID, Query, Databases } = require('appwrite');
const bcrypt = require('bcryptjs');
const cors = require('cors');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Initialize Appwrite
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID);

const users = new Account(client);
const databases = new Databases(client);

// Database and Collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID;
const TOKENS_COLLECTION_ID = process.env.APPWRITE_TOKEN_COLLECTION_ID;
const ACCOUNTS_COLLECTION_ID = process.env.APPWRITE_ACCOUNT_COLLECTION_ID;

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// User Routes
// Register a new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        // Check if email already exists
        const existingUsers = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('email', email)]
        );

        if (existingUsers.documents.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if username already exists
        const existingUsernames = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('username', username)]
        );

        if (existingUsernames.documents.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user in Appwrite Database
        const newUser = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            ID.unique(),
            {
                username,
                email,
                password: hashedPassword
            }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                account_id: newUser.$id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const userList = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('email', email)]
        );

        if (userList.documents.length === 0) {
            console.error('Database is Empty');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = userList.documents[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false, 
                message: 'Invalid credentials'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.$id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
});

// Token Routes
// Add new token
app.post('/api/tokens', async (req, res) => {
    try {
        const { name, address, symbol } = req.body;

        if (!name || !address || !symbol) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, address, and symbol'
            });
        }

        const newToken = await databases.createDocument(
            DATABASE_ID,
            TOKENS_COLLECTION_ID,
            ID.unique(),
            { name, address, symbol }
        );

        res.status(201).json({
            success: true,
            message: 'Token added successfully',
            token: newToken
        });
    } catch (error) {
        console.error('Token creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during token creation',
            error: error.message
        });
    }
});

// Get all tokens
app.get('/api/tokens', async (req, res) => {
    try {
        const tokens = await databases.listDocuments(
            DATABASE_ID,
            TOKENS_COLLECTION_ID
        );

        res.status(200).json({
            success: true,
            tokens: tokens.documents
        });
    } catch (error) {
        console.error('Token fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tokens',
            error: error.message
        });
    }
});

// Account Routes
// Add new account
app.post('/api/accounts', async (req, res) => {
    try {
        const { privateKey, address } = req.body;

        if (!privateKey || !address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide privateKey and address'
            });
        }

        const newAccount = await databases.createDocument(
            DATABASE_ID,
            ACCOUNTS_COLLECTION_ID,
            ID.unique(),
            { privateKey, address }
        );

        res.status(201).json({
            success: true,
            message: 'Account added successfully',
            account: newAccount
        });
    } catch (error) {
        console.error('Account creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during account creation',
            error: error.message
        });
    }
});

// Get all accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await databases.listDocuments(
            DATABASE_ID,
            ACCOUNTS_COLLECTION_ID
        );

        res.status(200).json({
            success: true,
            accounts: accounts.documents
        });
    } catch (error) {
        console.error('Account fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching accounts',
            error: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
