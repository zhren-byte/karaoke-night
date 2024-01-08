const xhttp = new XMLHttpRequest();
xhttp.open("GET", "/obtain-song", true);
xhttp.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
		const res = JSON.parse(this.responseText);
		const lyricsDiv = song.querySelector("#lyrics");
		song.querySelector("#author").innerHTML = res.author;
		song.querySelector("#name").innerHTML = res.name;

		let currentIndex = 0;
        let startTime = 0;

		let intervalTime = 1000; // Intervalo de tiempo entre líneas
		// Mostrar una línea de letra cada segundo
		const intervalId = setInterval(() => {
			if (currentIndex < res.lyrics.length) {
				const line = res.lyrics[currentIndex];
				if (line === "<br>") {
					lyricsDiv.innerHTML = "";
				} else {
					lyricsDiv.querySelectorAll("p").forEach(e => {
						e.classList = "mb-4"
					});
					lyricsDiv.innerHTML += `<p class="mb-4 bg-blue-500 px-1 rounded">${line}</p>`;
				}
				const percentage = (currentIndex / res.lyrics.length) * 100;
                progressBar.style.width = `${percentage}%`;
				const timestampMatch = /\[(\d+:\d+\.\d+)\]/.exec(res.lyrics[currentIndex+1]);
                if (timestampMatch) {
                    const [minutes, seconds] = timestampMatch[1].split(":").map(parseFloat);
                    const currentTime = minutes * 60 + seconds;

                    // Calcular el tiempo restante hasta la siguiente línea
                    intervalTime = (currentTime - startTime) * 1000
                    startTime = currentTime;
                }
				currentIndex++;
			} else {
				// Todas las letras han sido mostradas, limpiar el intervalo
				clearInterval(intervalId);
			}
		}, intervalTime);
	}
};
xhttp.send();
