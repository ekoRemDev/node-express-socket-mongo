// we define modules
const express = require('express');
const app = express();
const socket = require('socket.io');

// Mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/development');
const db = mongoose.connection;
db.on('error',(err)=>{
    if(err){
        throw err;
        console.log(err.message);
    }
});


// connect to db
db.once('open',()=>{
   console.log('we are connected to mongodb');
});


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
// messages = [];

// default router
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// create a socket connection
io.on('connection', (socket) => {


    // add record to database when its connected
    let messageCollection = db.collection('messages');
    messageCollection.insert({message:'new user logged in'});

    messageCollection.find({}).toArray((err,docs)=>{
        if(docs){
            console.log('=========== Start =============');
            console.log(' there is result');
            console.log(docs.length);
            console.log('=========== End =============');
        }
    });



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
        // messages.push(data);
        // console.log(messages.length);
        // inserts data into mongodb
        messageCollection.insert({message:data.message});

        var sendData= {
          name : data.name,
          message:data.message
        };

       io.emit('btnClicked',sendData);
    });


    socket.on('messageTyping',(recievedData)=>{
       socket.broadcast.emit('messageTypingWarning',recievedData);
    });

    socket.on('messageNotTyping',()=>{
       socket.broadcast.emit('messageNotTypingWarning');
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