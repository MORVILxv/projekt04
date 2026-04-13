import express from "express";
import cookieParser from "cookie-parser";
import argon2 from "argon2";
import db_ops from './db_operations.js';

const port = process.env.port || 8000;
const app = express();
const secret = process.env.secret;
const pepper = process.env.pepper;
if (secret == null || pepper == null) {
    console.error("Env variables are missing, run 'npm run gen_env'");
    process.exit(1);
}
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
    const username = req.signedCookies["Account"];
    const info = db_ops.select_info.get();
    const data = db_ops.select_tanks.all();
    if (info != undefined) {
        res.render("tanks", {
            name: "List of tanks", 
            name2: info.name,
            data: data,
            user: username,
        });
    } else {
        res.sendStatus(404);
    }
});

app.post("/all/tankmuseum/new", (req, res) => {
    const tanks = db_ops.select_tanks.all();
    const username = req.signedCookies["Account"];
    let added = 0;
    for (const tank of tanks) {
        if (tank.nation == req.body.nation && tank.name == req.body.name) {
            db_ops.increase_number.run(req.body.number, username, tank.id);
            added = 1;
            break;
        } 
    }
    if (added == 0) {
        db_ops.insert_tank.run(req.body.nation, req.body.name, req.body.number, username);
    }
    
    res.redirect('/all/tankmuseum');
});

app.get("/all/tankmuseum/edit", async (req, res) => {
    let username = req.signedCookies["Account"];
    const data = db_ops.select_tanks.all();
    if (data != undefined) {
        if (username != undefined) {
            const user_db = db_ops.select_user.get(username);
            const admin_db = await argon2.verify(user_db.adminhash, "1", HASH_PARAMS) ? 1 : 0;
            res.render("edit", {
                name: "List of tanks", 
                data: data,
                user: username, 
                admin: admin_db
            });
        } else {
            res.render("edit", {
                name: "List of tanks",
                data: data,
                user: username,
                admin: 0
            });
        }
    } else {
        res.sendStatus(404); 
    }
});

app.post("/all/tankmuseum/edit/new", (req, res) => {
    const username = req.signedCookies["Account"];
    if(username != undefined) {
        if (req.body.action == "delete") {
            db_ops.delete_tank.run(req.body.id);
            res.redirect('/all/tankmuseum/edit');
        }
        else if (req.body.action == "update") {
            db_ops.update_tank.run(req.body.nation, req.body.name, req.body.number, username, req.body.id);
            res.redirect('/all/tankmuseum/edit');
        }
        else if (req.body.action == "noadmin") {
            res.redirect("/all/tankmuseum/edit/noadmin");
        }
    } else {
        res.redirect("/all/tankmuseum/edit/noadmin");
    }
});

app.get("/all/tankmuseum/edit/noadmin", (req, res) => {
    const username = req.signedCookies["Account"];
    res.render("noadmin", {
        name: "No admin privileges",
        user: username
    });
});

app.get("/all/account", (req, res) => {
    let username = req.signedCookies["Account"];
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
    let adminhash = await argon2.hash(String(admin), HASH_PARAMS);
    db_ops.insert_user.run(username, passwordhash, adminhash);
    res.redirect("/all/account");
});
app.post("/all/account/login", async (req, res) => {
    const username = req.body.login_username;
    const password = req.body.login_password;
    const user_db = db_ops.select_user.get(username);
    if (user_db != undefined && user_db != null) {
        if (await argon2.verify(user_db.passwordhash, password, HASH_PARAMS)) {
            res.cookie("Account", username, { maxAge: 3600000, signed: true, httpOnly: true });
            res.redirect("/all/account");
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

console.log("nigger");
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});