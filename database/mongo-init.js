db.createUser({
    user: "root",
    pwd: "root",
    roles: [
        {
            role: "readWrite",
            db: "Connect4",
        },
    ],
});
db.createCollection("Connect4");
