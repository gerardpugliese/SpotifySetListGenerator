import './App.css';
import { BsPlusLg } from 'react-icons/bs'
import Fade from 'react-reveal/Fade';
import { FaSearch } from 'react-icons/fa';
import Header from './components/Header';
import headphone_icon from './images/headphoneicon.svg';
import music_icon from './images/musicicon.svg';
import phone_icon from './images/phoneicon.svg';
import React, {useState, useEffect} from 'react';
import { XMLParser } from 'fast-xml-parser';

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [setUserId] = useState(null)

  useEffect(() => {
    //Check for artistName and artistKey in local storage.
    let artistName = window.localStorage.getItem("artistName")
    let artistKey = window.localStorage.getItem("artistKey")

    if (artistName !== null && artistKey !== null) {
      window.localStorage.removeItem("artistName")
      window.localStorage.removeItem("artistKey")
      goToArtistResults(artistKey, artistName)
    }
}, [])

  /**
   * Clears out all state variables and returns to home page.
   */
  const goToHomePage = () => {
    setSearchResults([]);
    setQuery("");
  }

  /**
   * Filters out MusicBrainz results that don't match artist tha's searched for.
   */
  const sanitizeSearchResults = (searchResults) => {
    let splice_index = searchResults.length
    for (let i = 0; i < searchResults.length; i++) {
      if ((searchResults[i].name.toLowerCase() === "the name" && query !== "the name") ||
        (searchResults[i].name.toLowerCase() === "name" && query !== "name") || 
        (searchResults[i].name.toLowerCase() === "n.a.m.e" && query !== "n.a.m.e")
        ) { // API will return these for partial matches. Don't want them unless it's a perfect match.
        splice_index = i
        break;
      }
    }
    searchResults = searchResults.splice(0, splice_index)
    
    return searchResults.splice(0, 6) //Restrict results to length of 6
  }

  /**
   * Goes to results page for selected artist.
   */
  const goToArtistResults = (key, name) => {
    window.location.href = `/artist_results/${name}/${key}`
  }

  /**
   * Queries MusicBrainz API for artist names
   */
  const submitQuery = (query) => {
    if (query === "" || query === " " || query === "a") { // Clear query and search results if string is empty or insignificant
      setQuery("")
      setSearchResults([])
    }
    else {
      setQuery(query)
      
      if (query.length > 2) { // Reduces number of API calls.
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

        let results = sanitizeSearchResults(obj.metadata['artist-list'].artist, query) //Sanitize results
        setSearchResults(results)
        })
        .catch(error => {
          //503 error occurs if we send too many requests to MusicBrainz
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
