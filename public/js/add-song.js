function submitForm() {
	const form = document.getElementById('addSong');
    const formData = new FormData(form);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/add-song', true);

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
        }
    };
	console.log(formData)
    xhr.send(JSON.stringify(formData));
}
