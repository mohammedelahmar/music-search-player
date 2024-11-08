let progress = document.getElementById('progress');
let song = document.getElementById('song');
let ctrIcon = document.getElementById('ctrIcon');
const volume = document.getElementById('volume');

const clientId = 'f211dc9d52fc4c52a714668cb18eb0a3';
const clientSecret = '17897dcd786e41b4bf4644cc4fa9a975';
let accessToken = '';






async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    accessToken = data.access_token;
}

// async function searchMusic(event) {
//     event.preventDefault(); // Prevent the form from submitting
//     const query = document.getElementById('search-input').value;
    
//     if (query) {
//         const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         });

//         const searchData = await searchResponse.json();
//         const changeimg = document.getElementById('imgchange');
//         if (searchData.tracks.items.length > 0) {
//             const track = searchData.tracks.items[0];
//             playTrack(track);
//             getLyrics(track.artists[0].name, track.name); // Fetch lyrics for the track
//             ctrIcon.classList.remove("fa-play");
//             ctrIcon.classList.add("fa-pause");
//             changeimg.src = track.album.images[0].url;
//             saveData();

//         }
//     }
// }

function playTrack(track) {
    if (track.preview_url) {
        song.src = track.preview_url;
        song.play();
        document.getElementById('Music-name').textContent = track.name;
        document.getElementById('Artist-name').textContent = track.artist;

        // Fetch lyrics when the track starts playing
        getLyrics(track.artist, track.name);
    } else {
        console.log('No preview available for this track.');
        
    }
}


function getLyrics(artist, title) {
    const url = `https://api.lyrics.ovh/v1/${artist}/${title}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById("lyrics").textContent = data.lyrics || 'Lyrics not found.';
            saveData();
        })
        .catch(error => {
            console.error('Error fetching lyrics:', error);
            document.getElementById("lyrics").textContent = 'Lyrics not found.';
        });
   
}

song.onloadedmetadata = function() {
  progress.max = song.duration;
  progress.value=song.currentTime;


}
function playPause(){
  if(ctrIcon.classList.contains("fa-pause")){
    song.pause();
    ctrIcon.classList.remove("fa-pause");
    ctrIcon.classList.add("fa-play");
    saveData();
  }else{
    song.play();
     ctrIcon.classList.remove("fa-play");
     ctrIcon.classList.add("fa-pause");
     saveData();
    
  }
}
if (song.play()){
     setInterval(() => {
          progress.value = song.currentTime;
          saveData();

     } ,500);
}
progress.onchange = function(){
     song.play();
     song.currentTime = progress.value;
     ctrIcon.classList.remove("fa-play");
     ctrIcon.classList.add("fa-pause");
     saveData();
}
function back(){
     if(song.currentTime>0){
     song.currentTime-=10;
     saveData();
     }    
}
function forward(){
     if(song.currentTime<song.duration){
     song.currentTime+=10;
     saveData();
     }
}
function saveData() {
    const lyrics = document.getElementById('lyrics').textContent;
    console.log("Saving lyrics:", lyrics); 

    localStorage.setItem('progress', song.currentTime);
    localStorage.setItem('volume', volume.value);

    const track = {
        name: document.getElementById('Music-name').textContent,
        artist: document.getElementById('Artist-name').textContent,
        image: document.getElementById('imgchange').src,
        currentTime: document.getElementById('song').currentTime,
        preview_url: song.src,
        lyrics: lyrics 
    };

    localStorage.setItem('currentTrack', JSON.stringify(track));
}

function loadData() {
    const savedTrack = getLocalStorageItem('currentTrack');
    const savedVolume = getLocalStorageItem('volume');
    const savedProgress = getLocalStorageItem('progress');

    if (savedTrack) {
        const track = JSON.parse(savedTrack);
        updateTrackInfo(track);
        playTrack(track);
    }

    if (savedVolume !== null) {
        setVolume(parseFloat(savedVolume));
    }

    if (savedProgress !== null) {
        setCurrentTime(parseFloat(savedProgress));
    }
}

function getLocalStorageItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Error accessing localStorage for key "${key}":`, error);
        return null;
    }
}

function updateTrackInfo({ name, artist, image }) {
    document.getElementById('Music-name').textContent = name;
    document.getElementById('Artist-name').textContent = artist;
    document.getElementById('imgchange').src = image;
}

function setVolume(value) {
    volume.value = value;
    song.volume = value;
}

function setCurrentTime(value) {
    song.currentTime = value;
}

// Separate function to play the song on button click
function startPlaying() {
    song.play().then(() => {
        ctrIcon.classList.remove("fa-play");
        ctrIcon.classList.add("fa-pause");
    }).catch(error => {
        console.error("Error playing song:", error);
    });
}

// Load data when the page is loaded
getAccessToken().then(loadData);




volume.addEventListener('change', function(){
     song.volume=volume.value;
     saveData();
})
function repeat(){
     song.currentTime=0;
     song.play();
     ctrIcon.classList.remove("fa-play");
     ctrIcon.classList.add("fa-pause");
     saveData();
}
function shuffle(){
     
     let randomTime = Math.random() * song.duration;
     song.currentTime = randomTime;
     song.play();
     ctrIcon.classList.remove("fa-play");
     ctrIcon.classList.add("fa-pause");
}
function formatTime(seconds){
     const minutes = Math.floor(seconds/60);
     const secs = Math.floor(seconds%60);
     return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
song.addEventListener('timeupdate', function() {
     document.getElementById('currentTime').textContent = formatTime(song.currentTime);
     document.getElementById('duration').textContent = formatTime(song.duration);
});


function end(){
    if(song.currentTime == song.endTime){
        song.pause();
        ctrIcon.classList.remove("fa-pause");
        ctrIcon.classList.add("fa-play");
}
}







getLyrics();



getAccessToken().then(loadData);
