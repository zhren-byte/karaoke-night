const lyricsDiv = song.querySelector("#lyrics");
const xhttp = new XMLHttpRequest();
xhttp.open("GET", "/obtain-song", true);
xhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    const res = JSON.parse(this.responseText);
    song.querySelector("#author").innerHTML = res.author;
    song.querySelector("#name").innerHTML = res.name;

    let currentIndex = 0;
    let startTime = 0;

    function updateProgressBar(timestamp) {
      const duration = timestamp;

      let startTime;
      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;

        const percentage = Math.min((progress / duration) * 100, 100);
        progressBar.style.width = percentage + "%";

        if (progress < duration) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }
    async function displayLyrics() {
      if (currentIndex < res.lyrics.length) {
        let line = res.lyrics[currentIndex];
        const timestampMatch = /\[(\d+:\d+\.\d+)\]/.exec(line);

        if (timestampMatch) line = line.replace(timestampMatch[0], "");

        lyricsDiv.querySelectorAll("p").forEach((e) => (e.classList = "mb-4"));

        function createLyricsElement(line) {
          const p = document.createElement("p");
          p.classList.add("mb-4", "bg-blue-500", "px-1", "rounded");
          p.textContent = line;
          return p;
        }

        lyricsDiv.appendChild(createLyricsElement(line));
        // const percentage = (currentIndex / res.lyrics.length) * 100;
        // progressBar.style.width = `${percentage}%`;
        if (timestampMatch) {
          const [minutes, seconds] = timestampMatch[1]
            .split(":")
            .map(parseFloat);
          const currentTime = minutes * 60 + seconds;

          // Calcular el tiempo restante hasta la siguiente línea
          const intervalTime = (currentTime - startTime) * 1000;
          startTime = currentTime;

          await new Promise((resolve) => setTimeout(resolve, intervalTime));
        }

        currentIndex++;
        displayLyrics();
      }
    }
    const finalTimestamp = /\[(\d+:\d+\.\d+)\]/.exec(
      res.lyrics[res.lyrics.length - 1]
    );
    const [minutes, seconds] = finalTimestamp[1].split(":").map(parseFloat);
    updateProgressBar((minutes * 60 + seconds) * 1000);
    displayLyrics();
  }
};

xhttp.send();
