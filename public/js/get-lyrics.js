function getLyrics(item){
    const xhttp = new XMLHttpRequest();
	xhttp.open("GET", `/spotify/lyrics?track=${item.getAttribute('data')}`, true);
	xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            lyricsParagraph.innerHTML = ""
			const res = JSON.parse(this.responseText);
			res.forEach((song) => {
                lyricsParagraph.innerHTML += song
				lyricsParagraph.innerHTML += "<br>"
			});
		}
	};
	xhttp.send();
}