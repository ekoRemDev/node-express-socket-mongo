// we define modules
const express = require('express');
const app = express();
const socket = require('socket.io');

// Mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/node-express-socket-mongo');
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
socketIds = [];

var inputNames = [];
var users = {};
var nameMessage = '';

// default router
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// Name Space Sample
var nsp = io.of('/namespace1');
nsp.on('connection', function(socket) {
    console.log('someone connected on namespace1');
    nsp.emit('hi', 'Hello everyone!');
});

var nsp = io.of('/namespace2');
nsp.on('connection', function(socket) {
    console.log('someone connected on namespace2');
    nsp.emit('hi', 'Hello everyone!');
});

var nsp = io.of('/namespace3');
nsp.on('connection', function(socket) {
    console.log('someone connected on namespace3');
    nsp.emit('hi', 'Hello everyone!');
});



// create a socket connection
io.on('connection', (socket) => {

    var showMessages = function (){
        // io.emit('btnClicked',sendData);
        messageCollection.find({}).limit(5).sort({_id:-1}).toArray((err,docs)=>{
            if(docs){
                for(var i=0; i<docs.length;i++){
                    console.log(' - ' + docs[i].name + ' - ' + docs[i].message)
                }
                // console.log('=========== Start =============');
                // console.log(' there is result');
                // console.log(docs.length);
                // console.log('=========== End =============');
                io.emit('btnClicked',docs);
            }
        });
    };


    socketIds.push(socket);
    console.log(socketIds.length);

    // add record to database when its connected
    let messageCollection = db.collection('messages');
    // messageCollection.insert({message:'new user logged in'});

    showMessages();

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

        // check if message has special function
        var msg = data.message;
        if(msg.substr(0,3) === '/w '){
            console.log('Special Function');

            // count the letters
            var sumLetters = msg.length;
            for(var i = 0 ; i< sumLetters; i++){
                // console.log('there is one on index :' + i + ' - ' + msg.substr(i,i+1).toString());
                console.log(i + ' - ' + msg.substr(i,1).toString());
            }

            // console.log('Message Length :' + sumLetters);

        }else{
            // messages.push(data);
            // console.log(messages.length);
            // inserts data into mongodb
            messageCollection.insert({name:data.name, message:data.message});

            var sendData= {
                name : data.name,
                message:data.message
            };
        }



        showMessages();
    });


    socket.on('messageTyping',(recievedData)=>{
       socket.broadcast.emit('messageTypingWarning',recievedData);
    });

    socket.on('messageNotTyping',()=>{
       socket.broadcast.emit('messageNotTypingWarning');
    });


    socket.on('checkInputName',(data)=>{
        console.log(inputNames);
        if( inputNames.indexOf(data) <0 ){
            socket.inputName = data;
            // add nickname to inputnames array
            inputNames.push(socket.inputName);
            console.log('valid names ' + inputNames.length);
            console.log(inputNames);
        }

        io.emit('inputNames',inputNames);
    });


    socket.on('disconnect', () => {
        console.log('disconnected');
        // remove from connections
        connections.splice(connections.indexOf(socket),1);
        numberOfConnections = connections.length;
        // emit the connection amount to screen
        io.emit('numberOfConnections',numberOfConnections);
        // remove the user name from inputnames array
        inputNames.splice(inputNames.indexOf(socket.inputName),1);
        io.emit('inputNames',inputNames);
        console.log(inputNames);

    });
});