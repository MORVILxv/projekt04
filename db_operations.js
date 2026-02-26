import { DatabaseSync } from "node:sqlite";

const tankMuseum = {
    name: "The Great Tank Museum in Szczecin",
    tanks: [
        ["USA", "M4A3", 1],
        ["USSR", "T-34-85", 1], 
        ["Germany", "Tiger H1", 1],
        ["NUSA", "Militech Basilisk", 1]
    ]
};

const about = {
    name: "About the Museum",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam fermentum suscipit magna, nec laoreet velit eleifend sed. Suspendisse et enim nibh. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum auctor varius turpis vitae consectetur. Praesent volutpat gravida nibh sit amet sodales. Ut porttitor est quis efficitur rutrum. Vestibulum ac quam euismod, elementum libero vitae, rutrum nunc. Nullam pharetra leo consequat felis tempus, sed molestie nunc iaculis. Duis efficitur imperdiet pharetra. Vestibulum in lacinia orci. Nulla et mauris sit amet elit vehicula pharetra nec quis urna. Praesent quam elit, tempor iaculis vestibulum at, sagittis vitae sapien. In aliquet augue ac porttitor dictum"
}

const db = new DatabaseSync("./db.sqlite");

db.exec(
    `CREATE TABLE IF NOT EXISTS tanks (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    nation TEXT NOT NULL,
    name TEXT NOT NULL,
    number INTEGER DEFAULT 1
    ) STRICT; 
    CREATE TABLE IF NOT EXISTS info (
    name TEXT NOT NULL,
    about TEXT NOT NULL
    ) STRICT;`
);

const db_ops = {
    insert_tank: db.prepare('INSERT INTO tanks (nation, name, number) VALUES (?, ?, ?)'),
    select_tanks: db.prepare("SELECT * FROM tanks"),
    update_tank: db.prepare('UPDATE tanks SET nation = ?, name = ?, number = ? WHERE id = ?'),
    delete_tank: db.prepare("DELETE FROM tanks WHERE id = ?"),
    increase_number: db.prepare('UPDATE tanks SET number = number + ? WHERE id = ?'),
    insert_info: db.prepare('INSERT INTO info (name, about) VALUES (?, ?)'),
    select_info: db.prepare('SELECT * FROM info'),
};

function populate_tanks() {
    console.log("populating");
    const tanks = tankMuseum.tanks;
    tanks.forEach(tank => {
        var nation = tank[0];
        var name = tank[1];
        var number = tank[2];
        var c = db_ops.insert_tank.run(nation, name, number);
        console.log("created:", c);
    });
}

function populate_about() {
    var a = db_ops.select_info.get();
    if (a == undefined) {
        db_ops.insert_info.run(tankMuseum.name, about.text);
    }
}

populate_about();



// >populate=1 node index.js żeby załadować dane testowe/przykładowe jeśli z maszyny wirtualnej
if (process.env.populate === "1") {
    populate_tanks();
}

export default db_ops;