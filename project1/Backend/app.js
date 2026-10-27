// Backend: application services, accessible by URIs


const express = require('express')
const cors = require ('cors')
const dotenv = require('dotenv')
const { hashPassword } = require('./passwords');
dotenv.config()

const app = express();

const dbService = require('./dbService');


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}));

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

// create
app.post('/insert', (request, response) => {
    console.log("app: insert a row.");
    // console.log(request.body); 

    const {name} = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.insertNewName(name);
 
    // note that result is a promise
    result 
    .then(data => response.json({data: data})) // return the newly added row to frontend, which will show it
   // .then(data => console.log({data: data})) // debug first before return by response
   .catch(err => console.log(err));
});




// read 
app.get('/getAll', (request, response) => {
    
    const db = dbService.getDbServiceInstance();

    
    const result =  db.getAllData(); // call a DB function

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});


app.get('/search/:name', (request, response) => { // we can debug by URL
    
    const {name} = request.params;
    
    console.log(name);

    const db = dbService.getDbServiceInstance();

    let result;
    if(name === "all") // in case we want to search all
       result = db.getAllData()
    else 
       result =  db.searchByName(name); // call a DB function

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});


// update
app.patch('/update', 
     (request, response) => {
          console.log("app: update is called");
          //console.log(request.body);
          const{id, name} = request.body;
          console.log(id);
          console.log(name);
          const db = dbService.getDbServiceInstance();

          const result = db.updateNameById(id, name);

          result.then(data => response.json({success: true}))
          .catch(err => console.log(err)); 

     }
);

// delete service
app.delete('/delete/:id', 
     (request, response) => {     
        const {id} = request.params;
        console.log("delete");
        console.log(id);
        const db = dbService.getDbServiceInstance();

        const result = db.deleteRowById(id);

        result.then(data => response.json({success: true}))
        .catch(err => console.log(err));
     }
)   

// debug function, will be deleted later
app.post('/debug', (request, response) => {
    // console.log(request.body); 

    const {debug} = request.body;
    console.log(debug);

    return response.json({success: true});
});   

// debug function: use http://localhost:5050/testdb to try a DB function
// should be deleted finally
app.get('/testdb', (request, response) => {
    
    const db = dbService.getDbServiceInstance();

    
    const result =  db.deleteById("14"); // call a DB function here, change it to the one you want

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});


// set up the web server listener
// if we use .env to configure
/*
app.listen(process.env.PORT, 
    () => {
        console.log("I am listening on the configured port " + process.env.PORT)
    }
);
*/

// if we configure here directly
app.listen(5050, 
    () => {
        console.log("I am listening on the fixed port 5050.")
    }
);
