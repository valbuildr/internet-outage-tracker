// the server to be pinged by the pinger

const express = require("express");
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PINGEE_PORT;

app.get('/check-status', (req, res) => {
    res.status(200).send("yup i am working :)");
});

app.listen(port, () => {
    console.log(`Pingee server started at port ${port}`);
});