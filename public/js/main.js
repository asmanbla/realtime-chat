const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// join chatroom 
socket.emit('joinRoom', { username, room });

// pesan chat biasa
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // auto scroll ke bawah
    chatMessage.scrollTop = chatMessage.scrollHeight;
});

// update room & users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// kirim pesan
chatForm.addEventListener('submit', e => {
    e.preventDefault(); 
    const msg = e.target.elements.msg.value;

    // kirim chat ke server
    socket.emit('chatMessage', msg);

    // clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// render pesan ke chatbox
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">${message.text}</p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}

// ganti nama room
function outputRoomName(room) {
    roomName.innerText = room;
}

// render user list
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

// === HANDLE NOTIFIKASI ===
socket.on('sendNotification', (data) => {
    showNotification(`🔔 Pesan Baru dari Room ${data.room}`, data.username, data.text);
});

// tampilkan notifikasi sederhana
function showNotification(message, sender, text) {
    // kalau user lagi di tab lain → pakai title bar
    if (document.hidden) {
        document.title = message;
    }

    // kalau browser support Notification API
    if (Notification.permission === "granted" && document.hidden) {
        new Notification(message, {
            body: `Pengirim: ${sender}\n${text}`,
            icon: "/images/chat-icon.png"
        });
    }
}

// reset title kalau user balik ke tab
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        document.title = "Chat Room";
    }
});

// minta izin notif pas pertama kali
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}
