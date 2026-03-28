import express from "express";
import cookieParser from "cookie-parser";
import argon2 from "argon2";
import db_ops from './db_operations.js';
import { use } from "react";

const port = process.env.port;
const app = express();
const secret = process.env.secret;
const pepper = process.env.pepper;
const HASH_PARAMS = {
    secret: Buffer.from(pepper, "hex")
}
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());
app.use(cookieParser(secret));



app.get("/", (req, res) => {
    let username = req.signedCookies["Account"];
    res.render("none", {name: "Main", user: username});
})

app.get("/all", (req, res) => {
    let username = req.signedCookies["Account"];
    const mname = db_ops.select_info.get();
    res.render("names", {
        name: "Subsites", 
        mname: mname.name,
        aname: "About the museum",
        accname: "Accounts",
        user: username
    })
});

app.get("/all/about", (req, res) => {
    let username = req.signedCookies["Account"];
    const data = db_ops.select_info.get();
    if (data != null) {
        res.render("about", {
            name: "About Us", 
            data: data,
            user: username
        });
    } else {
        res.sendStatus(404);
    }
});

app.get("/all/tankmuseum", (req, res) => {
    let username = req.signedCookies["Account"];
    const a = db_ops.select_info.get();
    const data = db_ops.select_tanks.all();
    if (a != undefined) {
        res.render("tanks", {
            name: "List of tanks", 
            a: a.name,
            data: data,
            user: username
        });
    } else {
        res.sendStatus(404);
    }
});

app.post("/all/tankmuseum/new", (req, res) => {
    const t = db_ops.select_tanks.all();
    let added = 0;
    for (const tank of t) {
        if (tank.nation == req.body.nation && tank.name == req.body.name) {
            db_ops.increase_number.run(req.body.number, tank.id);
            added = 1;
            break;
        } 
    }
    if (added == 0) {
        db_ops.insert_tank.run(req.body.nation, req.body.name, req.body.number);
    }
    
    res.redirect('/all/tankmuseum');
});

app.get("/all/tankmuseum/edit", (req, res) => {
    let username = req.signedCookies["Account"];
    const a = db_ops.select_info.get().name;
    const data = db_ops.select_tanks.all();
    if (data != undefined) {
        res.render("edit", {
            name: "List of tanks", 
            a: a,
            data: data,
            user: username
        });
    } 
    else {
        res.sendStatus(404);
    }
});

app.post("/all/tankmuseum/edit/new", (req, res) => {
    const t = db_ops.select_tanks.all();
    if (req.body.action == "delete") {
        db_ops.delete_tank.run(req.body.id);
    }
    else if (req.body.action == "update") {
        db_ops.update_tank.run(req.body.nation, req.body.name, req.body.number, req.body.id);
    }
    
    res.redirect('/all/tankmuseum/edit');
});



app.get("/all/account", (req, res) => {
    let username = req.signedCookies["Account"];
    console.log(username);
    res.render("account", {
        name: "Account",
        user: username
    })
});

app.post("/all/account/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const admin = req.body.admin === "1" ? 1 : 0;
    let passwordhash = await argon2.hash(password, HASH_PARAMS);
    db_ops.insert_user.run(username, passwordhash, admin);
    res.redirect("/all/account");
});
app.post("/all/account/login", async (req, res) => {
    const username = req.body.login_username;
    const password = req.body.login_password;
    const user_db = db_ops.select_user.get(username);
    console.log(user_db);
    if (user_db != undefined && user_db != null) {
        if(await argon2.verify(user_db.passwordhash, password, HASH_PARAMS)) {
            res.cookie("Account", username, { maxAge: 3600000, signed: true, httpOnly: true });
            res.redirect("/all/account");
            console.log("Logged in as:", username, password);
        }
    }
    else {
        res.redirect("/all/account");
        console.log("Failed to log in");
    }
});
app.post("/all/account/logout", (req, res) => {
    res.clearCookie("Account");
    res.redirect("/all/account");
})
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});