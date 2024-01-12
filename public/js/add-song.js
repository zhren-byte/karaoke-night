addSong.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
        songTitle: songTitle.value,
        songArtist: songArtist.value,
        songLyrics: songLyrics.value
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/add-song');

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                console.log(xhr.responseText);
            } else {
                console.error('Error:', xhr.status);
            }
        }
    };
    xhr.send(JSON.stringify(data));
});
