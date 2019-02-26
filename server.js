const express = require("express")
const cors = require("cors")
const path = require("path")
const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const mongoose = require("mongoose");
const fs = require("fs");
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const camelCase = require('camelcase');
const changeCase = require('change-case')





// Import typeDefs and resolvers

// Import Environment Variables and Mongoose Models
require("dotenv").config({ path: "variables.env" });
const User = require("./db/models/User");
const ParkingHouse = require("./db/models/ParkingHouse")
const ParkingPlace = require("./db/models/ParkingPlace")
const Occupation = require("./db/models/Occupation")
// const auth = require('./auth');

const { check, validationResult } = require('express-validator/check');

mongoose
    .connect(
        'mongodb://root:root123@ds145053.mlab.com:45053/wireparking',
        { useNewUrlParser: true }
    )
    .then(() => console.log("DB connected"))
    .catch(err => console.error(err));
mongoose.Promise = global.Promise;



const app = express();
app.use('*', cors('*'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// app.use(auth)
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => res.send('I am alive'));

require('./user.routes.js')(app);
require('./parkingHouse.routes.js')(app);
require('./parkingPlace.routes.js')(app);




// server.applyMiddleware({ app });


app.listen(process.env.PORT || 4000, () => () =>
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'))
);

