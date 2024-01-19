const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;
const spotifyRoute = require("../routes/spotify.js");
const apiRoute = require("../routes/api.js");
const songsPath = path.join(__dirname, "../json/songs.json");

let totalVotes = 0;
let users = [];

let songsInfo;
if (fs.existsSync(songsPath)) {
	const songsData = fs.readFileSync(songsPath, "utf8");
	songsInfo = JSON.parse(songsData);
}

app.use(express.json());
app.use("/", express.static("public/assets"));
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
		acc[song.author].push({song: song.name, track: song.track});
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

io.on("connection", (socket) => {
	users.push({ id: socket.id, votes: 0 });
	socket.emit("stats", { users, totalVotes });

	socket.on("send-vote", (voteTo) => {
		totalVotes += 1;
		users.find((user) => user.id === voteTo).votes += 1
		socket.broadcast.emit("receive-vote", { users, totalVotes });
		socket.emit("update", { users, totalVotes });
		console.log(users)
	});

	socket.on("disconnect", function () {
		users = users.filter((user) => user.id !== socket.id);
	});
});

server.listen(port, () => {
	console.log(`>> Server: http://localhost:${port}`);
});
