if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}

const { render } = require("ejs");
const { urlencoded } = require("express");
const express =  require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override");

const initializePassport = require("./passport-config")

initializePassport(
    passport, 
    email => {return users.find(user => user.email ===  email)},
    id => {return users.find(user => user.id ===  id)}
    )
const users = [];

const PORT = process.env.PORT || 3090;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

//home route
app.get("/", checkAuthenticated, (req, res) => {
    res.render("index", {title: "Login System", name: req.user.name})
});

//login route
app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login", {title: "Login"})

});

//post to login route
app.post("/login",  checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
    })
);


//registration route
app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register", {title: "Registration"})
})

//post to registration route
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect("/login")
    } catch {
        res.redirect("/register")
    }
    console.log(users)

});

app.delete("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) { 
            return next(err); 
        }});
    res.redirect("/login");
})


function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return res.redirect("/");
    }
    next()
}

app.listen(PORT, () => {console.log(`Listening on port ${PORT}...`)});