const APP_ID = 'paste your app id'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))
let USERNAME = sessionStorage.getItem('username')

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
let localTracks = []
let remoteUsers = {}

let joinDisplayLocalStream = async () => {

    // Show the room name
    document.getElementById('room-name').innerText = CHANNEL



    // When the user published their trackc, we are going to call method handleUserJoined
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    // Check if we have token, room, session
    try {
        // join the channel
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error(error)
        window.open('/', '_self')
    }

    // get audio and video tracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    // get username 
    let user = await createUser()
    console.log('user:', user)

    // create a player
    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper">
                        <span class="user-name">${user.username}</span>
                    </div>
                    <div class="video-player" id="user-${UID}"></div>
                </div>`

    // append player  
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    // Create a video tag and start playing video inside tag
    localTracks[1].play(`user-${UID}`)

    // publish an audio ([localTracks[0]]) and video track ([localTracks[1]])
    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.UID] = user
    await client.subscribe(user, mediaType)
    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        // get the video
        if (player != null) {
            player.remove()
        }
        let anotherUser = await getAnotherUser(user)

        // append video to the DOM and play it
        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="username-wrapper">
                            <span class="user-name">${anotherUser.username}</span>
                        </div>
                        <div class="video-player" id="user-${user.uid}"></div>
                    </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }
    // play audio
    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}


let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    // remove user from the DOM
    document.getElementById(`user-container-${user.uid}`).remove()
}


let leaveStream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        // Use close() after stop(), because the track will start again
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
    window.open('/', '_self')
}

let offMicrophone = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#ffffff'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 51, 63)'
    }
}

let offCamera = async (e) => {
    // In localTracks videoTrack = 1
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#ffffff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 51, 63)'
    }
}

let createUser = async () => {
    let response = await fetch('/new-user/', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            'username': USERNAME,
            'room_name': CHANNEL,
            'UID': UID
        })
    })
    let user = await response.json()
    return user
}

let getAnotherUser = async (user) => {
    let response = await fetch(`/get-another-user/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}


joinDisplayLocalStream()
document.getElementById('leave-button').addEventListener('click', leaveStream)
document.getElementById('microphone-button').addEventListener('click', offMicrophone)
document.getElementById('video-button').addEventListener('click', offCamera)