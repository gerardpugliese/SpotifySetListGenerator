import React, {useState, useEffect} from 'react';
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
    
    useEffect(() => {
        //This assures that the setlist result div and the playlist songs div are the same height
        //as songs are added / removed.
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    useEffect(() => {
        matchSetlistsPlaylistsHeight()
      }, [songsForPlaylist])

    useEffect(() => {
        //Get parameters from URL
        //Call getSetLists
        getSetLists(id, name)
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }
        setToken(token)
    }, [])

    const goToHomePage = () => {
        //Clear out all state variables, this will return us to home page
        setSelectedArtist(null);
        setSongsForPlaylist([]);
        window.location.href = "/"
    }

    const getSetLists = (key, result) => {
        //This function calls musicbrainz to get recent set lists for the selected artist.
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

    const login = () => {
        //This function opens up a window that allows the user to log into their spotify account.
        window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=${process.env.REACT_APP_SCOPE}`
    }

    const containsObject = (obj, list) => {
        let i;
        for (i = 0; i < list.length; i++) {
            if (list[i].name === obj.name) {
                return true;
            }
        }
        return false;
    }

    const changePlaylistDelButton = (displayState, btnId) => {
        if (windowSize[0] > 665) {
            let button = document.getElementById(btnId)
            button.style.display = displayState
        } 
    }

    const removeSongFromPlaylist = (song) => {
        //Find song in songsForPlaylist, remove it and reset it.
        let filteredSongs = songsForPlaylist.filter(e => e !== song)
        setSongsForPlaylist(filteredSongs)
        //Update div heights
        matchSetlistsPlaylistsHeight()
    }

    const matchSetlistsPlaylistsHeight = () => {
        if (songsForPlaylist.length > 0) {
            let playlistWrapper = document.getElementById('playlist-songs-wrapper');
            let heightToMatch = playlistWrapper.offsetHeight;
            if (heightToMatch > 700) {
            let setListWrapper = document.getElementById('setlist-results')
            setListWrapper.style.height = heightToMatch.toString().concat("px")
            }
        }
    }

    const removeDuplicates = (currSongs, addSongs) => {
        //Loop through addSongs, if song is in currSongs return true
        let nonDupSongs = [...currSongs];
        if (addSongs.length === undefined) { //undefined length means it's just one song we're adding
          if (!containsObject(addSongs, nonDupSongs)) {
            nonDupSongs.push(addSongs)
          }
        }
        else if (addSongs.length > 1) {
          let i = 0;
    
          while (i < addSongs.length) {
            if (!containsObject(addSongs[i], nonDupSongs)) {
              nonDupSongs.push(addSongs[i])
            }
            else {
              //can keep track of dup songs to show user or something
            }
            i++;
          }
        }
        return [...nonDupSongs]
    }

    const addSongToPlaylist = (song) => {
        if (songsForPlaylist.length > 0) {
          setSongsForPlaylist(removeDuplicates(songsForPlaylist, song))
        } else {
          setSongsForPlaylist([song])
        }
    }
    
      const addSetToPlaylist = (setlist) => {
        if (songsForPlaylist.length > 0) {
          setSongsForPlaylist(removeDuplicates(songsForPlaylist, setlist))
        } else {
          setSongsForPlaylist(setlist)
        }
    }

    
    

    return(
        <div className="artist-results-wrapper">
        <Header propagateUserId={setUserId} goToHomePage={goToHomePage}/>
        <div className="setlist-result-wrapper">
            <div className="artist-setlists">
                <div className="setlist-header">
                <p id="confirmed-artist-header-name">{selectedArtist}</p>
                <p id="confirmed-artist-header"> recent set lists</p>
                </div>
                <div id="setlist-results" className="setlist-results">
                {setLists === undefined || setLists.length === 0 ? <React.Fragment>
                    <div className="setlist-empty-results-wrapper">
                        <p className="setlist-empty-results-txt">No set lists found!</p>
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
                        <p className="setlist-empty-results-txt">No set lists found!</p>
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