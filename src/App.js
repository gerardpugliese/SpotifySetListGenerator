import './App.css';
import React, {useState, useEffect} from 'react';
import SetlistView from './components/SetlistView';
import { FaSearch } from 'react-icons/fa';
import { FiDelete } from 'react-icons/fi';
import { BsPlusLg } from 'react-icons/bs'
import { XMLParser } from 'fast-xml-parser';
import spotify_logo from './images/Spotify_Logo_RGB_Green.png';


function App() {
  const [query, setQuery] = useState("");
  const [showDelQuery, setShowDelQuery] = useState(false)
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [hideQueryResults, setHideQueryResults] = useState(false);
  const [setLists, setSetLists] = useState([]);
  const [token, setToken] = useState("")
  const [songsForPlaylist, setSongsForPlaylist] = useState([]);


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

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  } 

  const goToHomePage = () => {
    setHideQueryResults(false);
    setSelectedArtist(null)
    setSearchResults([])
    setSongsForPlaylist([])
  }

  const sanitizeSearchResults = (searchResult) => {
    let splice_index = searchResult.length
    for (let i = 0; i < searchResult.length; i++) {
      /*if (searchResult[i].name.toLowerCase().includes(query.toLowerCase()) == false) {
        splice_index = i;
        break;
      }*/
      if ((searchResult[i].name.toLowerCase() === "the name" && query !== "the name") ||
        (searchResult[i].name.toLowerCase() === "name" && query !== "name")
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

  const submitQuery = (query) => {
    let search_bar = document.getElementById("test-search-input")
    if (query === "" || query === " " || query === "a") {
      setQuery("")
      setSearchResults([])
    }
    else {
      setQuery(query)
      
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

  const addSongToPlaylist = (song) => {
    if (songsForPlaylist.length > 0) {
      setSongsForPlaylist([...songsForPlaylist, song])
    } else {
      setSongsForPlaylist([song])
    }
  }

  const addSetToPlaylist = (setlist) => {
    if (songsForPlaylist.length > 0) {
      setSongsForPlaylist(...songsForPlaylist, setlist[0].song)
    } else {
      setSongsForPlaylist(setlist[0].song)
    }
    
    /*setlist[0] !== undefined && setlist[0].song.forEach((song, idx) => {
      setSongsForPlaylist({...songsForPlaylist, song})
    })*/
  }

  return (
    <div className="App">
      <div className="home-header">
        <div onClick={() => goToHomePage()} className="home-header-logo-wrapper">
          <p className="home-header-logo-txt">SetListify</p>
        </div>
          {token === "" ? 
          <div onClick={() => window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}`} className="log-in-btn-wrapper">
          <img alt="Spotify Logo" className="log-in-btn-img" src={spotify_logo}/>
          <p className="log-in-btn-text">LOGIN WITH SPOTIFY</p>
        </div> : <div onClick={() => logout()} className="log-in-btn-wrapper">
              <img alt="Spotify Logo" className="log-in-btn-img" src={spotify_logo}/>
              <p className="log-in-btn-text">LOG OUT</p>
            </div>}
        
      </div>
      <div className="home-outer-wrapper">
        {hideQueryResults === false && <div className="home-wrapper">
          <p className="home-page-blurb">Search an artist for recent set lists!</p>
          <div className="search-input-wrapper">
            <input id="test-search-input" name="query" placeholder="I want to see set lists for..." autoComplete="off" value={query} onChange={e => submitQuery(e.target.value)}/>
            <div className="delete-search-icon-wrapper">
            {query !== "" ?
              <BsPlusLg onClick={() => {setQuery("")}} className="delete-search-icon"/>
              : 
              <React.Fragment />
              }
            </div>
            <div className="search-input-icon-wrapper">
              <FaSearch className="search-input-icon"/>
            </div>
          </div>
          {searchResults.length > 0 && <div className="search-results">
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
          </div>}
          {/*<div onClick={() => submitQuery(query)} className="test-search-button">
            <p id="test-search-button-text">Search</p>
          </div>*/}
        </div>}
        
        {selectedArtist != null && 
          <div className="setlist-result-wrapper">
            <div className="artist-setlists">
              <div className="setlist-header">
                <p id="confirmed-artist-header-name">{selectedArtist.name}</p>
                <p id="confirmed-artist-header"> recent set lists</p>
              </div>
              <div className="setlist-results">
                {setLists.map((setlist, idx) => {
                  return (
                    <SetlistView setlist={setlist} addSongToPlaylist={addSongToPlaylist} addSetToPlaylist={addSetToPlaylist}/>
                  )
                })}
              </div>
            </div>
            <div className="playlist-creator-wrapper">
              <p className="playlist-creator-title">Create your playlist</p>
              <div className="playlist-songs-wrapper">
                {songsForPlaylist.length > 0 && 
                  <div>
                    {songsForPlaylist.map((song, idx) => {
                      return(
                        <div className="playlist-song-wrapper">
                          <p className="playlist-song-number">{idx+1}.</p>
                          <p className="playlist-song-name">{song.name}</p>
                        </div>
                      )
                    })}
                  </div>
                }
              </div>
            </div>
          </div>
          }
      </div>
    </div>
  );
}

export default App;
