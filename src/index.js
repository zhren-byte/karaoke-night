const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;
const spotifyRoute = require("../routes/spotify.js");
const apiRoute = require("../routes/api.js");
const songsPath = path.join(__dirname, "../json/songs.json");

let songsInfo;
if (fs.existsSync(songsPath)) {
	const songsData = fs.readFileSync(songsPath, "utf8");
	songsInfo = JSON.parse(songsData);
}

app.use(express.json());
app.use("/styles", express.static("public/styles"));
app.use("/js", express.static("public/js"));
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use("/spotify", spotifyRoute);
app.use("/api", apiRoute);

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

app.listen(port, () => {
	console.log(`>> Server: http://localhost:${port}`);
});
