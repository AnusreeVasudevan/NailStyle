const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const noCache = require("nocache");
const flash = require("connect-flash");
const path = require("path");
const morgan=require("morgan")
require('dotenv').config();


mongoose.connect(process.env.mongo);

const app = express();

// Session middleware setup
app.use(session({
    secret: 'dfgHJkloPqrSvwXYZabcDEFgHJk',
    resave: false,
    saveUninitialized: false
}));

// Other middleware
app.use(express.static('public'));
app.use(noCache());
//app.use(morgan("dev"))
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/admin", express.static(path.join(__dirname, "public")));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')))

app.use((req, res, next) => {
    res.locals.messages = req.flash('error');
    next();
  });

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


