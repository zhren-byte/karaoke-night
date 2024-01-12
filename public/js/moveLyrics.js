async function bucle() {
    const lyricsContainer = document.getElementById('lyrics');
    const lyrics = Array.from(lyricsContainer.children);

    function updateLyrics() {
        // Mueve la última línea al principio
        const lastLyric = lyrics.pop();
        lyrics.unshift(lastLyric);

        lyrics.forEach((lyric, index) => {
            lyric.classList.remove(`translate-y-${(index === 1) ? '0' : 'full'}`);
            lyric.classList.add(`-translate-y-${(index === 1) ? '0' : 'full'}`);
            lyric.classList.remove(`-translate-y-${(index === 2) ? '0' : 'full'}`);
            lyric.classList.add(`translate-y-${(index === 2) ? '0' : 'full'}`);
        });
    }

    function animateLyrics() {
        setTimeout(() => {
            updateLyrics();
            requestAnimationFrame(animateLyrics);
        }, 1000); // Tiempo de transición en milisegundos
    }

    animateLyrics();
}

bucle();
