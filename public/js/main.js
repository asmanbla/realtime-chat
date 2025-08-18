const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// join chatroom 
socket.emit('joinRoom', { username, room });

socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Scroll down new message
    chatMessage.scrollTop = chatMessage.scrollHeight;
});

//get room and users 
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault(); 
    const msg = e.target.elements.msg.value;

    // kirim chat ke halaman
    socket.emit('chatMessage', msg);

    //clear input 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
	<p class="text">
    ${message.text}
	</p>`
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to chat room 
function outputRoomName(room) {
    roomName.innerText = room;
}

//add user list 
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}