// @flow

let express = require("express");
let axios = require("axios");
let socketIo = require("socket.io");


let app = express();
let server = app.listen(4001, () => console.log("Listening on port 4001"));

//axios.get('http://localhost:8080/livefeed').then(res => console.log(res.data));

let io = socketIo(server);

let interval1;
io.on("connection", socket => {
    console.log("Ny klient tilkoblet");
    if (interval1) {
        clearInterval(interval1);
    }

    interval1 = setInterval(() => {
        getLivefeedAndEmit(socket);
    }, 1000);

    socket.on("disconnect", () => {
        console.log("Klient koblet fra");
    });
})

let getLivefeedAndEmit = async socket => {
    try {
        let res = await axios.get('http://localhost:8080/livefeed');
        socket.emit("Livefeed", res.data);
        //console.log(res.data);
    } catch (error) {
        console.error("Error", error.code);
    }
};
