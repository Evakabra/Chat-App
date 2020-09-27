const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {addUser, removeUser , getUser , getUsersInRoom } = require('./utils/users')

//as we are using web.socket, we need to change the way of starting express. 
//if we will not write the below mentioned code, it will done this thing behind the scenes.
//(we are doing refactoring as socket io expects to be called with raw http server)
//Basically we are creating our server outside express library and configuring it to use our express app
const app = express()
const server = http.createServer(app)
//creating new instance of socket.io to configure web sockets to work with our server
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        const { error , user} = addUser({ id: socket.id , username, room })

        if(error) {
           return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
           room: user.room,
           users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user)
        {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }      
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})