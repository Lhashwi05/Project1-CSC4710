// registration UI: send form data to POST /register and display the result.
// backend validates input, hashes the password, and saves the account.


const registerForm = document.querySelector('#register-form');

registerForm.addEventListener('submit', async (event) => {
    // keep the user on this page instead of opening the form's action URL.
    event.preventDefault();

    const message = document.querySelector('#register-message');
    const button = registerForm.querySelector('button[type="submit"]');
    // turn inputs' name/value pairs into the JSON object our backend expects
    const user = Object.fromEntries(new FormData(registerForm));

    button.disabled = true;
    message.textContent = 'Creating account...';

    try {
        const response = await fetch('http://localhost:5050/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        const result = await response.json();

        // fetch still returns a response for HTTP errors, including duplicate usernames (should be error 409)
        if (!response.ok) {
            message.textContent = result.error || 'Registration failed.';
            return;
        }

        message.textContent = result.message;
        // clear the form only after success; errors preserve the user's entries
        registerForm.reset();
    } catch (error) {
        message.textContent =
            'Unable to complete registration. Check your backend terminal.';
    } finally {
        button.disabled = false;
    }
});

// Send sign-in details and let the browser keep the session cookie.
const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = document.querySelector('#login-message');
    const button = loginForm.querySelector('button[type="submit"]');
    const credentials = Object.fromEntries(new FormData(loginForm));

    button.disabled = true;
    message.textContent = 'Signing in...';

    try {
        const response = await fetch('http://localhost:5050/login', {
            method: 'POST',

            // Include session cookies across the Apache and Node ports.
            credentials: 'include',

            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const result = await response.json();

        if (!response.ok) {
            message.textContent = result.error || 'Sign-in failed.';
            return;
        }

        message.textContent =
            `${result.message} Welcome, ${result.user.firstname}!`;

        loginForm.reset();
    } catch (error) {
        message.textContent =
            'Unable to sign in. Check your backend terminal.';
    } finally {
        button.disabled = false;
    }
});

// Search the user directory using the current signed-in session.
const searchForm = document.querySelector('#search-form');

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = document.querySelector('#search-message');
    const table = document.querySelector('#search-results');
    const tableBody = document.querySelector('#search-results-body');
    const button = searchForm.querySelector('button[type="submit"]');

    const filters = Object.fromEntries(new FormData(searchForm));
    filters.firstname = filters.firstname.trim();
    filters.lastname = filters.lastname.trim();

    // Clear results from the previous search.
    tableBody.replaceChildren();
    table.hidden = true;

    if (!filters.firstname && !filters.lastname) {
        message.textContent = 'Enter a first name, last name, or both.';
        return;
    }

    button.disabled = true;
    message.textContent = 'Searching...';

    try {
        const query = new URLSearchParams(filters);

        const response = await fetch(
            `http://localhost:5050/users/search?${query}`,
            { credentials: 'include' }
        );

        const result = await response.json();

        if (!response.ok) {
            message.textContent = result.error || 'Search failed.';
            return;
        }

        for (const user of result.data) {
            const row = document.createElement('tr');

            for (const value of [
                user.username,
                user.firstname,
                user.lastname
            ]) {
                const cell = document.createElement('td');

                // Display user data as text rather than interpreting HTML.
                cell.textContent = value;
                row.appendChild(cell);
            }

            tableBody.appendChild(row);
        }

        table.hidden = result.data.length === 0;
        message.textContent = result.data.length
            ? `${result.data.length} matching user(s) found.`
            : 'No matching users.';
    } catch (error) {
        message.textContent =
            'Unable to search. Check your backend terminal.';
    } finally {
        button.disabled = false;
    }
});
// features 8-10
//feature 8: users who never signed in, wait for button click, find the element, hen call helper fucn. for fetching
const neverSignedInButton =
    document.querySelector('#never-signed-in-button');

neverSignedInButton.addEventListener('click', async () => {
    const message = document.querySelector('#never-signed-in-message');
    const results = document.querySelector('#never-signed-in-results');

    await runUserSearch(
        'http://localhost:5050/users/never-signed-in',
        message, results, neverSignedInButton
    );
});
//feature 9: users who registered on same day as ref. user
const sameDayForm = document.querySelector('#same-day-form');

sameDayForm.addEventListener('submit', async event => {
    event.preventDefault();
//get username, find message and results, validate it, conver into URL (the username), call the backend with username attached to that URL
    const username =
        document.querySelector('#same-day-username').value.trim();

    const message = document.querySelector('#same-day-message');
    const results = document.querySelector('#same-day-results');
    const button = sameDayForm.querySelector('button[type="submit"]');

    if (!username || username.length > 50) {
        message.textContent =
            'Enter a reference username of 1–50 characters.';
        results.replaceChildren();
        return;
    }

    const query = new URLSearchParams({ username });

    await runUserSearch(
        `http://localhost:5050/users/registered-same-day?${query}`,
        message, results, button
    );
});
//feature 10: users who registered today
const registeredTodayButton =
    document.querySelector('#registered-today-button');

registeredTodayButton.addEventListener('click', async () => {
    const message = document.querySelector('#registered-today-message');
    const results = document.querySelector('#registered-today-results');
//similar logic, just diff. URL
    await runUserSearch(
        'http://localhost:5050/users/registered-today',
        message, results, registeredTodayButton
    );
});
