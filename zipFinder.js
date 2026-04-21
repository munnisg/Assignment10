var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var port = process.env.PORT || 3000;
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const MongoClient = require('mongodb').MongoClient
const mongourl = "mongodb+srv://cs120_visitor:CS120_visit@cs120.rdyqcgo.mongodb.net/?appName=CS120"

const client = new MongoClient(mongourl);

// async function dbConnect(place) {
//     try {
//         const database = client.db('Assignment10')
//         const places = database.collection('places')
//         if (isNaN(parseInt(place[0]))) {
//             places.findOne({ city: place }, function (err, result) {
//                 if (err) throw err
//                 let placeObj = JSON.parse(result)
//                 console.log(placeObj.city)
//             })
//         } else {

//         }

//     } finally {
//         await client.close();
//         // console.log("Done.")
//     }
// }

// console.log("Here")
async function startServer() {
    http.createServer(async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        urlObj = url.parse(req.url, true)
        path = urlObj.pathname;
        if (path == "/") {
            file = "home.txt";
            fs.readFile(file, function (err, homeView) {
                res.write(homeView);
                res.end();
            })
        }
        else if (path == "/process") {
            // res.write("Processing<br/>");
            var body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                // res.write("Raw data string: " + body + "<br/>");
                var place = qs.parse(body).place;
                async function run(place) {
                    try {
                        await client.connect()
                        const database = client.db('Assignment10')
                        const places = database.collection('places')
                        // console.log("2")
                        // console.log(isNaN(parseInt(place[0])))
                        if (isNaN(parseInt(place[0]))) {
                            // console.log("3")
                            const data = await places.findOne({ city: place }, {projection: {_id:0, city:1, zipList:1}});
                            console.log("City:" + data.city)
                            res.write("City: " + data.city + "<br/>")
                            let zipStr = "Zip Codes: ";
                            for (i = 0; i < data.zipList.length; i++) {
                                zipStr += data.zipList[i]
                                if (i < data.zipList.length-1) {
                                    zipStr += ", "
                                }
                            }
                            console.log(zipStr)
                            res.write(zipStr)
                        } else {
                            const data = await places.findOne({ zipList: place }, {projection: {_id:0, city:1, zipList:1}});
                            // console.log(data.zipList)
                            console.log("City:" + data.city)
                            res.write("City: " + data.city + "<br/>")
                            let zipStr = "Zip Codes: ";
                            for (i = 0; i < data.zipList.length; i++) {
                                zipStr += data.zipList[i]
                                if (i < data.zipList.length-1) {
                                    zipStr += ", "
                                }
                            }
                            console.log(zipStr)
                            res.write(zipStr)
                        }
                    } finally {
                        await client.close();
                        res.end();
                        // console.log("Done.")
                    }
                }
                run(place).catch(console.dir);
            });
        }
    }).listen(port);
}
startServer();
