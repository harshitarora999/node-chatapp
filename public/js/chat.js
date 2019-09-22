// CLIENT 
const socket = io()
//
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $LOCATIONFormButton = document.querySelector('#LOCATION')
const $messages = document.querySelector('#messages')
//
//templates inserting them here from the html file
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//
//options
const {username,room} =Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoscroll = ()=>{
    //new message element 
    const $newMessage = $messages.lastElementChild
    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visible height
    const visisbleheight = $messages.offsetHeight
    //height of messages  container 
    const containerHeight = $messages.scrollHeight
    //how far scrolled
    const scrolloffSet = $messages.scrollTop + visisbleheight
    if (containerHeight - newMessageHeight <= scrolloffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
//
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{//rendring up the message to print on screen not on console
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
//
socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate,{//rendring up the location as link on screen
        usename: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
//
socket.on('roomData',({room,users})=>{
    const html =  Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML
})
//
$messageForm.addEventListener('submit',(e)=>{//setting up the button 
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled','disabled')//dissabling it after its clicked
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled')//enabling it after message is sent
        $messageFormInput.value = ''//input tab of the message type in
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('SENT')
    })
})
//
$LOCATIONFormButton.addEventListener('click',()=>{//location button
    if(!navigator.geolocation){//locating the location of the user
        return alert('NOT WORKING')
    }
    $LOCATIONFormButton.setAttribute('disabled','disabled')//dissabling button
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('LOCATION',{//emiting the location to user
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $LOCATIONFormButton.removeAttribute('disabled')//enabling button
            console.log('LOCATION PROVIDED')
        })
    })
})
//
socket.emit('join',{username,room}, (error)=>{
    if (error) {
        alert(error)
        location.href ='/'
    }
})