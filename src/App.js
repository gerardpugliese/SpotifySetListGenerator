import './App.css';
import React, {useState, useEffect} from 'react';
import Header from './components/Header';
import { FaSearch } from 'react-icons/fa';
import { BsPlusLg } from 'react-icons/bs'
import { XMLParser } from 'fast-xml-parser';
import music_icon from './images/musicicon.svg';
import headphone_icon from './images/headphoneicon.svg';
import phone_icon from './images/phoneicon.svg';
import Fade from 'react-reveal/Fade';

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [songsForPlaylist, setSongsForPlaylist] = useState([]);
  const [setSpotifyResultsForPlaylist] = useState([])
  const [setUserId] = useState(null)

  useEffect(() => {
    matchSetlistsPlaylistsHeight()
  }, [songsForPlaylist])

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

  const goToHomePage = () => {
    //Clear out all state variables, this will return us to home page
    setSearchResults([]);
    setQuery("");
    setSongsForPlaylist([]);
    setSongsForPlaylist([]);
    setSpotifyResultsForPlaylist([]);
  }

  const sanitizeSearchResults = (searchResult) => {
    let splice_index = searchResult.length
    for (let i = 0; i < searchResult.length; i++) {
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

  const goToArtistResults = (key, name) => {
    window.location.href = `/artist_results/${name}/${key}`
  }

  const submitQuery = (query) => {
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

  return (
    <div className="App">
      <Header propagateUserId={setUserId} goToHomePage={goToHomePage}/>
      <div className="home-outer-wrapper">
        <React.Fragment>
        <div className="home-wrapper">
          <p className="home-page-blurb">Look up an artist to see their recent set lists!</p>
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
                      goToArtistResults(result['@_']['@_id'], result.name)
                      } 
                    } key={idx} className="search-result">
                      <p className="search-result-name">{result.name}</p>
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
        </React.Fragment>
      </div>
    </div>
  );
}

export default App;
