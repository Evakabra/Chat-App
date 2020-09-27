const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () =>
{
  //New message element
  const $newMessage = $messages.lastElementChild

  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage) //this varibale contains all the style of newMessage
  const newMessageMargin = parseInt(newMessageStyles.marginBottom) //in this variable we are taking marginbottom i.e height of new message
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin //total height including margin

  //visible height (fixed place where msg is visible)
  const visibleHeight = $messages.offsetHeight

  //Height of the message container (container height is greater then visible height)
  //visible height is what we can see and container height is total height where all the msgs are present
  const containerHeight = $messages.scrollHeight // scrollHeight is total height we can scroll through

  //How far have i scroll
  const scrollOffset = $messages.scrollTop + visibleHeight
  //scrolltop gives us a number ,the amount of distance we've scrolled from top. distance between top of the content and top of scrollbar
  //scrollbars height , which is visible height of container

  //for moving down i.e autoscroll when new msg comes in
//   120-20 < = 20+100  
//   100 <= 120
//   20=100
//   100
  if(containerHeight - newMessageHeight <= scrollOffset)
  {
      $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData' , ({room,users}) =>{
    const html = Mustache.render(sidebarTemplate , {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disbaling button so that once the msg will be delievred then only it should be enable for sending next msg
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message Delievered!')
    })
})

$sendLocationButton.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

//username and room coming from quesry string
socket.emit('join' , {username, room}, (error) =>
{
    if(error)
    {
        alert(error)
        location.href = '/'
    }  
})