'use strict';
let ws = null;
let lowest = 0;
// fetch('USB/html.json').then(response => response.json()).then(data => {
ws = new WebSocket(`ws:/127.0.0.1:6969`);//${data.serverIP}${data.websocketport}
ws.addEventListener("open", () => {
    console.log("connnected");
    ws.send("is connected")
})

ws.addEventListener("message", packet => {
    let currentRule = JSON.parse(packet.data)
    document.getElementById('h2Regels').innerHTML = currentRule.regel
    let temp = [
        //"Nothing",
    ]
    switch (currentRule.special) {
        case 1:
            // "Skip 1 turn",
            playerlist[turn].skip = true
            break;
        case 2:
            // "Switch with player left",
            goLeft()
            break;
        case 3:
            // "Switch with player right",
            goRight()
            break;
        case 4:
            // "Give turn to Sjoerd"
            if (playerlist[turn].name != "Sjoerd") {
                for (let i = 0; i < playerlist.length; i++) {
                    if (playerlist[i].name == "Sjoerd") {
                        turn = i - 1
                    }
                }
            }
            break;
        case 5:
            // "Volgende gooi dubbel",
            playerlist[turn].double = true
            break;
        case 6:
            // "Waylon of Arjan de beurt, skip",
            if (playerlist[turn].name == "Waylon" || playerlist[turn].name == "Arjan") {
                playerlist[turn].skip = true
            }
            break;
        case 7:
            // "Waylon 1 naar voren",
            for (let i = 0; i < playerlist.length; i++) {
                if (playerlist[i].name == "Waylon") {
                    move(i, 1)
                }
            }
            break;
        case 8:
            // "Snake eys (4 rond)",

            break;
        case 9:
            // "player en Flip skip beurt"
            for (let i = 0; i < playerlist.length; i++) {
                if (playerlist[i].name == "Phil") {
                    playerlist[i].skip = true
                }
            }
            playerlist[turn].skip = true
            break;

        default:
            break;
    }
})

ws.addEventListener("close", () => {
    document.getElementById('title').innerHTML = "Socket Connection Closed!"
    console.log("Socket Connection Closed!");

})
ws.addEventListener("error", (err) => {
    console.log(err);
})

let turn = 0
let trown = false
let playerlist = []


function addPlayer(name, color) {
    playerlist.push({
        "name": name,
        "color": color,
        "position": 0,
        "skip": false,
        "double": false
    })
}

function start() {
    for (let s = 1; s <= 8; s++) {
        let radio = document.getElementById("name" + s)
        console.log(radio.checked);
        if (radio.checked) {
            console.log(radio.value);
            addPlayer(radio.value, getcolor())
        }
    }
    document.getElementById("radioDIV").hidden = true
    document.getElementById("startDIV").hidden = true
    document.getElementById("board").hidden = false
    document.getElementById("roll").hidden = false
    document.getElementById("next").hidden = false
    document.getElementById("addOne").hidden = false
    makePlayerCards()
    for (let index = 0; index < playerlist.length; index++) {
        addPion(index)
    }
    let spelersDIV2 = document.getElementById("playerid0")
    spelersDIV2.style.height = "200px";
}

function move(playerindex, amount) {
    playerlist[playerindex].position = playerlist[playerindex].position + amount
    if (playerlist[playerindex].position < 0) {
        playerlist[playerindex].position = 0
    }
    if (playerlist[playerindex].position >= 69) {
        playerlist[playerindex].position =
            endGame()
    }
    ws.send(playerlist[playerindex].position)
    let playerPion = document.getElementById("playerpion" + playerindex)
    let newPosition = document.getElementById("boardplace" + playerlist[playerindex].position)
    newPosition.append(playerPion)

}

function roll() {
    if (!trown) {
        let trow = prompt(`Hoeveel gooit ${playerlist[turn].name}`, "");
        if (trow != null) {
            if (7 > parseInt(trow) && 0 < parseInt(trow)) {
                trown = true
                if (playerlist[turn].double) {
                    trow = trow * 2
                    playerlist[turn].double = false
                }
                move(turn, parseInt(trow))
            } else {
                alert("cheat meneertje")
            }
        } else {
            alert("Ha! Debiel.")
        }
    } else {
        alert("He doe eemn kalm")
    }
}

function next() {
    if (trown) {
        let spelersDIV = document.getElementById("playerid" + turn)
        spelersDIV.style.height = "100px";
        if (turn == playerlist.length - 1) {
            turn = 0
        } else {
            turn++
        }
        trown = false
        let spelersDIV2 = document.getElementById("playerid" + turn)
        spelersDIV2.style.height = "200px";

        if (playerlist[turn].skip) {
            playerlist[turn].skip = false
            trown = true
            next()
        }
    } else {
        alert("He doe eemn kalm")
    }
}


