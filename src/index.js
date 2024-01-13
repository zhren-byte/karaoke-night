const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const axios = require("axios");
const app = express();
const dotenv = require("dotenv");
const fetch = require("isomorphic-unfetch");
const { getData, getPreview, getTracks, getDetails } =
	require("spotify-url-info")(fetch);
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

app.get("/spotify-search", function (req, res) {
	const search = req.query.search;
	if (search)
		return axios
			.get(
				`https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchTracks&variables=%7B%22searchTerm%22%3A%22${search}%22%2C%22offset%22%3A0%2C%22limit%22%3A4%2C%22numberOfTopResults%22%3A3%2C%22includeAudiobooks%22%3Afalse%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2216c02d6304f5f721fc2eb39dacf2361a4543815112506a9c05c9e0bc9733a679%22%7D%7D`,
				{
					headers: {
						Accept: "application/json",
						"Accept-Language": "es-419",
						"App-Platform": "WebPlayer",
						Authorization: `Bearer ${process.env.Authorization}`,
						"Client-Token": process.env.ClientToken,
						Referer: "https://open.spotify.com/",
						"Sec-Ch-Ua":
							'"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
						"Sec-Ch-Ua-Mobile": "?0",
						"Sec-Ch-Ua-Platform": "Windows",
						"Spotify-App-Version": "1.2.30.104.ge8490e8d",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					},
				}
			)
			.then((response) => {
				// console.log(response.data.data.searchV2.tracksV2.items)
				const songList = response.data.data.searchV2.tracksV2.items.map((line) => ({
					name: line.item.data.name,
					author: line.item.data.artists.items[0].profile.name,
					image: line.item.data.albumOfTrack.coverArt.sources[0].url,
					track: line.item.data.id,
				}));
				res.json(songList);
			})
			.catch((err) => {
				// getPreview(
				// 	`https://open.spotify.com/intl-es/track/${track}`
				// ).then((data) =>
				// 	res.send({
				// 		name: data.title,
				// 		author: data.artist,
				// 		image: data.image,
				// 		lyrics: false,
				// 	})
				// );
				console.error(err);
			});
});
app.get("/spotify-song", function (req, res) {
	const track = req.query.track;
	if (track) {
		return axios
			.get(
				`https://spclient.wg.spotify.com/color-lyrics/v2/track/${track}/image/https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273833f2d8d0037a5ae87595fb0?format=json&vocalRemoval=false&market=from_token`,
				{
					headers: {
						Accept: "application/json",
						"Accept-Language": "es-419",
						"App-Platform": "WebPlayer",
						Authorization: `Bearer ${process.env.Authorization}`,
						"Client-Token": process.env.ClientToken,
						Referer: "https://open.spotify.com/",
						"Sec-Ch-Ua":
							'"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
						"Sec-Ch-Ua-Mobile": "?0",
						"Sec-Ch-Ua-Platform": "Windows",
						"Spotify-App-Version": "1.2.30.104.ge8490e8d",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					},
				}
			)
			.then(() => {
				getPreview(
					`https://open.spotify.com/intl-es/track/${track}`
				).then((data) =>
					res.send({
						name: data.title,
						author: data.artist,
						image: data.image,
						lyrics: true,
					})
				);
			})
			.catch((err) => {
				getPreview(
					`https://open.spotify.com/intl-es/track/${track}`
				).then((data) =>
					res.send({
						name: data.title,
						author: data.artist,
						image: data.image,
						lyrics: false,
					})
				);
				console.error(err.request.data);
			});
	}
});
app.get("/spotify-to-lrc", function (req, res) {
	const track = req.query.track;
	if (track) {
		return axios
			.get(
				`https://spclient.wg.spotify.com/color-lyrics/v2/track/${track}/image/https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273833f2d8d0037a5ae87595fb0?format=json&vocalRemoval=false&market=from_token`,
				{
					headers: {
						Accept: "application/json",
						"Accept-Language": "es-419",
						"App-Platform": "WebPlayer",
						Authorization: `Bearer ${process.env.Authorization}`,
						"Client-Token": process.env.ClientToken,
						Referer: "https://open.spotify.com/",
						"Sec-Ch-Ua":
							'"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
						"Sec-Ch-Ua-Mobile": "?0",
						"Sec-Ch-Ua-Platform": "Windows",
						"Spotify-App-Version": "1.2.30.104.ge8490e8d",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					},
				}
			)
			.then((response) => {
				const lyrics = response.data.lyrics.lines.map((line) => {
					const time = new Date(parseInt(line.startTimeMs))
						.toISOString()
						.slice(14, 22);
					return `[${time}]${line.words}`;
				});
				getPreview(
					`https://open.spotify.com/intl-es/track/${track}`
				).then((data) => {
					const song = {
						name: data.title,
						author: data.artist,
						image: data.image,
						lyrics,
					};
					songsInfo.push(song);
					fs.writeFileSync(
						songsPath,
						JSON.stringify(songsInfo, null, 2)
					);
					res.send(song);
				});
			})
			.catch((err) => console.error(err));
	}
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
