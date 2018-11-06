const express = require("express")
const cors = require("cors")
const path = require("path")
const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const mongoose = require("mongoose");
const fs = require("fs");


// Import typeDefs and resolvers
const filePath = path.join(__dirname, "typeDefs.gql");
const typeDefs = fs.readFileSync(filePath, "utf-8");
const resolvers = require("./resolvers");

// Import Environment Variables and Mongoose Models
require("dotenv").config({ path: "variables.env" });
const User = require("./db/models/User");
const ParkingHouse = require("./db/models/ParkingHouse")
const ParkingPlace = require("./db/models/ParkingPlace")
const Occupation = require("./db/models/Occupation")


mongoose
    .connect(
        process.env.MONGO_URI,
        { useNewUrlParser: true }
    )
    .then(() => console.log("DB connected"))
    .catch(err => console.error(err));
mongoose.Promise = global.Promise;


const app = express();
app.use('*', cors('*'));

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    formatError: error => ({
        name: error.name,
        message: error.message.replace("Context creation failed:", "")
    }),
    context: async () => {
        return { User, ParkingHouse, ParkingPlace, Occupation };
    }
})



server.applyMiddleware({ app });


app.listen({ port: 4000 }, () => () =>
    console.log(`🚀 Server ready at http://localhost:4000`)
);

