function search() {
	songBox.innerHTML = "";
	const xhttp = new XMLHttpRequest();
	xhttp.open("GET", `/spotify/search?query=${searchInput.value}&limit=10`, true);
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			const res = JSON.parse(this.responseText);
			res.forEach((song) => {
				const songItem = document.createElement("div");
				songItem.setAttribute( "onclick", "getLyrics(this)" )
				songItem.setAttribute( "data", song.track )
				songItem.classList = "flex items-center gap-4";
				const songImg = document.createElement("img");
				songImg.src = song.image;
				songImg.classList = "w-12 h-12 rounded-full mr-2";
				songItem.appendChild(songImg);
				const songInfo = document.createElement("div");
				songInfo.innerHTML = `
					<h3 class="font-semibold">${song.name}</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">${song.author}</p>
				`;
				songItem.appendChild(songInfo);
				songBox.appendChild(songItem);
			});
		}
	};
	xhttp.send();
}
