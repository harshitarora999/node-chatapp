// SERVER
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {addUser,removeUser,getUser,getUsersinRoom} = require('./utils/users')
const { generateMessages, locationMessages} = require('./utils/message')
//
const app = express()
const server = http.createServer(app)
const io = socketio(server)
//
const port = process.env.PORT || 5000
const publicDirectoryPath = path.join(__dirname,'../public')
//
app.use(express.static(publicDirectoryPath))
io.on('connection', (socket)=>{//posting message globally
    console.log('TESTING')
    //
    socket.on('join',(options,callback)=>{
        const {error,user} = addUser({id: socket.id,...options})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessages('APP SAYS','Welcome!!!!'))//posting message to user only
        socket.broadcast.to(user.room).emit('message', generateMessages('APP SAYS',`${user.username} HAS JOINED THE ${user.room}`))//showing to user only but globally
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersinRoom(user.room)
        })
        callback()
    })
    //
    socket.on('sendMessage',(message, callback)=>{//message sending by user
        const user = getUser(socket.id)
        const badwords = new Filter()//filtering of the messages
        if (badwords.isProfane(message)) {
            return callback('WORDS NOT ALLOWED')
        }
        io.to(user.room).emit('message',generateMessages(user.username,message))//sending the message after filering
        callback()
    })
    //
    socket.on('LOCATION',(coords,callback)=>{//location message
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',locationMessages(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    //
    socket.on('disconnect',()=>{//only to user
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessages('ALERT',`${user.username} HAS LEFT THE ROOM`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersinRoom(user.room)
            })    
        }
    })
})
//
server.listen(port,()=>{//setting up the port for app to run on
    console.log(`SERVER ON PORT ${port}`)
})
//
//socket.emeit, | io.emit,   | socket.broadcast.emit       --message broadcasting methods
//              | io.to.emit | socket.broadcast.to.emit    --message broadcasting methods

//
//server (emit) -> client(receive) - countUpdated
//client (emit) -> server(receive) - incremented