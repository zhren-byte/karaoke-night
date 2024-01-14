function search() {
	songBox.innerHTML = "";
	songBox.classList.remove("hidden");
	const xhttp = new XMLHttpRequest();
	xhttp.open("GET", `/spotify-search?search=${searchInput.value}`, true);
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			const res = JSON.parse(this.responseText);
			res.forEach((song) => {
				const songLink = document.createElement("a");
				songLink.href = "/spotify-song?track=" + song.track
				songLink.classList = "flex items-center mb-2";
				const songImg = document.createElement("img");
				songImg.src = song.image;
				songImg.classList = "w-12 h-12 rounded-full mr-2";
				songLink.appendChild(songImg);
				const songInfo = document.createElement("div");
				songInfo.innerHTML = `
					<h4 class="text-lg font-semibold">${song.name}</h4>
					<p class="text-sm">${song.author}</p>
				`;
				songLink.appendChild(songInfo);
				songBox.appendChild(songLink);
			});
		}
	};
	xhttp.send();
}
