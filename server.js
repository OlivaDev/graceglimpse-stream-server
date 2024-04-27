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

app.use(bodyParser.json({limit: "50mb"}))

const io = new serv.Server(server, {cors:{origin: "*"}})

app.get('/video', (req, res) => {
    const range = req.headers.range
    if (!range)
        res.status(400).send('error')

    const videoPath = 'public/recording.webm'
    const videoSize = fs.statSync(videoPath).size

    const chunkSize = 10 ** 6
    // bytes=64165
    const start = Number(range.replace(/\D/g, ''))
    const end = Math.min(start + chunkSize, videoSize - 1)
    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": contentLength,
        "Content-Type": 'video/webm'
    }

    res.writeHead(206, headers)

    const videoStream = fs.createReadStream(videoPath, { start, end })

    videoStream.pipe(res)
})

io.on('connection', (socket) => {
    console.log('Conectado al socket');
    socket.on("updateStream", (req) => {
        let fileStream = fs.createWriteStream('public/recording.webm', { flags: 'a' });
        var fileBuffer = Buffer.from(req, 'base64');
        fileStream.write(fileBuffer);
        if(fs.existsSync("public/recording.webm")){
            fs.writeFileSync('public/recording.mp4', Buffer.from(webmToMp4(fs.readFileSync(fileStream.path))));
        }

    })
})

server.listen(3000, () => {
    console.log("servidor inicializado")
})
