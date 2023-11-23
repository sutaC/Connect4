db("admin").createUser({
    user: "conn4",
    pwd: "pass",
    roles: [
        {
            role: "readWrite",
            db: "Connect4",
        },
    ],
});
db("Connect4").createCollection("games");
