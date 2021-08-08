require("dotenv").config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

client.on("connect", () => {
    console.log("Connected to our redis instance!");
    // client.hmset("Greatest Football Player", "Lionel Messi");
});

// Set Port
const port = process.env.PORT || 3000;

// Init app
const app = express();

// View Engine\
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// methodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/', function (req, res, next) {
    res.render('searchUsers');
});

// Search processing
app.post('/user/search', function (req, res, next) {
    let id = req.body.id;

    client.hgetall(id, function (err, obj) {
        if (!obj) {
            res.render('searchUsers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add User Page
app.get('/user/add', function (req, res, next) {
    res.render('adduser');
});

// Process Add User Page
app.post('/user/add', function (req, res, next) {
    let { id, first_name, last_name, email, phone } = req.body;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

// Delete User
app.delete('/user/delete/:id', function (req, res, next) {
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, () => console.log(`Listening at ${port}...`));
