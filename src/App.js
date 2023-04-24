import './App.css';
import React, {useState} from 'react';
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
  const [setUserId] = useState(null)

  const goToHomePage = () => {
    //Clear out all state variables, this will return us to home page
    setSearchResults([]);
    setQuery("");
  }

  const sanitizeSearchResults = (searchResults) => {
    /*
      This function takes in the artist results from musicbrainz and filters out some unwanted results.
      If there were only a few results matching the query, other very general results such as 'the name',
      'name' and 'n.a.m.e' are in the result. This function filters those out unless explicitly queried. 
    */

    let splice_index = searchResults.length
    for (let i = 0; i < searchResults.length; i++) {
      if ((searchResults[i].name.toLowerCase() === "the name" && query !== "the name") ||
        (searchResults[i].name.toLowerCase() === "name" && query !== "name") || 
        (searchResults[i].name.toLowerCase() === "n.a.m.e" && query !== "n.a.m.e")
        ) {
        //If one of these names is found, store it's index so we can remove it.
        splice_index = i
        break;
      }
    }
    //Use found index to remove result
    searchResults = searchResults.splice(0, splice_index)
    
    //Restrict results to length of 6
    return searchResults.splice(0, 6)
  }

  const goToArtistResults = (key, name) => {
    //Function that executes when an artist result is clicked on.s
    window.location.href = `/artist_results/${name}/${key}`
  }

  const submitQuery = (query) => {
    /*This function executes everytime the artist input text changes. It will query musicbrainz and return results for
      the current artist input. 
    */

    //Since this function executes onChange, if the query becomes an empty string we should clear out the results and not
    //send a request to musicbrainz with an empty artist name. In this implementation we don't query 'a' as well.
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
