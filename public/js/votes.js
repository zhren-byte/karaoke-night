const socket = io();

const progressBoxes = document.querySelectorAll(".progress-box");
const totalVotesElem = document.getElementById("totalVotes");

let vote = false;

const addVote = (elem, id) => {
	// if (vote) return;
	let voteTo = id;
	socket.emit("send-vote", voteTo);
	vote = true;
	elem.classList.add("active");
};

socket.on("receive-vote", (data) => {
	updatePolls(data);
});

socket.on("update", (data) => {
	updatePolls(data);
});

socket.on("stats", (data) => {
    data.users.forEach(user => {        
        const progressBox = document.createElement('div')
        progressBox.id = user.id
        progressBox.classList = "border-gray-600 progress-box"
        progressBox.innerHTML = 
        `   <h3 class="text-xl font-semibold mb-2">${user.id}</h3>
            <div class="w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-2">
                <div class="h-full bg-yellow-500 percent-tag"></div>
            </div>
        `
        progressBox.addEventListener("click", () => {
            addVote(progressBox, progressBox.id);
        });
        votesBox.appendChild(progressBox)
    });
});

const updatePolls = (data) => {
    const percentTags = document.querySelectorAll(".percent-tag");
	let votingObject = data.users.map((user) => user.id);
	let totalVotes = data.totalVotes;
	totalVotesElem.innerHTML = totalVotes;
	for (let i = 0; i < percentTags.length; i++) {
		let vote = votingObject[progressBoxes[i].id];
		let setWidth = Math.round((vote / totalVotes) * 100);
		const elem = document
			.querySelector(`#${progressBoxes[i].id}`)
			.querySelector(".percent-tag");
		elem.setAttribute("data", `${!setWidth ? 0 : setWidth}%`);
		elem.style.width = `${!setWidth ? 0 : setWidth}%`;
	}
};