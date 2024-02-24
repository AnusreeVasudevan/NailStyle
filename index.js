const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const noCache = require("nocache");
const flash = require("express-flash");
const path = require("path");


mongoose.connect("mongodb://127.0.0.1:27017/Nail_Style");

const app = express();

// Session middleware setup
app.use(session({
    secret: 'dfgHJkloPqrSvwXYZabcDEFgHJk', // Change this to a long random string
    resave: false,
    saveUninitialized: false
}));

// Other middleware
app.use(express.static('public'));
app.use(noCache());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/admin", express.static(path.join(__dirname, "public")));


// User route
const userRoute = require('./routes/userRoute');
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', userRoute);

//for admin route
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.listen(2020, function() {
    console.log("Running..http://localhost:2020/");
});
