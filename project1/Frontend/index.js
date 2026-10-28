<<<<<<< HEAD

/// registration UI: send form data to POST /register and display the result.
=======
// registration UI: send form data to POST /register and display the result.
>>>>>>> user-features
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
<<<<<<< HEAD
    }
});

// beggining of 4-7

/*
 * Shared helper: render search results safely as a table.
 * Passwords and password hashes are never displayed.
 */
function renderUserResults(container, users) {
    container.replaceChildren();

    if (users.length === 0) {
        container.textContent = 'No matching users found.';
        return;
    }

    const columns = [
        ['username', 'Username'],
        ['firstname', 'First name'],
        ['lastname', 'Last name'],
        ['salary', 'Salary'],
        ['age', 'Age'],
        ['registerday', 'Registration date'],
        ['signintime', 'Last sign-in']
    ];

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    for (const [, label] of columns) {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = label;
        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (const user of users) {
        const row = document.createElement('tr');

        for (const [key] of columns) {
            const cell = document.createElement('td');
            const value = user[key];

            if (value === null || value === undefined) {
                cell.textContent = 'Never';
            } else if (
                key === 'registerday' &&
                typeof value === 'string'
            ) {
                // Display the date without changing its calendar day.
                cell.textContent = value.slice(0, 10);
            } else if (
                key === 'signintime' &&
                typeof value === 'string'
            ) {
                cell.textContent = value;
            } else {
                cell.textContent = String(value);
            }

            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    container.appendChild(table);
}

/*
 * Shared helper: send a signed-in search request and display results.
 */
async function runUserSearch(url, messageElement, resultsElement, button) {
    button.disabled = true;
    messageElement.textContent = 'Searching...';
    resultsElement.replaceChildren();

    try {
        const response = await fetch(url, {
            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok) {
            messageElement.textContent =
                result.error || 'Search failed.';
            return;
        }

        renderUserResults(resultsElement, result.data);

        messageElement.textContent =
            `${result.data.length} matching user(s) found.`;
    } catch (error) {
        messageElement.textContent =
            'Unable to search. Check your backend and database.';
    } finally {
        button.disabled = false;
    }
}

// Feature 4: Search by username.
const usernameForm = document.querySelector('#username-search-form');

usernameForm.addEventListener('submit', async event => {
    event.preventDefault();

    const username =
        document.querySelector('#username-search').value.trim();

    const message =
        document.querySelector('#username-search-message');
    const results =
        document.querySelector('#username-search-results');
    const button = usernameForm.querySelector('button[type="submit"]');

    if (!username || username.length > 50) {
        message.textContent = 'Enter a username of 1–50 characters.';
        results.replaceChildren();
        return;
    }

    const query = new URLSearchParams({ username });

    await runUserSearch(
        `http://localhost:5050/users/by-username?${query}`,
        message, results, button
    );
});

// Feature 5: Search by salary range.
const salaryForm = document.querySelector('#salary-search-form');

salaryForm.addEventListener('submit', async event => {
    event.preventDefault();

    const min = document.querySelector('#min-salary').value.trim();
    const max = document.querySelector('#max-salary').value.trim();

    const message = document.querySelector('#salary-search-message');
    const results = document.querySelector('#salary-search-results');
    const button = salaryForm.querySelector('button[type="submit"]');

    const validSalary = value =>
        /^\d{1,10}(\.\d{1,2})?$/.test(value);

    if (!validSalary(min) || !validSalary(max) ||
        Number(min) > Number(max)) {
        message.textContent =
            'Enter valid nonnegative salaries, with minimum no greater than maximum.';
        results.replaceChildren();
        return;
    }

    const query = new URLSearchParams({ min, max });

    await runUserSearch(
        `http://localhost:5050/users/by-salary?${query}`,
        message, results, button
    );
});

// Feature 6: Search by age range.
const ageForm = document.querySelector('#age-search-form');

ageForm.addEventListener('submit', async event => {
    event.preventDefault();

    const min = document.querySelector('#min-age').value.trim();
    const max = document.querySelector('#max-age').value.trim();

    const message = document.querySelector('#age-search-message');
    const results = document.querySelector('#age-search-results');
    const button = ageForm.querySelector('button[type="submit"]');

    const validAge = value =>
        /^\d{1,3}$/.test(value) && Number(value) <= 130;

    if (!validAge(min) || !validAge(max) ||
        Number(min) > Number(max)) {
        message.textContent =
            'Enter whole-number ages from 0 to 130, with minimum no greater than maximum.';
        results.replaceChildren();
        return;
    }

    const query = new URLSearchParams({ min, max });

    await runUserSearch(
        `http://localhost:5050/users/by-age?${query}`,
        message, results, button
    );
});

// Feature 7: Find users registered after a reference user.
const afterUserForm = document.querySelector('#after-user-form');

afterUserForm.addEventListener('submit', async event => {
    event.preventDefault();

    const username =
        document.querySelector('#after-username').value.trim();

    const message = document.querySelector('#after-user-message');
    const results = document.querySelector('#after-user-results');
    const button = afterUserForm.querySelector('button[type="submit"]');

    if (!username || username.length > 50) {
        message.textContent =
            'Enter a reference username of 1–50 characters.';
        results.replaceChildren();
        return;
    }

    const query = new URLSearchParams({ username });

    await runUserSearch(
        `http://localhost:5050/users/registered-after?${query}`,
        message, results, button
    );
});
=======
    }
});
>>>>>>> user-features
