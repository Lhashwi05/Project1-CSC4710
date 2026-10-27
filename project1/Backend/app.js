// Backend: application services, accessible by URLs.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { hashPassword, verifyPassword } = require('./passwords');
const session = require('express-session');
const { randomBytes } = require('node:crypto');

dotenv.config();

const app = express();
const dbService = require('./dbService');

// Allow requests with session cookies from the Apache frontend.
app.use(cors({
    origin: 'http://localhost',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Store sign-in sessions in memory for this local project.
app.use(session({
    name: 'project1.sid',
    secret: randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 60 * 60 * 1000
    }
}));

// Register a new user.
app.post('/register', async (request, response) => {
    const user = request.body || {};
    const names = [user.username, user.firstname, user.lastname];

    if (names.some(value =>
        typeof value !== 'string' ||
        !value.trim() ||
        value.trim().length > 50
    )) {
        return response.status(400).json({
            error: 'Username, first name, and last name must be 1–50 characters.'
        });
    }

    if (typeof user.password !== 'string' ||
        user.password.length < 8 ||
        user.password.length > 128) {
        return response.status(400).json({
            error: 'Password must be 8–128 characters.'
        });
    }

    const salary = typeof user.salary === 'number'
        ? String(user.salary) : user.salary;

    const age = typeof user.age === 'number'
        ? String(user.age) : user.age;

    if (typeof salary !== 'string' ||
        !/^\d{1,10}(\.\d{1,2})?$/.test(salary) ||
        typeof age !== 'string' ||
        !/^\d{1,3}$/.test(age) ||
        Number(age) > 130) {
        return response.status(400).json({
            error: 'Enter a nonnegative salary with up to two decimal places and a whole-number age from 0 to 130.'
        });
    }

    try {
        user.username = user.username.trim();
        user.firstname = user.firstname.trim();
        user.lastname = user.lastname.trim();

        const passwordHash = await hashPassword(user.password);
        const db = dbService.getDbServiceInstance();

        await db.registerUser(user, passwordHash);

        return response.status(201).json({
            message: 'Registration successful.',
            username: user.username
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return response.status(409).json({
                error: 'That username is already registered.'
            });
        }

        console.error('Registration failed:', error.code || error.message);

        return response.status(500).json({
            error: 'Registration failed. Check the backend terminal.'
        });
    }
});

// Verify credentials and create a signed-in session.
app.post('/login', async (request, response) => {
    const { username, password } = request.body || {};

    if (typeof username !== 'string' ||
        !username.trim() ||
        username.trim().length > 50 ||
        typeof password !== 'string' ||
        !password ||
        password.length > 128) {
        return response.status(400).json({
            error: 'Enter a valid username and password.'
        });
    }

    try {
        const db = dbService.getDbServiceInstance();
        const user = await db.findUserByUsername(username.trim());
        
        // Use the same message for an unknown username or incorrect password.
        if (!user || !(await verifyPassword(password, user.password))) {
            return response.status(401).json({
                error: 'Incorrect username or password.'
            });
        }

        // Create a fresh session ID after authentication succeeds.
        await new Promise((resolve, reject) => {
            request.session.regenerate(error => {
                if (error) return reject(error);
                resolve();
            });
        });

        await db.recordSignIn(user.username);

        // Keep the password hash out of the session and browser response.
        request.session.user = {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname
        };

        await new Promise((resolve, reject) => {
            request.session.save(error => {
                if (error) return reject(error);
                resolve();
            });
        });

        return response.json({
            message: 'Sign-in successful.',
            user: request.session.user
        });
    } catch (error) {
        console.error('Sign-in failed:', error.stack);

        return response.status(500).json({
            error: 'Sign-in failed. Check the backend terminal.'
        });
    }
});

app.get('/users/search', async (request, response) => {
    // Only signed-in users can search the directory.
    if (!request.session.user) {
        return response.status(401).json({
            error: 'Sign in before searching users.'
        });
    }

    const { firstname = '', lastname = '' } = request.query;

    if (typeof firstname !== 'string' ||
        typeof lastname !== 'string') {
        return response.status(400).json({
            error: 'First and last names must be text.'
        });
    }

    const first = firstname.trim();
    const last = lastname.trim();

    if ((!first && !last) || first.length > 50 || last.length > 50) {
        return response.status(400).json({
            error: 'Enter a first name, last name, or both, using up to 50 characters each.'
        });
    }

    try {
        const db = dbService.getDbServiceInstance();
        const results = await db.searchUsersByName(first, last);

        return response.json({ data: results });
    } catch (error) {
        console.error('Search failed:', error.code || error.message);

        return response.status(500).json({
            error: 'Search failed. Check the backend terminal.'
        });
    }
});

// Existing starter demo: insert a name.
app.post('/insert', (request, response) => {
    const { name } = request.body;
    const db = dbService.getDbServiceInstance();

    db.insertNewName(name)
        .then(data => response.json({ data }))
        .catch(error => console.log(error));
});

// Existing starter demo: retrieve names.
app.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();

    db.getAllData()
        .then(data => response.json({ data }))
        .catch(error => console.log(error));
});

// Existing starter demo: search names.
app.get('/search/:name', (request, response) => {
    const { name } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = name === 'all'
        ? db.getAllData()
        : db.searchByName(name);

    result
        .then(data => response.json({ data }))
        .catch(error => console.log(error));
});

// Existing starter demo: update a name.
app.patch('/update', (request, response) => {
    const { id, name } = request.body;
    const db = dbService.getDbServiceInstance();

    db.updateNameById(id, name)
        .then(() => response.json({ success: true }))
        .catch(error => console.log(error));
});

// Existing starter demo: delete a name.
app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;
    const db = dbService.getDbServiceInstance();

    db.deleteRowById(id)
        .then(() => response.json({ success: true }))
        .catch(error => console.log(error));
});

// Existing starter debugging endpoints.
app.post('/debug', (request, response) => {
    console.log(request.body.debug);
    return response.json({ success: true });
});

app.get('/testdb', (request, response) => {
    const db = dbService.getDbServiceInstance();

    db.deleteById('14')
        .then(data => response.json({ data }))
        .catch(error => console.log(error));
});

app.listen(5050, () => {
    console.log('I am listening on the fixed port 5050.');
});