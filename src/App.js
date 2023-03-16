import './App.css';
import React, {useState, useEffect} from 'react';
import Header from './components/Header';
import SetlistView from './components/SetlistView';
import { FaSearch } from 'react-icons/fa';
import { BsPlusLg } from 'react-icons/bs'
import { XMLParser } from 'fast-xml-parser';
import music_icon from './images/musicicon.svg';
import headphone_icon from './images/headphoneicon.svg';
import phone_icon from './images/phoneicon.svg';
import PlaylistSong from './components/PlaylistSong';
import PlaylistForm from './components/PlaylistForm';
import Fade from 'react-reveal/Fade';

function PlaylistFinalization(props) {
  const [songs] = useState(props.songs)
  const [displaySongs, setDisplaySongs] = useState(false)
  const [token] = useState(props.token)
  const [playlistCreationState, setPlaylistCreationState] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      setDisplaySongs(true)
    }, 1000)
  }, [])

  useEffect(() => {

  }, [playlistCreationState])

  const changePlaylistFormState = (state) => {
    setPlaylistCreationState(state)
  }

  const goToHomePage = () => {
    setPlaylistCreationState(0)
    props.goToHomePage()
  }

  return (
    <React.Fragment>
    {
    (playlistCreationState === 0) ? // Playlist has not been sent to Spotify or finished
    <React.Fragment> 
        {
        displaySongs === true ?
        <div className="finalize-playlist-wrapper">
          <div className="finalize-playlist-left">
            <PlaylistForm changePlaylistFormState={changePlaylistFormState} token={token} songs={songs} userId={props.userId}/>
          </div>  
          <div className="finalize-playlist-right">
            {/*<p className="finalize-playlist-header-txt">Songs for your playlist</p>*/}
            <p style={{marginRight: "auto", marginLeft: "auto"}}className="playlist-form-name-title">Playlist Songs:</p>
            <div className="finalize-playlist-right-songs">
              {songs.map((song, idx) => {
                  if (song !== undefined) {
                    return (
                      <PlaylistSong key={idx} song={song} songNum={idx+1}/> 
                    )
                  }
                  else {
                    return <React.Fragment key={idx}/>
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
    <div className="finalize-playlist-loading">
      <p className="finalize-playlist-loading-text">Error occurred when creating playlist.</p>
    </div>
    </React.Fragment>
    } 
    </React.Fragment>
  );
}

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [hideQueryResults, setHideQueryResults] = useState(false);
  const [setLists, setSetLists] = useState([]);
  const [token, setToken] = useState("")
  const [songsForPlaylist, setSongsForPlaylist] = useState([]);
  const [spotifyResultsForPlaylist, setSpotifyResultsForPlaylist] = useState([])
  const [finalizePlaylist, setFinalizePlaylist] = useState(false);
  const [userId, setUserId] = useState(null)

  useEffect(() => {
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
    setHideQueryResults(false);
    setSelectedArtist(null);
    setSearchResults([]);
    setQuery("");
    setSongsForPlaylist([]);
    setSongsForPlaylist([]);
    setSpotifyResultsForPlaylist([]);
    setFinalizePlaylist(false);
  }

  const sanitizeSearchResults = (searchResult) => {
    let splice_index = searchResult.length
    for (let i = 0; i < searchResult.length; i++) {
      /*if (searchResult[i].name.toLowerCase().includes(query.toLowerCase()) == false) {
        splice_index = i;
        break;
      }*/
      if ((searchResult[i].name.toLowerCase() === "the name" && query !== "the name") ||
        (searchResult[i].name.toLowerCase() === "name" && query !== "name") || 
        (searchResult[i].name.toLowerCase() === "n.a.m.e" && query !== "n.a.m.e")
        ) {
        //cut the name
        splice_index = i
        break;
      }
    }
    //cut out "the name" and "name"
    searchResult = searchResult.splice(0, splice_index)
    
    //cut down again to keep results to 6
    return searchResult.splice(0, 6)
  }

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

  /*const handleQuery = () => {
    setTimeout(() => {
      submitQuery(query)
    }, 1000)
  }*/

  const submitQuery = (query) => {
    /*if (query.length <= 2) {
      return
    }*/

    if (query === "" || query === " " || query === "a") {
      setQuery("")
      setSearchResults([])
    }
    else {
      setQuery(query)
      
      if (query.length > 2) {
        fetch(`https://musicbrainz.org/ws/2/artist/?query=name:${query}&limit=10`, {
          method: "GET",
        })
        .then(resp => resp.text())
        .then((textResp) => {
        const options = {
          ignoreAttributes: false,
          attributeNamePrefix : "@_",
          attributesGroupName : "@_"
        };
        const parser = new XMLParser(options);
        let obj = parser.parse(textResp)
        //Sanitize results
        let results = sanitizeSearchResults(obj.metadata['artist-list'].artist, query)
        setSearchResults(results)
        })
      }
    } 
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

  const changePlaylistDelButton = (displayState, btnId) => {
    let button = document.getElementById(btnId)
    button.style.display = displayState
  }

  const removeSongFromPlaylist = (song) => {
    //Find song in songsForPlaylist, remove it and reset it.
    let filteredSongs = songsForPlaylist.filter(e => e !== song)
    setSongsForPlaylist(filteredSongs)
  }

  const addSongToPlaylist = (song) => {
    if (songsForPlaylist.length > 0) {
      setSongsForPlaylist(removeDuplicates(songsForPlaylist, song))
      ///setSongsForPlaylist(removeDuplicates([...songsForPlaylist, song]))
    } else {
      setSongsForPlaylist([song])
    }
  }

  const addSetToPlaylist = (setlist) => {
    if (songsForPlaylist.length > 0) {
      setSongsForPlaylist(removeDuplicates(songsForPlaylist, setlist))
      ///setSongsForPlaylist([...songsForPlaylist, ...setlist])
    } else {
      setSongsForPlaylist(setlist)
    }
    
    /*setlist[0] !== undefined && setlist[0].song.forEach((song, idx) => {
      setSongsForPlaylist({...songsForPlaylist, song})
    })*/
  }

  const filterSpotifyQueryResult = (resp, song_name, artist_name) => {
    let filteredSpotifyResults = resp.filter((el) => {
      return el.name.toLowerCase() === song_name && el.artists[0].name.toLowerCase() === artist_name
    })
    return filteredSpotifyResults[0]
  }

  const retreiveSongs = () => {
    let i = 0;
    while (i < songsForPlaylist.length) {
      let song_name = songsForPlaylist[i].name
      //track%3A${song_name.replace(/\s+/g, '%2520')}%2520artist%3A${selectedArtist.name.replace(/\s+/g, '%2520')}
      fetch(`https://api.spotify.com/v1/search?q=${song_name}&type=track`, {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
      })
      .then(resp => resp.json())
      .then(resp => {
        let songResult = filterSpotifyQueryResult(resp.tracks.items, song_name.toLowerCase(), selectedArtist.name.toLowerCase())
        let results = spotifyResultsForPlaylist
        results.push(songResult)
        setSpotifyResultsForPlaylist(results)
      })
      .catch(error => console.log(error))
      i++
    }
    setFinalizePlaylist(true)
  }

  const login = () => {
    window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=${process.env.REACT_APP_SCOPE}`
  }

  return (
    <div className="App">
      <Header propagateUserId={setUserId} goToHomePage={goToHomePage}/>
      {finalizePlaylist === false ? <div className="home-outer-wrapper">
        {hideQueryResults === false && <React.Fragment>
        <div className="home-wrapper">
          <p className="home-page-blurb">Search an artist for recent set lists!</p>
          <div className="search-input-wrapper">
            <input id="test-search-input" name="query" placeholder="I want to see set lists for..." autoComplete="off" value={query} onChange={e => {submitQuery(e.target.value)}}/>
            <div className="delete-search-icon-wrapper">
            {query !== "" ?
              <BsPlusLg onClick={() => {
                setQuery("")
                setSearchResults([])
              }} className="delete-search-icon"/>
              : 
              <React.Fragment />
              }
            </div>
            <div className="search-input-icon-wrapper">
              <FaSearch className="search-input-icon"/>
            </div>
          </div>
          {searchResults.length > 0 ? 
          <Fade duration={500}>
            <div className="search-results">
                {searchResults.map((result, idx) => {
                  return (
                    <div onClick={() => {
                      getSetLists(result['@_']['@_id'], result)
                      setHideQueryResults(true)
                      } 
                    } key={idx} className="search-result">
                      <p className="search-result-name">{result.name}</p>
                      {/*<p>{result['@_']['@_id']}</p>*/}
                    </div>
                  )
                })}
            </div>
          </Fade> : searchResults.length === 0 && query !== "" ?
          <Fade duration={500}>
            <div className="search-results">
              <p className="search-results-empty-txt">No artists found!</p>
            </div>
          </Fade> :
          <React.Fragment />}
          {/*<div onClick={() => submitQuery(query)} className="test-search-button">
            <p id="test-search-button-text">Search</p>
          </div>*/}
        </div>
        <div className="home-howitworks-wrapper">
          <div className="home-howitworks-header-wrapper">
            <p className="howitworks-header-txt">How Setlistify Works</p>
            <p className="howitworks-header-subtxt">
               Prepare for you next concert with a customzied playlist of songs your favorite artist has played recently!
            </p>
          </div>
          <div className="home-howitworks-content-wrapper">
            <Fade up duration={1000} distance={"20px"}>
              <div className="howitworks-content-tile-wrapper">
                <img alt="Phone Icon" className="howitworks-content-title-icon" src={phone_icon}/>
                <p className="howitworks-content-tile-title">Login with Spotify</p>
                <p className="howitworks-content-tile-subtext">Login with your Spotify credentials so you can save whatever you create. </p>
              </div>
            </Fade>
            <Fade up duration={1000} distance={"20px"}>
              <div className="howitworks-content-tile-wrapper">
                <img alt="Music Icon" className="howitworks-content-title-icon" src={music_icon}/>
                <p className="howitworks-content-tile-title">Build your Playlist</p>
                <p className="howitworks-content-tile-subtext">Search for an artist, view their recent set lists and add songs to a playlist.</p>
              </div>
            </Fade>
            <Fade up duration={1000} distance={"20px"}>
              <div className="howitworks-content-tile-wrapper">
                <img alt="Headphone Icon" className="howitworks-content-title-icon" src={headphone_icon}/>
                <p className="howitworks-content-tile-title">Start Listening</p>
                <p className="howitworks-content-tile-subtext">Open up your Spotify and start listening to your newly created playlist!</p>
              </div>
            </Fade>
          </div>
        </div>
        </React.Fragment>}
        
        {selectedArtist != null && 
          <div className="setlist-result-wrapper">
            <div className="artist-setlists">
              <div className="setlist-header">
                <p id="confirmed-artist-header-name">{selectedArtist.name}</p>
                <p id="confirmed-artist-header"> recent set lists</p>
              </div>
              <div className="setlist-results">
                {setLists.length === 0 ? <React.Fragment>
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
                    return <React.Fragment />
                  }
                })}
              </div>
            </div>
            <div className="playlist-creator-wrapper">
              <p className="playlist-creator-title">Your playlist</p>
              <div className="playlist-songs-wrapper">
                {songsForPlaylist.length > 0 ?
                  <div>
                    {songsForPlaylist.map((song, idx) => {
                      return(
                        <Fade duration={1000}>
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
                songsForPlaylist.length > 0 &&  <div className="confirm-playlist-btn-wrapper">
                  <div onClick={() => retreiveSongs()} className="confirm-playlist-btn">
                    <p className="confirm-playlist-btn-txt">Confirm</p>
                  </div>
                </div>
                }
            </div>
          </div>
          }
      </div> : <PlaylistFinalization token={token} goToHomePage={goToHomePage} userId={userId} songs={spotifyResultsForPlaylist}/>}
    </div>
  );
}

export default App;
