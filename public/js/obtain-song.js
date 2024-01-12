const lyricsDiv = song.querySelector("#lyrics");
const xhttp = new XMLHttpRequest();
xhttp.open("GET", "/obtain-song", true);
xhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    const res = JSON.parse(this.responseText);
    song.querySelector("#author").innerHTML = res.author;
    song.querySelector("#name").innerHTML = res.name;

    let currentIndex = 0;
    let lineInScreen = 0;
    let startTime = 0;

    function updateProgressBar(timestamp) {
      const duration = timestamp;

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

        if (timestampMatch) {
          line = line.replace(timestampMatch[0], "");
          lyricsDiv.appendChild(
            createLyricsElement(
              line,
              "translate-y-full -translate-x-1/2 top-1/2 left-1/2 absolute text-nowrap transition ease-in-out text-2xl"
            )
          );
          const [minutes, seconds] = timestampMatch[1]
            .split(":")
            .map(parseFloat);
          const currentTime = minutes * 60 + seconds;

          const intervalTime = (currentTime - startTime) * 1000;
          startTime = currentTime;
          await new Promise((resolve) => setTimeout(resolve, intervalTime));
        }

        function createLyricsElement(line, arr) {
          const p = document.createElement("p");
          p.classList = arr;
          p.textContent = line;
          return p;
        }
        if (lyricsDiv.childNodes.length >= 3) {
          lyricsDiv.removeChild(lyricsDiv.firstElementChild); // Elimina la línea anterior
          lyricsDiv.removeChild(lyricsDiv.firstElementChild.nextElementSibling); // Elimina la línea anterior
        }
        if (lyricsDiv.firstElementChild != null) {
          lyricsDiv.firstElementChild.classList =
            "-translate-y-0 -translate-x-1/2 top-1/2 left-1/2 absolute text-nowrap transition ease-in-out text-gray-600";
          if (lyricsDiv.firstElementChild.nextElementSibling != null) {
            lyricsDiv.firstElementChild.nextElementSibling.classList =
              "-translate-y-0 -translate-x-1/2 top-1/2 left-1/2 absolute text-nowrap transition ease-in-out text-gray-500";
          }
        }

        lyricsDiv.appendChild(
          createLyricsElement(
            res.lyrics[currentIndex + 2],
            "translate-y-[200%] -translate-x-1/2 top-1/2 left-1/2 absolute text-nowrap transition-transform ease-in-out text-gray-500"
          )
        );
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
