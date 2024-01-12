const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;

app.use(express.json()); 
app.use("/styles", express.static("public/styles"));
app.use("/js", express.static("public/js"));
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

const songsPath = path.join(__dirname, "songs.json");
let songsInfo;
if (fs.existsSync(songsPath)) {
	const songsData = fs.readFileSync(songsPath, "utf8");
	songsInfo = JSON.parse(songsData);
}

app.get("/", function (req, res) {
	res.render("index", {
		title: "Karaoke Night"
	});
});

app.get("/obtain-song", function (req, res) {
	let song = songsInfo[Math.floor(Math.random() * songsInfo.length)]
	res.json(song)
});

app.get("/add-song", function (req, res) {
	res.render("addSong", {
		title: "Karaoke Night - Add"
	});
});

app.post("/add-song", function (req, res) {
  songsInfo.push({
    name: req.body.songTitle,
    author: req.body.songArtist,
    lyrics: req.body.songLyrics.split("\n")
  })
  fs.writeFileSync(songsPath, JSON.stringify(songsInfo, null, 2));
});

app.get("/text-to", function (req, res) {
  let lyrics = [];
  var lineReader = require("readline").createInterface({
    input: require("fs").createReadStream("awdo.txt"),
  });

  lineReader.on("line", function (line) {
    if (line === "") return lyrics.push("<br>")
    lyrics.push(line);
  });

  lineReader.on("close", function () {
    fileInfo[0].lyrics = lyrics;
    fs.writeFileSync(fileInfoPath, JSON.stringify(fileInfo, null, 2));
  });
  res.render("index", {
    title: "Karaoke",
  });
  res.send(fileInfo[0]);
});

app.listen(port, () => {
	console.log(`>> Server: http://localhost:${port}`);
});
