const config = require("./config.json");
const regels = require("./regels.json");
const websocket = require("ws")
const webS = new websocket.Server({ port: config.webSocket.port });
const path = require('path');
const open = require('open');
const express = require('express');
let expressApp = express()

expressApp.get("/", (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')))
expressApp.get("/main.js", (req, res) => res.sendFile(path.join(__dirname, '/public/main.js')))
expressApp.get("/style.css", (req, res) => res.sendFile(path.join(__dirname, '/public/style.css')))
expressApp.get("/PNG/:id", (req, res) => res.sendFile(path.join(__dirname, `/pictures/${req.params.id}`)))
expressApp.listen(config.Express.port, () => console.log("express LISTEN : " + config.Express.port))

open(`http:127.0.0.1:${config.Express.port}/`, { app: 'chrome' });// ${UDP_Import.getMyIP()}

webS.on("connection", ws => {
    let ruleL = shuffle(regels.ruleslist)
    console.log("new client connected");
    ws.on("close", () => {
        console.log("close");
    })
    ws.on("error", (err) => {
        console.log(err);
        console.log("err");
    })
    ws.on("message", data => {
        console.log("User sent: " + data);
        if (parseInt(data) != null && parseInt(data) != undefined && parseInt(data) > 0) {
            console.log(ruleL[parseInt(data)]);
            ws.send(JSON.stringify(ruleL[parseInt(data)]))
        }
    })
})

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}
