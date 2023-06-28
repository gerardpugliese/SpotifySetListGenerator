import React, {useState, useEffect} from 'react';
import '../css/ArtistResults.css';
import { BsPlusLg } from 'react-icons/bs'
import SetlistView from './SetlistView';
import Fade from 'react-reveal/Fade';
import Header from './Header';
import { Link, useParams } from 'react-router-dom';

function ArtistResults(props) {
    const { id } = useParams();
    const { name } = useParams();
    const [songsForPlaylist, setSongsForPlaylist] = useState([]);
    const [token, setToken] = useState("");
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [setLists, setSetLists] = useState([]);
    const [setUserId] = useState(null);
    const [windowSize, setWindowSize] = useState([
        window.innerWidth,
        window.innerHeight,
      ]);
    
    /**
     * Stores the height and width of the window into state variables whenever
     * the window is resized.
     */
    useEffect(() => {
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    /**
     * Sets the height of the setlist results matches the height of the playist container as
     * songs are added / removed.
     */
    useEffect(() => {
        matchSetlistsPlaylistsHeight()
      }, [songsForPlaylist])


    useEffect(() => {
        getSetLists(id, name) // Retrieves setlist data
        
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }
        setToken(token)

        let artistName = window.sessionStorage.getItem("artistName")
        if (artistName === name || artistName !== null) {
            let sessionPlaylistSongs = window.sessionStorage.getItem("songsForPlaylist")
            if (sessionPlaylistSongs !== null) {
                let parsedSessionSongs = JSON.parse(sessionPlaylistSongs)
                setSongsForPlaylist(parsedSessionSongs)
            }
        } else {
            window.sessionStorage.clear()
        }
    }, [])

    /**
     * Clears out all state variables and returns to home page.
     */
    const goToHomePage = () => {
        setSelectedArtist(null);
        setSongsForPlaylist([]);
        window.location.href = "/"
    }

    /**
     * Retrieves setlist data using MusicBrainz API for the selected artist.
     */
    const getSetLists = (key, result) => {
        fetch(`/rest/1.0/artist/${key}/setlists/`, {
            method: "GET",
            headers: {
                'x-api-key': `${process.env.REACT_APP_MUSICBRAINZ_KEY}`,
                'Accept': 'application/json	',
            }
        })
        .then(resp => resp.json())
        .then(resp => {
            setSetLists(resp.setlist)
            setSelectedArtist(result) 
        })
        .catch(error => console.log(error))
    }

    /**
     * Logs user into their Spotify account.
     */
    const login = () => {
        // Store selected artist, their musicbrainz ID, and any selected songs locally
        window.localStorage.setItem("artistName", name)
        window.localStorage.setItem("artistKey", id)
        window.sessionStorage.setItem("artistName", name)
        window.sessionStorage.setItem("songsForPlaylist", JSON.stringify(songsForPlaylist))
        window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=${process.env.REACT_APP_SCOPE}`
    }

    /**
     * Checks if a list contains an object.
     */
    const containsObject = (obj, list) => {
        let i;
        for (i = 0; i < list.length; i++) {
            if (list[i].name === obj.name) {
                return true;
            }
        }
        return false;
    }

    /**
     * Hides or shows delete button for songs on playlist.
     */
    const changePlaylistDelButton = (displayState, btnId) => {
        if (windowSize[0] > 665) { // Behavior is only necessary on larger screen sizes.
            let button = document.getElementById(btnId)
            button.style.display = displayState
        } 
    }
    
    /**
     * Removes a song from the playist.
     */
    const removeSongFromPlaylist = (song) => {
        //This function removes a given song from a playlist
        let filteredSongs = songsForPlaylist.filter(e => e !== song)
        setSongsForPlaylist(filteredSongs)
        matchSetlistsPlaylistsHeight() //Update setlist container height
    }

    /**
     * Retrieves the height of the playlist container and sets the setlist container to the same height. 
     */
    const matchSetlistsPlaylistsHeight = () => {
        if (songsForPlaylist.length > 0 && windowSize[0] > 665) {
            let playlistWrapper = document.getElementById('playlist-songs-wrapper');
            let heightToMatch = playlistWrapper.offsetHeight;
            if (heightToMatch > 700) {
                let setListWrapper = document.getElementById('setlist-results')
                setListWrapper.style.height = heightToMatch.toString().concat("px")
            }
        }
    }

    /**
     * Prevents duplicate songs in the playlist.
     */
    const removeDuplicates = (currSongs, addSongs) => {
        let nonDupSongs = [...currSongs];
        if (addSongs.length === undefined) { // Undefined length means it's just one song we're adding.
          if (!containsObject(addSongs, nonDupSongs)) {
            nonDupSongs.push(addSongs)
          }
        }
        else if (addSongs.length > 1) {
          let i = 0;
    
          while (i < addSongs.length) {
            if (!containsObject(addSongs[i], nonDupSongs)) { //Songs isn't in playlist so we can add it.
              nonDupSongs.push(addSongs[i])
            }
            i++;
          }
        }
        return [...nonDupSongs]
    }

    /**
     * Adds a single song to the playlist.
     */
    const addSongToPlaylist = (song) => {
        if (songsForPlaylist.length > 0) {
            setSongsForPlaylist(removeDuplicates(songsForPlaylist, song))
            let artistName = window.sessionStorage.getItem("artistName")
            if (artistName === null) {
                window.sessionStorage.setItem("artistName", name)
            }
            window.sessionStorage.setItem("songsForPlaylist", JSON.stringify(removeDuplicates(songsForPlaylist, song)))
        } else {
            let artistName = window.sessionStorage.getItem("artistName")
            if (artistName === null) {
                window.sessionStorage.setItem("artistName", name)
            }
            setSongsForPlaylist([song])
            window.sessionStorage.setItem("songsForPlaylist", JSON.stringify(song))
        }
    }
    
    /**
     * Adds a whole setlist to the playlist.
     */
    const addSetToPlaylist = (setlist) => {
        if (songsForPlaylist.length > 0) {
            setSongsForPlaylist(removeDuplicates(songsForPlaylist, setlist))
            let artistName = window.sessionStorage.getItem("artistName")
            if (artistName === null) {
                window.sessionStorage.setItem("artistName", name)
            }
            window.sessionStorage.setItem("songsForPlaylist", JSON.stringify(removeDuplicates(songsForPlaylist, setlist)))
        } else {
            setSongsForPlaylist(setlist)
            let artistName = window.sessionStorage.getItem("artistName")
            if (artistName === null) {
                window.sessionStorage.setItem("artistName", name)
            }
            window.sessionStorage.setItem("songsForPlaylist", JSON.stringify(setlist))
        }
        
    }

    return(
        <div className="artist-results-wrapper">
        <Header propagateUserId={setUserId} artistName={name} artistKey={id} songsForPlaylist={songsForPlaylist} goToHomePage={goToHomePage}/>
        <div className="setlist-result-wrapper">
            <div className="artist-setlists">
                <div className="setlist-header">
                    <p id="confirmed-artist-header-name">{selectedArtist}</p>
                    <p id="confirmed-artist-header"> recent setlists</p>
                </div>
                <div id="setlist-results" className="setlist-results">
                {setLists === undefined || setLists.length === 0 ? <React.Fragment>
                    <div className="setlist-empty-results-wrapper">
                        <p className="setlist-empty-results-txt">No setlists found!</p>
                    </div>
                </React.Fragment> 
                :
                setLists.map((setlist, idx) => {
                    if (setlist.sets.set.length !== 0) {
                    return (
                        <div key={idx}>
                            <SetlistView idx={idx} setlist={setlist} addSongToPlaylist={addSongToPlaylist} addSetToPlaylist={addSetToPlaylist}/>
                        </div>
                    )
                    } else if (setLists.length === 1 && setlist.sets.set.length === 0) {
                    return (
                        <div key={idx} className="setlist-empty-results-wrapper">
                            <p className="setlist-empty-results-txt">No setlists found!</p>
                        </div>
                    )
                    } else {
                    return <React.Fragment key={idx} />
                    }
                })}
                </div>
            </div>
            <div id="playlist-creator-wrapper" className="playlist-creator-wrapper">
                <p className="playlist-creator-title">Your playlist</p>
                <div id="playlist-songs-wrapper" className="playlist-songs-wrapper">
                {songsForPlaylist.length > 0 ?
                    <div>
                        {songsForPlaylist.map((song, idx) => {
                            return(
                            <div key={idx}>
                                <Fade duration={500}>
                                <div onMouseEnter={() => changePlaylistDelButton("flex", "playlist-song-delete-btn".concat(song.name.replace(/\s+/g, '-').toLowerCase()))} onMouseLeave={() => changePlaylistDelButton("none", "playlist-song-delete-btn".concat(song.name.replace(/\s+/g, '-').toLowerCase()))} className="playlist-song-wrapper" key={idx}>
                                    <p className="playlist-song-number">{idx+1}.</p>
                                    <p className="playlist-song-name">{song.name}</p>
                                    <div className="playlist-song-delete-btn" id={"playlist-song-delete-btn".concat(song.name.replace(/\s+/g, '-').toLowerCase())}>
                                    <BsPlusLg onClick={() => {
                                        removeSongFromPlaylist(song)
                                    }} className="playlist-song-delete-icon"/>
                                    </div>
                                </div>
                                </Fade>
                            </div>
                            )
                        })}
                    </div> :
                    <div className="empty-setlist-playlist-wrapper">
                        <p className="empty-setlist-playlist-text">No songs added.</p>
                    </div>
                }
                </div>
                {token == null ? 
                songsForPlaylist.length > 0 && <div className="confirm-playlist-login">
                    <p onClick={() => login()} className="confirm-playlist-login-link">Log in with Spotify </p>
                    <p className="confirm-playlist-login-text">to continue.</p>
                </div>
                    :
                songsForPlaylist.length > 0 && <div className="confirm-playlist-btn-wrapper">
                    <Link to="/finalize_playlist" className="confirm-playlist-btn" state={{songsForPlaylist: songsForPlaylist, selectedArtist: selectedArtist}}>
                        <p className="confirm-playlist-btn-txt">Confirm</p>
                    </Link>
                </div> 
                }
            </div>
            </div>
        </div>
    )
}

export default ArtistResults;