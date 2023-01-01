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

const initializePassport = require("./passport-config")

initializePassport(
    passport, 
    email => {return users.find(user => user.email ===  email)}
    )
const users = [];

const PORT = process.env.PORT || 3000;

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

//home route
app.get("/", (req, res) => {
    res.render("index", {title: "Login System", name: "Mosope"})
});

//login route
app.get("/login", (req, res) => {
    res.render("login", {title: "Login"})

});

//post to login route
app.post("/login",  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
    })
);


//registration route
app.get("/register", (req, res) => {
    res.render("register", {title: "Registration"})
})

//post to registration route
app.post("/register", async (req, res) => {
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

app.listen("3000", () => {console.log(`Listening on port ${PORT}...`)});