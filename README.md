# Project1-CSC4710

CSC4710 Project 1 (parts 1-3): user registration, sign-in, and name search.

## Completed features

1. **Registration:** creates an account with a unique username, password, first name, last name, salary, and age. Passwords are stored as salted scrypt hashes.
2. **Sign-in:** verifies the password, creates a session, and updates `signintime` after successful authentication.
3. **Name search:** signed-in users can search by first name, last name, or both (partial names are also supported). When both fields are supplied, both must match.

## Run locally

Requires XAMPP with Apache/MySQL and Node.js/npm. You'll need to install npm and xampp first!

1. Place the repository in `C:\xampp\htdocs\Project1-CSC4710`.
2. Start Apache and MySQL in XAMPP.
3. Create a `web_app` database in phpMyAdmin.
4. Select `web_app` then run the table-creation statement from `sql.txt` (just copy and paste it into the sql table, then click 'Go').
5. Copy professor's `project1/Backend/dotenv` to our `project1/Backend/.env` and configure your local database credentials.
6. Go inside Git Bash, and run:

   cd /c/xampp/htdocs/Project1-CSC4710/project1/Backend
   npm ci
   npm start
   

7. Open this in a new tab:

   http://localhost/Project1-CSC4710/project1/Frontend/index.html

Each teammate needs their own local database and `.env` configuration.

## Manual checks completed

- Registered accounts through the webpage and confirmed stored password hashes.
- Confirmed duplicate usernames are rejected.
- Verified successful sign-in and updated sign-in timestamps
- Confirmed wrong passwords and a SQL-injection username attempt receive `401 Unauthorized`.
- Tested first-name, last-name, and combined searches.
- Confirmed search results and feedback appear within the webpage.

##  notes

- Frontend code is in `project1/Frontend`.
- `Backend/app.js` handles requests and sessions.
- `Backend/dbService.js` contains parameterized SQL queries.
- `Backend/passwords.js` handles password hashing and verification.
- `sql.txt` contains all of the schema and query templates for features 1–3
- Sessions expire after one hour. Restarting the backend clears its in-memory sessions, so users must sign in again.


