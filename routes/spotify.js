const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const fetch = require("isomorphic-unfetch");
const { getPreview } = require("spotify-url-info")(fetch);

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
					Cookie: "sp_t=9d2a91a974a44e3aefb951d7000f86b8; sp_adid=4d27a756-0963-472d-8a92-ccfc01ddb74a; OptanonAlertBoxClosed=2023-08-23T06:06:59.592Z; _gcl_au=1.1.272951740.1700762766; sss=1; sp_dc=AQCYH34jUXKxEnQ-QLsQxC8-uBPk3wW0wXmUTd1jdfyfcq4yJFKNeMZyyU1HQzaQ3ggBEKtr-tso4sOBtYLVFNcmEWC6MtsZlbZW5U2XoueJ_OHiIrB3A1zKFvZCyZm34qvzJQE-jX0fYYUAHWQM-viPNMke2zQz_9oH81PxH7cwr-6kOBHdq_up0CR5rurePi5JvNOTyKeJw0gwAsSjMkXunGdX; sp_key=60b9d8a4-589d-4a63-b522-689542704522; _ga_ZWRF3NLZJZ=GS1.1.1705197604.1.1.1705197820.0.0.0; sp_landing=https%3A%2F%2Fopen.spotify.com%2F%3Fsp_cid%3D9d2a91a974a44e3aefb951d7000f86b8%26device%3Ddesktop; _gid=GA1.2.1595907346.1705380868; OptanonConsent=isIABGlobal=false&datestamp=Tue+Jan+16+2024+01%3A54%3A39+GMT-0300+(hora+est%C3%A1ndar+de+Argentina)&version=202309.1.0&hosts=&landingPath=NotLandingPage&groups=s00%3A1%2Cf00%3A1%2Cm00%3A1%2Ct00%3A1%2Ci00%3A1%2Cf11%3A1%2Cm03%3A1&AwaitingReconsent=false&geolocation=AR%3BB&isGpcEnabled=0&browserGpcFlag=0; _ga=GA1.2.1249188117.1692770802; _ga_ZWG1NSHWD8=GS1.1.1705383262.156.1.1705383270.0.0.0",
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
				Cookie: "sp_dc=AQCYH34jUXKxEnQ-QLsQxC8-uBPk3wW0wXmUTd1jdfyfcq4yJFKNeMZyyU1HQzaQ3ggBEKtr-tso4sOBtYLVFNcmEWC6MtsZlbZW5U2XoueJ_OHiIrB3A1zKFvZCyZm34qvzJQE-jX0fYYUAHWQM-viPNMke2zQz_9oH81PxH7cwr-6kOBHdq_up0CR5rurePi5JvNOTyKeJw0gwAsSjMkXunGdX;",
			},
		}
	)
	.then((response) => {
		return res.json(response.data);
	})
	.catch((err) => res.send("error"));
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
				// console.log(response.data.data.searchV2.tracksV2.items[0].item.data.name)
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
	if (track) {
		return axios
			.get(
				`https://spclient.wg.spotify.com/color-lyrics/v2/track/${track}/image/https%3A%2F%2Fi.scdn.co%2Fimage%2Fab67616d0000b273833f2d8d0037a5ae87595fb0?format=json&vocalRemoval=false&market=from_token`,
				{
					headers: {
						"App-Platform": "WebPlayer",
						Authorization: `Bearer ${await getToken()}`,
					},
				}
			)
			.then((response) => {
				const lyrics = response.data.lyrics.lines.map((line) => ({
					ms: line.startTimeMs,
					words: line.words,
				}));
				getPreview(
					`https://open.spotify.com/intl-es/track/${track}`
				).then((data) => {
					const song = {
						name: data.title,
						author: data.artist,
						image: data.image,
						track,
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
			.catch((err) => console.error(err));
	}
});

module.exports = router;
