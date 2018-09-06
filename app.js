// we define modules
const express = require('express');
const app = express();
const socket = require('socket.io');

// create a server on port 3000
const server = app.listen(3000, () => {
    console.log('server runs on 3000');
});

// define socket
const io = socket(server);

// we will track the active users
// we define an connection array to store active sessions
// on each new connection and disconnect event we will add/remove
connections = [];
messages = [];

// default router
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// create a socket connection
io.on('connection', (socket) => {

    console.log('user connected');
    // we push new socket to connections array
    connections.push(socket);
    numberOfConnections = connections.length;
    // emit the connection amount to screen
    io.emit('numberOfConnections',numberOfConnections);


    var newMessage = 'New Message from Socket';
    // emitted from index html
    socket.on('fromIndexMessage', () => {
        // do things and emit to index html as
        // this will update all users screen
        io.emit('fromAppToIndexMessage', newMessage);
        // this will update all users screen except the sender
        // socket.broadcast.emit('fromAppToIndexMessage', newMessage)
    });


    // recieve data from index.html
    socket.on('btnClick', (data)=>{
        messages.push(data);
        console.log(messages.length);

        var sendData= {
          name : data.name,
          message:data.message
        };

       io.emit('btnClicked',sendData);
    });


    socket.on('messageTyping',(recievedData)=>{
       socket.broadcast.emit('messageTypingWarning',recievedData);
    });

    socket.on('disconnect', () => {
        console.log('disconnected');
        // remove from connections
        connections.splice(connections.indexOf(socket),1);
        numberOfConnections = connections.length;
        // emit the connection amount to screen
        io.emit('numberOfConnections',numberOfConnections);
    });

});