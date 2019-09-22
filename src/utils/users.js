const users = []
//
const addUser = ({id, username, room})=>{
//clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
//validate data
    if (!username || !room) {
        return {
            error: 'USERNAME AND ROOM ARE REQUIRED'
        }
    }
//check for already taken name
    const nameTaken = users.find((user)=>{
        return user.room === room && user.username === username
    })
//validate username
    if (nameTaken) {
        return{
            error: 'USERNAME TAKEN'
        }
    }
//store user
    const user = {id, username, room}
    users.push(user)
    return {
        user
    }
}
//
const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id === id)
    if (index !== -1) {
        return users.splice(index,1)[0]
    }
}
//
const getUser = (id)=>{
    return users.find((user)=>user.id === id)
}
//
const getUsersinRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>user.room === room)
}
//
module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersinRoom
}
// adduser || removeuser || getuser || getusersinroom