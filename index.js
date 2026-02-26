import express from "express";
import db_ops from './db_operations.js';

const port = 2077;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());


app.get("/", (req, res) => {
    res.render("none", {name: "Main"});
})

app.get("/all", (req, res) => {
    const mname = db_ops.select_info.get();
    res.render("names", {
        name: "Subsites", 
        mname: mname.name,
        aname: "About the museum"
    })
});

app.get("/all/about", (req, res) => {
    const data = db_ops.select_info.get();
    if (data != null) {
        res.render("about", {
            name: "About Us", 
            data: data,
        });
    } else {
        res.sendStatus(404);
    }
});

app.get("/all/tankmuseum", (req, res) => {
    const a = db_ops.select_info.get();
    const data = db_ops.select_tanks.all();
    if (a != undefined) {
        res.render("tanks", {
            name: "List of tanks", 
            a: a.name,
            data: data,
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
    const a = db_ops.select_info.get().name;
    const data = db_ops.select_tanks.all();
    if (data != undefined) {
        res.render("edit", {
            name: "List of tanks", 
            a: a,
            data: data,
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



app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});