const fs = require("fs")
const http = require("http")
const port = 42488

http.createServer(async function (req,res){
	if (req.method=='GET') {
		if (req.url=="/") {
            res.writeHead(200)
            res.end("You need to put a userId as the path btw")
        } else {
            let split = req.url.split("/")
            let id = parseInt(split[1])
            if (fs.existsSync(`./exported/${id}.brk`)) {
                res.writeHead(200,{
                    "Content-Disposition": `attachment; filename="${id}.brk"`
                })
                res.end(fs.readFileSync(`./exported/${id}.brk`))
            } else {
                console.log(req.url)
                res.writeHead(404)
                res.end("no exported brk was found, or you were trying something dumb")
                return
            }
        }
	} else {
        res.writeHead(405)
        res.end("why are you trying to use a non-get request? you aren't uploading a file to my laptop through this stop trying")
        return
    }
}).listen(port)
console.log("loaded")