function goRight() {
    let t = playerlist[0].position
    for (let i = 1; i < playerlist.length; i++) {
        let playerPion2 = document.getElementById("playerpion" + (i - 1))
        let newPosition3 = document.getElementById("boardplace" + playerlist[i].position)
        newPosition3.append(playerPion2)
        playerlist[i - 1].position = playerlist[i].position
    }
    let playerPion = document.getElementById("playerpion" + (playerlist.length - 1))
    let newPosition = document.getElementById("boardplace" + t)
    playerlist[playerlist.length - 1].position = t
    newPosition.append(playerPion)
}
function goLeft() {
    let t = playerlist[playerlist.length - 1].position
    for (let i = playerlist.length - 1; i > 0; i--) {
        let playerPion2 = document.getElementById("playerpion" + i)
        let newPosition3 = document.getElementById("boardplace" + playerlist[i - 1].position)
        newPosition3.append(playerPion2)
        playerlist[i].position = playerlist[i - 1].position
    }
    let playerPion = document.getElementById("playerpion" + 0)
    let newPosition = document.getElementById("boardplace" + t)
    playerlist[0].position = t
    newPosition.append(playerPion)
}

function getcolor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function makePlayerCards() {
    let spelersDIV = document.getElementById("spelers")
    for (let index = 0; index < playerlist.length; index++) {

        var playerDiv = document.createElement("div");
        playerDiv.style.width = `${80 / playerlist.length}%`;
        playerDiv.style.height = "100px";
        playerDiv.style.background = playerlist[index].color;
        playerDiv.style.color = "white";
        playerDiv.style.float = "left"
        playerDiv.style.textAlign = "top";
        playerDiv.style.marginLeft = `${10 / playerlist.length}%`
        playerDiv.style.marginRight = `${10 / playerlist.length}%`
        playerDiv.id = `playerid${index}`
        spelersDIV.appendChild(playerDiv);

        var nameP = document.createElement("p");
        nameP.innerHTML = playerlist[index].name;
        nameP.style.float = "left"
        playerDiv.appendChild(nameP);


        var playerIMG = document.createElement("img");
        playerIMG.src = `PNG/${playerlist[index].name}.png`
        playerIMG.alt = playerlist[index].name
        playerIMG.style.height = "100%"
        playerIMG.style.width = "70%"
        playerIMG.style.float = "left"
        playerDiv.appendChild(playerIMG);
    }
}
function addPion(index) {
    var pion = document.createElement("p");
    pion.style.width = `30%`;
    pion.style.height = "20px";
    pion.style.float = "left"
    pion.style.margin = "0px"
    pion.style.background = playerlist[index].color
    pion.id = `playerpion${index}`
    pion.innerHTML = playerlist[index].name[0]
    playerlist[index].position = lowest
    document.getElementById("boardplace" + lowest).append(pion)
}

function addOne() {
    document.getElementById("spelers").hidden = true
    document.getElementById("radioDIV").hidden = false
    document.getElementById("AddDIV").hidden = false
    document.getElementById("cancelAddDIV").hidden = false
    document.getElementById("board").hidden = true
    document.getElementById("roll").hidden = true
    document.getElementById("next").hidden = true
}

function cancelAddOne() {
    document.getElementById("radioDIV").hidden = true
    document.getElementById("AddDIV").hidden = true
    document.getElementById("cancelAddDIV").hidden = true
    document.getElementById("spelers").hidden = false
    document.getElementById("board").hidden = false
    document.getElementById("roll").hidden = false
    document.getElementById("next").hidden = false
}

function add() {
    document.getElementById("spelers").hidden = false
    document.getElementById("spelers").innerHTML = ""
    for (let s = 1; s <= 8; s++) {
        let radio = document.getElementById("name" + s)
        if (radio.checked) {
            if (!getPlayers().includes(radio.value)) {
                addPlayer(radio.value, getcolor())
                addPion(playerlist.length - 1)
            }
        }
    }
    document.getElementById("radioDIV").hidden = true
    document.getElementById("AddDIV").hidden = true
    document.getElementById("board").hidden = false
    document.getElementById("roll").hidden = false
    document.getElementById("next").hidden = false
    document.getElementById("addOne").hidden = false
    makePlayerCards()
    let spelersDIV2 = document.getElementById("playerid" + turn)
    spelersDIV2.style.height = "200px";
}

function getPlayers() {
    let list = []
    lowest = playerlist[0].position
    for (let i = 0; i < playerlist.length; i++) {
        list.push(playerlist[i].name)
        if (lowest > playerlist[i].position) {
            lowest = playerlist[i].position
        }
    }
    return list
}
function endGame() {
    location.href = `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
}