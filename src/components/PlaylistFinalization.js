import React, {useEffect, useState} from 'react';
import PlaylistForm from './PlaylistForm';
import PlaylistSong from './PlaylistSong';
import Header from './Header';
import { useLocation } from 'react-router-dom';

function PlaylistFinalization(props) {
    const [token, setToken] = useState("")
    const [userId, setUserId] = useState(null)
    const [displaySongs, setDisplaySongs] = useState(false)
    const [playlistCreationState, setPlaylistCreationState] = useState(0)
    const location = useLocation()
    const [spotifyResultsForPlaylist, setSpotifyResultsForPlaylist] = useState([])
    const { songsForPlaylist } = location.state 
    const { selectedArtist} = location.state

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }
        setToken(token)
        retreiveSongs(token)
        setTimeout(() => {
            setDisplaySongs(true)
        }, 1000)
    }, [location.state])

    useEffect(() => {
    }, [playlistCreationState])

    const filterSpotifySongName = (query_name, song_name) => {
        if (song_name.toLowerCase() === query_name.toLowerCase()) {
          return true // These are a perfect match
        }
        else if (query_name.toLowerCase().includes(song_name.toLowerCase()) && query_name.slice(-8).toLowerCase() === "remaster") {
          return true // These are a match but the string contains '- <year> remaster'
        }
        else {
          return false
        }
    }
    
    const filterSpotifyQueryResult = (resp, song_name, artist_name) => {
        let filteredSpotifyResults = resp.filter((el) => {
        return filterSpotifySongName(el.name, song_name) && el.artists[0].name.toLowerCase() === artist_name
        })
        return filteredSpotifyResults[0]
    }

    const retreiveSongs = (token) => {
        let i = 0;
        let artist_name = selectedArtist.toLowerCase()
        artist_name.replace(/\s/g, '%20')
        while (i < songsForPlaylist.length) {
          let song_name = songsForPlaylist[i].name
          fetch(`https://api.spotify.com/v1/search?q=${song_name}%20${artist_name}&type=track`, {
              method: "GET",
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
          })
          .then(resp => resp.json())
          .then(resp => {
            if ("error" in resp) {
                window.location.href = "/";
            } else {
                let songResult = filterSpotifyQueryResult(resp.tracks.items, song_name.toLowerCase(), selectedArtist.toLowerCase())
                let results = spotifyResultsForPlaylist
                if (songResult === undefined) {
                    results.push(song_name)
                } else {
                    results.push(songResult)
                }
                setSpotifyResultsForPlaylist(results)
            }
          })
          .catch(error => console.log(error))
          i++
        }
    }

    const changePlaylistFormState = (state) => {
        setPlaylistCreationState(state)
    }

    const goToHomePage = () => {
        window.location.href = "/"
    }

    

    return (
        <React.Fragment>
        <Header propagateUserId={setUserId}/>
        {
        (playlistCreationState === 0) ? // Playlist has not been sent to Spotify or finished
        <React.Fragment> 
            {
            displaySongs === true ?
            <div className="finalize-playlist-wrapper">
            <div className="finalize-playlist-left">
                <PlaylistForm changePlaylistFormState={changePlaylistFormState} token={token} songs={spotifyResultsForPlaylist} userId={userId}/>
            </div>  
            <div className="finalize-playlist-right">
                <p style={{marginRight: "auto", marginLeft: "auto"}}className="playlist-songs-name-title">Playlist Songs:</p>
                <div className="finalize-playlist-right-songs">
                {spotifyResultsForPlaylist.map((song, idx, arr) => {
                    if (typeof song !== "string") {
                        return (
                        <div key={idx}>
                            <PlaylistSong idx={idx} song={song} songNum={idx+1}/> 
                        </div>
                        )
                    }
                    else {
                        return  <div className="spotify-song-not-found-wrapper"key={idx}>
                        <div className="playlist-song-outerwrapper">
                            <div className="playlist-song-num-wrapper">
                                <p className="playlist-song-num">{idx+1}.</p>
                            </div>
                            <div className="confirm-playlist-song-wrapper">
                                <p className="confirm-playlist-song-name">{song} - not found on Spotify!</p>
                            </div>
                        </div>
                        </div>
                    }
                    })}
                </div>
            </div>
            </div>
            :
            <div className="finalize-playlist-loading">
            <p className="finalize-playlist-loading-text">Loading Playlist...</p>
            </div>
            }
        </React.Fragment>
        : playlistCreationState === 1 ? // Playlist being sent to Spotify
        <React.Fragment>
        <div className="finalize-playlist-loading">
        <p className="finalize-playlist-loading-text">Creating Spoitfy Playlist...</p>
        </div>
        </React.Fragment> 
        : playlistCreationState === 2 ? // Playlist has been created successfully
        <React.Fragment>
        <div style={{display: "flex", flexDirection: "column"}} className="finalize-playlist-loading">
        <p style={{marginBottom: "2vw"}} className="finalize-playlist-loading-text">Playlist successfully created!</p>
        <p style={{marginTop: "2vw"}} onClick={() => goToHomePage()} className="finalize-playlist-complete-link">Return to Home page</p>
        </div>
        </React.Fragment> 
        : // An error occurred when creating the playlist
        <React.Fragment>
        <div style={{display: "flex", flexDirection: "column"}} className="finalize-playlist-loading">
        <p style={{marginBottom: "2vw"}} className="finalize-playlist-loading-text">Error occurred when creating playlist.</p>
        <p style={{marginTop: "2vw"}} onClick={() => setPlaylistCreationState(0)} className="finalize-playlist-complete-link">Try again</p>
        </div>
        </React.Fragment>
        } 
        </React.Fragment>
    );
}

export default PlaylistFinalization;