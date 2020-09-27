const users = []

//add user
//we will take 3 arguments user,room and id. user and room comes from client
//Id accociated with the individual socket.every single connection to the server has a unique ID generated for it.
const addUser = ({ id, username, room }) => {
    //Clean the data (trimming and removing spaces)
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    //Store User
    const user = { id, username, room }
    users.push(user)
    return { user }
}
//remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
         return users.splice(index,1)[0]
    }
}

//getuser (allowing us to fetch existing users data)
const getUser = (id) =>
{
     return users.find((user) => user.id === id)
}

//getusersinroom (allowing us to get a complete list of all users in a specific room)
const getUsersInRoom = (room) =>
{
    room = room.trim().toLowerCase()    
    return users.filter((user) => user.room === room)   
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}