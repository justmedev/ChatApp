//const socket = io('ws://localhost:8080', { 'connect timeout': 5000 });
var socket = io.connect('ws://192.168.4.48:8080', { 'connect timeout': 5000 });
var id = getID();
var name = checkName();

$(document).ready(() => {
    if (!socket.connected) {
        console.log('Something went wrong trying to connect to the server. Retrying...');
        showToast("Couldn't connect to the server.<br>Are you connected to the internet?")
        setTimeout(() => {
            if (!socket.connected) {
                showToast("Our servers seem to be down... Please try again later.");
            }

        }, 15000)
        return;
    }
});

console.log('Connecting...');
socket.on('connect', function () {
    console.log("Connected to server.");
    showToast('Connection successful!')
    console.log('Syncing messages with server...');

    socket.emit('init', { 'author': name, 'uuid': id })
    socket.emit('userExists', { uuid: id });
});

socket.on('disconnect', function () {
    console.log("You disconnected.");
    showToast('You got disconnected!');
    setTimeout(() => {
        window.location.reload();
    }, 2000)
});

socket.on('userExistsResult', (data) => {
    if (data.uuid != id) return;
    if (!data.result) window.location.href = "/login/";
});

socket.on('sync', (data) => {
    if (data.uuid != id) return;

    const box = $('#cbcontent');
    var content;

    for (msg of data.messages) {
        date = [new Date(msg.timestamp).getHours(), new Date(msg.timestamp).getMinutes()];
        for (i in date) {
            if (parseInt(date[i]) < 10) {
                date[i] = '0' + date[i];
            }
        }

        msg.displayTimestamp = `${date[0]}:${date[1]}`;

        if (msg.author_uuid == id) {
            content = $(`
                <div class="outgoing">
                    <div class="float-start">
                        You: ${msg.message}
                    </div>
                    <div class="float-end timestamp">${msg.displayTimestamp}</div>
                </div>
            `);
            /* <input type="image" class="float-end" onclick="messageMenu()" src="/menu.svg"></input> <-- 3dots menu */
        } else {
            content = $(`
                <div class="ingoing">
                    <div class="float-start">
                        ${msg.author_name}: ${msg.message}
                    </div>
                    <div class="float-end timestamp">${msg.displayTimestamp}</div>
                </div>
            `);
            /* <input type="image" class="float-end" onclick="messageMenu()" src="/menu.svg"></input> <-- 3dots menu */
        }
        box.append(content);
    }
    $('#cbcontent').removeClass('blur');
    $('#loader').hide();
});

socket.on('message', (data) => {
    const box = $('#chatbox');
    const boxContent = $('#cbcontent');
    var content;
    var date = [new Date(data.timestamp).getHours(), new Date(data.timestamp).getMinutes()];
    for (i in date) {
        if (parseInt(date[i]) < 10) {
            date[i] = '0' + date[i];
        }
    }

    data.displayTimestamp = `${date[0]}:${date[1]}`;
    if (data.uuid == id) {
        content = $(`
            <div class="outgoing">
                <div class="float-start">
                    You: ${data.message}
                </div>
                <input type="image" class="float-end" onclick="messageMenu()" src="/menu.svg"></input>
                <div class="float-end timestamp">${msg.displayTimestamp}</div>
            </div>

            `);
    } else {
        content = $(`
            <div class="ingoing">
                <div class="float-start">
                    ${data.author}: ${data.message}
                </div>
                <input type="image" class="float-end" onclick="messageMenu()" src="/menu.svg"></input>
                <div class="float-end timestamp">${msg.displayTimestamp}</div>
            </div>
            `);
    }
    boxContent.append(content);
    box.animate({ scrollTop: box.outerHeight(true) }, 1);
});

socket.on('error', (data) => {
    window.location.href = `/error/?code=${data.code}&message=${data.message}`;
});

$(document).on('keypress', function (e) {
    if (e.which == 13) {
        if ($('#msgInput').is(':focus')) {
            sendMsg();
        }
    }
});

$(document).submit(function () {
    sendMsg();
});

$(document).on('keyup', function (e) {
    if (e.which == 13) {
        if ($('#msgInput').is(':focus')) {
            sendMsg();
        }
    }
});

function sendMsg() {
    const msg = $('#msgInput').val().trim();
    if (!msg.match(/^[.\n]*$/g)) {
        if (msg.length <= 257) {
            $('#msgInput').val('');
            socket.emit('message', { 'uuid': id, 'author': name, 'message': msg, 'timestamp': new Date() })
        } else {
            showToast('This message is too long. Max is 256.')
        }
    } else {
        return;
    }
}

function checkName() {
    var name = localStorage.getItem('displayName');
    if (name == null) {
        window.location.href = '/login/';
    } else {
        return name;
    }
}

function getID() {
    var uuid = localStorage.getItem('uuid');
    if (uuid == null) {
        window.location.href = '/login/';
    }
    return uuid;
}

function genID() {
    return Math.floor(Math.random() * Math.floor(Math.random() * Date.now())) * 2;
}

function showToast(message) {
    $('.toast-body').html(message);
    $('.toast').toast('show');
}