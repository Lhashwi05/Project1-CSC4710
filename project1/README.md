## Working starter application

This app runs locally using Apache, Node.js, and MySQL (as of right now).

### Changes made

- fixed backend startup command in `project1/Backend/package.json` to run `nodemon app.js` instead of `nodemon server.js`
- added `package-lock.json` to record dependency versions.
- configured and tested the connection between the frontend, backend, and local database

### steps to run locally

This will require XAMPP and Node.js/npm.

1. Place repository folder inside XAMPP’s `htdocs` folder.
2. Start Apache and MySQL in XAMPP (wait until they turn green).
3. Create the `web_app` database and sample `names` table using the SQL in phpmyadmin.
4. Copy `project1/Backend/dotenv` to `project1/Backend/.env` and enter your local database settings. **Make sure the `.env` file must be inside `Backend`!** Each teammate needs their own local database and `.env`; `.env` is excluded from Git.
5. From the repository’s main folder, run:

   ```bash
   cd project1/Backend
   npm install
   npm start
   ```

6. Leave the backend running and open:

   http://localhost/Project1-CSC4710/project1/Frontend/index.html

### Testing completion criteria

- Confirm `/getAll` returns `{"data":[]}` with an empty table
- Add a test name through the webpage 
- Refresh the page and confirm the name remains saved

### Next milestones

Create the final `Users` table and `sql.txt`, then implement registration. Sign-in and the required search features are still pending.
