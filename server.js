const fs = require("fs")
const https = require("https")
const express = require("express")

const path = require("path")

const app = express()

const key = fs.readFileSync("./certs/create-ca-key.pem")
const cert = fs.readFileSync("./certs/create-ca.pem")

const secureExpress = https.createServer({key, cert}, app)

const port = process.env.PORT || 4000

const basepath = path.join(__dirname, "./public")  

app.use(express.static(basepath)) 

secureExpress.listen(port,() => {
    console.log(`The Server is Started at https://localhost:${port}`)
})   