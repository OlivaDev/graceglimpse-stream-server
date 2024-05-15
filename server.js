const express = require('express')
const http = require("node:http")
const path = require("node:path")
const serv = require("socket.io")
const app = express()
const fs = require("fs")
const bodyParser = require("body-parser")
const server = http.createServer(app)
const { Readable } = require("stream")
const cors = require("cors")
const webmToMp4 = require("webm-to-mp4");
 

app.use(cors())
app.use('/public',
  express.static( path.resolve( __dirname, './public' ) )
);
app.use(bodyParser.json({limit: "50mb"}))

const io = new serv.Server(server, {cors:{origin: "*"}})

const sockets = {}

io.on('connection', (socket) => {
    console.log('Conectado al socket');

    socket.on("saveSocket",(id) => {
        sockets[id] = socket.id
    })

    socket.on("joinStream", (req) => {
        let streamSocket = sockets[req.streamer]
        io.sockets.sockets.get(streamSocket).emit("joinStream", req)
    })

    socket.on("joinAccepted", (req) => {
        let userSocket = sockets[req.user]
        io.sockets.sockets.get(userSocket).emit("joinAccepted", req)
    })

    socket.on("joinAnswer", (req) => {
        let streamer = sockets[req.streamer]
        io.sockets.sockets.get(streamer).emit("joinAnswer", req)
    })
})


server.listen(3000, () => {
    console.log("servidor inicializado")
})
