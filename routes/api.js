const express = require("express");
const router = express.Router();
const fs = require("node:fs");
const path = require("node:path");
const songsPath = path.join(__dirname, "../json/songs.json");

let songsInfo;
if (fs.existsSync(songsPath)) {
	const songsData = fs.readFileSync(songsPath, "utf8");
	songsInfo = JSON.parse(songsData);
}

router.get("/load", function (req, res) {
	if (req.query.song) return res.json(songsInfo.find((obj) => obj.track === req.query.song));
	let song = songsInfo[Math.floor(Math.random() * songsInfo.length)];
	res.json(song);
});

router.get("/add-song", function (req, res) {
	res.render("addSong", {
		title: "Karaoke Night - Add",
	});
});

router.post("/add-song", function (req, res) {
	songsInfo.push({
		name: req.body.songTitle,
		author: req.body.songArtist,
		lyrics: req.body.songLyrics.split("\n"),
	});
	fs.writeFileSync(songsPath, JSON.stringify(songsInfo, null, 2));
});

module.exports = router;
