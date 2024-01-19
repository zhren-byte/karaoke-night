const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const router = express.Router();
const axios = require("axios");

const songsPath = path.join(__dirname, "../json/songs.json");

let songsInfo;
if (fs.existsSync(songsPath)) {
	const songsData = fs.readFileSync(songsPath, "utf8");
	songsInfo = JSON.parse(songsData);
}

const getToken = async () => {
	return axios
		.get(
			`https://open.spotify.com/get_access_token?reason=transport&productType=web-player`,
			{
				headers: {
					Cookie: `sp_dc=${process.env.COOKIE_SPOTIFY}`,
				},
			}
		)
		.then((response) => {
			return response.data.accessToken;
		})
		.catch((err) => console.log(err));
};

router.get("/token", async function (req, res) {
	return axios
		.get(
			`https://open.spotify.com/get_access_token?reason=transport&productType=web-player`,
			{
				headers: {
					Cookie: `sp_dc=${process.env.COOKIE_SPOTIFY}`,
				},
			}
		)
		.then((response) => {
			return res.json(response.data);
		})
		.catch((err) => res.send(err));
});

router.get("/search", async function (req, res) {
	const search = req.query.query;
	if (search)
		return axios
			.get(
				`https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchTracks&variables=%7B%22searchTerm%22%3A%22${search}%22%2C%22offset%22%3A0%2C%22limit%22%3A4%2C%22numberOfTopResults%22%3A3%2C%22includeAudiobooks%22%3Afalse%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2216c02d6304f5f721fc2eb39dacf2361a4543815112506a9c05c9e0bc9733a679%22%7D%7D`,
				{
					headers: {
						"App-Platform": "WebPlayer",
						Authorization: `Bearer ${await getToken()}`,
					},
				}
			)
			.then((response) => {
				const songList = response.data.data.searchV2.tracksV2.items.map(
					(line) => {
						return {
							name: line.item.data.name,
							author: line.item.data.artists.items[0].profile
								.name,
							image: line.item.data.albumOfTrack.coverArt
								.sources[0].url,
							track: line.item.data.id,
						};
					}
				);
				res.json(songList);
			})
			.catch((err) => {
				console.error(err);
			});
});

router.get("/song", async function (req, res) {
	const track = req.query.track;
	if (!track) return res.json({ response: "Ingresa el ID de la canción" });
	const isFound = songsInfo.some((song) => {
		if (song.track === track) return true;
		return false;
	});
	if (isFound) return res.json({ response: "Esta canción ya existe" });

	const token = await getToken();
	return axios
		.get(
			`https://spclient.wg.spotify.com/color-lyrics/v2/track/${track}/image/https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273833f2d8d0037a5ae87595fb0?format=json&vocalRemoval=false&market=from_token`,
			{
				headers: {
					"App-Platform": "WebPlayer",
					Authorization: `Bearer ${token}`,
				},
			}
		)
		.then((lyricsInfo) => {
			axios
				.get(
					`https://api.spotify.com/v1/tracks?ids=${track}&market=from_token`,
					{
						headers: {
							"App-Platform": "WebPlayer",
							Authorization: `Bearer ${token}`,
						},
					}
				)
				.then((info) => {
					const lyrics = lyricsInfo.data.lyrics.lines.map((line) => ({
						ms: line.startTimeMs,
						words: line.words,
					}));
					const song = {
						name: info.data.tracks[0].name,
						author: info.data.tracks[0].artists[0].name,
						images: info.data.tracks[0].album.images,
						album: info.data.tracks[0].album.name,
						duration_ms: info.data.tracks[0].duration_ms,
						track: info.data.tracks[0].id,
						lyrics,
					};
					songsInfo.push(song);
					fs.writeFileSync(
						songsPath,
						JSON.stringify(songsInfo, null, 2)
					);
					res.redirect("/?song=" + track);
				});
		})
		.catch((err) => {
			res.json({
				lyrics: false,
			});
			console.error(err.data.status, err.data.statusText);
		});
});

module.exports = router;
