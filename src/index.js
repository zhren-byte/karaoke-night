const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const axios = require("axios");
const app = express();
const dotenv = require("dotenv");
const fetch = require('isomorphic-unfetch')
const { getData, getPreview, getTracks, getDetails } =
  require('spotify-url-info')(fetch)
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
	// Agrupar canciones por artista
	const groupedSongs = songsInfo.reduce((acc, song) => {
		if (!acc[song.author]) acc[song.author] = [];
		acc[song.author].push(song.name);
		return acc;
	}, {});

	// Convertir el objeto en un array de objetos para Handlebars
	const artistSongs = Object.keys(groupedSongs).map((author) => ({
		author,
		songs: groupedSongs[author],
	}));
	res.render("index", {
		title: "Karaoke Night",
		artistSongs,
	});
});

app.get("/obtain-song", function (req, res) {
	let song = songsInfo[Math.floor(Math.random() * songsInfo.length)];
	res.json(song);
});

app.get("/spotify", function (req, res) {
  const track = req.query.track
	if(track) return axios
		.get(`https://spclient.wg.spotify.com/color-lyrics/v2/track/${track}/image/https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273833f2d8d0037a5ae87595fb0?format=json&vocalRemoval=false&market=from_token`, {
			headers: {
        "Accept": "application/json",
        "Accept-Language": "es-419",
        "App-Platform": "WebPlayer",
         "Authorization": `Bearer ${process.env.Authorization}`,
         "Client-Token": process.env.ClientToken,
         "Referer": "https://open.spotify.com/",
         "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
         "Sec-Ch-Ua-Mobile":"?0",
         "Sec-Ch-Ua-Platform": "Windows",
         "Spotify-App-Version": "1.2.30.104.ge8490e8d",
         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
		})
		.then((response) => res.json(response.data))
		.catch((err) => console.error(err));
  getPreview('https://open.spotify.com/intl-es/track/1tW6LiJGXGlReuNP38wrKb?si=846143622bbd4d97').then(data =>
    console.log(data)
  )
  return res.render("spotifyFinder")
});

app.get("/add-song", function (req, res) {
	res.render("addSong", {
		title: "Karaoke Night - Add",
	});
});

app.post("/add-song", function (req, res) {
	songsInfo.push({
		name: req.body.songTitle,
		author: req.body.songArtist,
		lyrics: req.body.songLyrics.split("\n"),
	});
	fs.writeFileSync(songsPath, JSON.stringify(songsInfo, null, 2));
});

app.get("/text-to", function (req, res) {
	let lyrics = [];
	var lineReader = require("readline").createInterface({
		input: require("fs").createReadStream("awdo.txt"),
	});

	lineReader.on("line", function (line) {
		if (line === "") return lyrics.push("<br>");
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
