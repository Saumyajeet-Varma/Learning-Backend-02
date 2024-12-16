import dotenv from 'dotenv'
import app from './app.js';
import connectDB from "./db/connect.js"

// dotenv/config
dotenv.config({
    path: "./.env"
})

const port = process.env.PORT || 8000;

// DB connection
connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.log("ERROR: ", err);
            throw err;
        });

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        })
    })
    .catch((err) => {
        console.log("MONGODB connection failed !! ", err);
    })







/*

import express from 'express';

const app = express();

(async () => {

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is lstening on port ${process.env.PORT}`);
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        throw error;
    }

})()

*/