const express = require("express");
const router = express.Router();
const fs = require("node:fs");

router.get("/lrc-to-ms", function (req, res) {
	const newSong = [];
	songsInfo.map((e) => {
		const lyrics = [];
		e.lyrics.forEach((line) => {
			const timestampMatch = /\[(\d+:\d+\.\d+)\]/.exec(line);
			const [minutes, seconds] = timestampMatch[1]
				.split(":")
				.map(parseFloat);
			const currentTime = ((minutes * 60 + seconds) * 1000).toFixed(0);
			lyrics.push({
				ms: currentTime,
				words: line.replace(timestampMatch[0], ""),
			});
		});
		newSong.push({
			name: e.name,
			author: e.author,
			image: e.image ? e.image : "",
			lyrics,
		});
	});
	res.json(newSong);
	fs.writeFileSync(songsPath, JSON.stringify(newSong, null, 2));
});

router.get("/spotify-to-lrc", function (req, res) {
	const track = req.query.track;
	if (track) {
		return axios
			.get(
				`https://spclient.wg.spotify.com/color-lyrics/v2/track/${track}/image/https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273833f2d8d0037a5ae87595fb0?format=json&vocalRemoval=false&market=from_token`,
				{
					headers: {
						"App-Platform": "WebPlayer",
						Authorization: `Bearer ${process.env.Authorization}`,
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

module.exports = router;
