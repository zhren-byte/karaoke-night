const xhttp = new XMLHttpRequest();
let params = new URL(document.location).searchParams;
let songQuery = params.get("song");
if (songQuery) xhttp.open("GET", `/api/load?song=${songQuery}`, true);
if (!songQuery) xhttp.open("GET", `/api/load`, true);
xhttp.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200 && this.responseText != "") {
		const res = JSON.parse(this.responseText);
		song.querySelector("img").src = res.images[2].url;
		song.querySelector("#author").innerHTML = res.author;
		song.querySelector("#name").innerHTML = res.name;

		let currentIndex = 0;
		let startTime = 0;
		
		function updateProgressBar(duration) {
			let progressStart = null;
			function animate(timestamp) {
				if (!progressStart) progressStart = timestamp;
				const progress = timestamp - progressStart;
				const percentage = Math.min((progress / duration) * 100, 100);
				progressBar.style.width = percentage + "%";

				if (progress < duration) requestAnimationFrame(animate);
			}
			requestAnimationFrame(animate);
		}

		function loadLyrics() {
			function createLyricsElement(line, arr) {
				const p = document.createElement("p");
				const children = lyricsDiv.children.length;
				p.classList = arr;
				p.textContent = line;
				p.addEventListener("click", () => {
					currentIndex = children;
					updateProgressBar(res.duration_ms);
					startTime = res.lyrics[currentIndex - 1].ms;
				});
				return p;
			}
			res.lyrics.forEach((line) => {
				lyricsDiv.appendChild(
					createLyricsElement(
						line.words,
						"text-gray-600 hover:text-white"
					)
				);
			});
		}

		async function displayLyrics() {
			if (currentIndex < res.lyrics.length) {
				let line = res.lyrics[currentIndex];
				const intervalTime = line.ms - startTime;
				startTime = parseInt(line.ms);
				await new Promise((resolve) =>
					setTimeout(resolve, intervalTime)
				);

				for (let i = 0; i < currentIndex; i++) 
					lyricsDiv.children[i].classList = "text-gray-500 hover:text-white";

				lyricsDiv.children[currentIndex].classList = "font-semibold";
				lyricsDiv.children[currentIndex].scrollIntoView({
					block: "center",
					behavior: "smooth",
				});

				currentIndex++;
				displayLyrics();
			}
		}
		updateProgressBar(res.duration_ms);
		loadLyrics();
		displayLyrics();
	}
};

xhttp.send();
