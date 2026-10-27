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