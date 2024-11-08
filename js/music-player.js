const clientId = 'f211dc9d52fc4c52a714668cb18eb0a3';
const clientSecret = '17897dcd786e41b4bf4644cc4fa9a975';
let accessToken = '';

// Get Spotify Access Token
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

// Fetch Featured Playlists from Spotify
async function getFeaturedPlaylists() {
    await getAccessToken(); // Ensure accessToken is available

    const response = await fetch('https://api.spotify.com/v1/browse/featured-playlists', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    const playlists = data.playlists.items;
    displayPlaylists(playlists);
}

// Function to Display Playlists in the Carousel
function displayPlaylists(playlists) {
    const carouselInner = document.getElementById('playlists-container');
    carouselInner.innerHTML = ''; // Clear existing items

    let playlistGroup = [];
    playlists.forEach((playlist, index) => {
        if (index % 3 === 0) {
            playlistGroup.push([]);
        }
        playlistGroup[playlistGroup.length - 1].push(playlist);
    });

    playlistGroup.forEach((group, groupIndex) => {
        const isActive = groupIndex === 0 ? 'active' : '';

        let playlistRow = '<div class="row">';
        group.forEach(playlist => {
            playlistRow += `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${playlist.images[0].url}" class="card-img-top" alt="${playlist.name}">
                        <div class="card-body">
                            <h5 class="card-title">${playlist.name}</h5>
                            <p class="card-text">${playlist.description || 'No description available.'}</p>
                        </div>
                    </div>
                </div>`;
        });
        playlistRow += '</div>';

        const playlistItem = `
            <div class="carousel-item ${isActive}">
                ${playlistRow}
            </div>`;
        carouselInner.innerHTML += playlistItem;
    });
}

// Fetch New Releases from Spotify
async function getNewReleases() {
    await getAccessToken();

    const response = await fetch('https://api.spotify.com/v1/browse/new-releases', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    const albums = data.albums.items;
    displayAlbums(albums);
}

// Function to Display Albums in the Grid
function displayAlbums(albums) {
    const albumsContainer = document.getElementById('albums-container');
    albumsContainer.innerHTML = ''; // Clear existing items

    let albumGroup = [];
    albums.forEach((album, index) => {
        if (index % 3 === 0) {
            albumGroup.push([]);
        }
        albumGroup[albumGroup.length - 1].push(album);
    });

    albumGroup.forEach(group => {
        let albumRow = '<div class="row">';
        group.forEach(album => {
            albumRow += `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${album.images[0].url}" class="card-img-top" alt="${album.name}">
                        <div class="card-body">
                            <h5 class="card-title">${album.name}</h5>
                            <p class="card-text">${album.artists[0].name}</p>
                            <p class="card-text"><small class="text-muted">${album.release_date}</small></p>
                        </div>
                    </div>
                </div>`;
        });
        albumRow += '</div>';
        albumsContainer.innerHTML += albumRow;
    });
}



async function getTopCharts() {
     await getAccessToken();
 
     const response = await fetch('https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M/tracks', {
         method: 'GET',
         headers: {
             'Authorization': `Bearer ${accessToken}`
         }
     });
 
     if (!response.ok) {
         console.error('Failed to fetch top charts:', response.statusText);
         return;
     }
 
     const data = await response.json();
     console.log(data);  // Check if the data is correct
     const topCharts = data.items;
     displayTopCharts(topCharts);
 }
 
 function displayTopCharts(topCharts) {
     const topChartList = document.getElementById('topChartsList');
     topChartList.innerHTML = ''; // Clear the current list
 
     if (topCharts.length === 0) {
         topChartList.innerHTML = '<li class="list-group-item">No top charts available</li>';
         return;
     }
 
     // Limit to the top 5 items
     const topFiveCharts = topCharts.slice(0, 5);
 
     topFiveCharts.forEach(chart => {
         const trackName = chart.track.name;
         const artistName = chart.track.artists[0].name;
 
         const listItem = document.createElement('li');
         listItem.classList.add('list-group-item');
         listItem.textContent = `${trackName} - ${artistName}`;
         topChartList.appendChild(listItem);
     });
 }


 async function searchMusic() {
    const query = document.getElementById('search-input').value;
    
    if (query) {
        const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const searchData = await searchResponse.json();
        if (searchData.tracks.items.length > 0) {
            document.getElementById('search-section').style.display='block';
            displaySearchResults(searchData.tracks.items);
        }
        else{
            document.getElementById('search-section').style.display='none';
        }
    }
}

function displaySearchResults(tracks) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous search results

    if (tracks.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
        return;
    }

    tracks.forEach(track => {
        const { name, artists, album, preview_url } = track;
        const trackItem = `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <img src="${album.images[0].url}" class="card-img-top" alt="${name}">
                    <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text">${artists.map(artist => artist.name).join(', ')}</p>
                        <button class="btn btn-primary play-btn" data-preview-url="${preview_url}" data-track-name="${name}" data-artist-name="${artists[0].name}" data-album-image-url="${album.images[0].url}">Play this song</button>
                    </div>
                </div>
            </div>`;
        resultsContainer.innerHTML += trackItem;
    });

    // Attach event listeners after adding the HTML
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(button => {
        button.addEventListener('click', handlePlaySong);
    });
}

function handlePlaySong(event) {
    const { previewUrl, trackName, artistName, albumImageUrl } = event.currentTarget.dataset;
    const track = {
        preview_url: previewUrl,
        name: trackName,
        artist: artistName,
        image: albumImageUrl
    };
    localStorage.setItem('currentTrack', JSON.stringify(track)); // Save track data
    window.location.href = '../html/music-player.html'; // Redirect to app2.html
}


 window.onload = function() {
     getNewReleases();
     getFeaturedPlaylists();
     getTopCharts();
    
 };
 