import logo from './logo.svg';
import './App.css';
import React, {useState} from 'react';
import SetlistView from './components/SetlistView';
import { XMLParser } from 'fast-xml-parser';

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistConfirmed, setArtistConfirmed] = useState(false);
  const [setLists, setSetLists] = useState([]);

  const sanitizeSearchResults = (searchResult) => {
    let splice_index = searchResult.length
    for (let i = 0; i < searchResult.length; i++) {
      /*if (searchResult[i].name.toLowerCase().includes(query.toLowerCase()) == false) {
        splice_index = i;
        break;
      }*/
    }
    return searchResult.splice(0, splice_index)
  }

  const getSetLists = (key) => {
    fetch(`/rest/1.0/artist/${key}/setlists/`, {
        method: "GET",
        headers: {
          'x-api-key': 'KL0aYt8quC2b5oGaMS9cLl8tyokmKIQ0VnxP',
          'Accept': 'application/json	',
        }
    })
    .then(resp => resp.json())
    .then(resp => {
      setArtistConfirmed(true);
      setSetLists(resp.setlist)
      console.log(resp)
    })
    .catch(error => console.log(error))
  }

  const submitQuery = (query) => {
    if (query === "") {
      setQuery("")
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
      let results = sanitizeSearchResults(obj.metadata['artist-list'].artist)
      setSearchResults(results)
      })
    } 
  }

  return (
    <div className="App">
      <div className="home-outer-wrapper">
        <div className="test-wrapper">
        <p className="home-page-blurb">Search for an artist and we’ll show you what they’ve been playing at shows recently!</p>
          {selectedArtist == null ?
          <div className="test-search-wrapper">
            <input id="test-search-input" placeholder="I want to see set lists for..." onChange={e => setQuery(e.target.value)}/>
            <div onClick={() => submitQuery(query)} className="test-search-button">
              <p id="test-search-button-text">Submit</p>
            </div>
            <div className="search-results-wrapper">
              {
                searchResults.length > 0 
                && 
                <React.Fragment>
                <div className="search-results">
                  {searchResults.map((result) => {
                    return (
                      <div onClick={() => setSelectedArtist(result)} className="search-result">
                        <p className="search-result-name">{result.name}</p>
                        {/*<p>{result['@_']['@_id']}</p>*/}
                      </div>
                    )
                  })}
                </div>
                </React.Fragment>
              }
            </div>
          </div> : artistConfirmed === false ? <div className="test-confirm-artist">
            <p id="selected-artist-header">Selected Artist:</p>
            <p id="selected-artist-name">{selectedArtist.name}</p>
            <div onClick={() => getSetLists(selectedArtist['@_']['@_id'])} className="test-search-button">
              <p id="test-search-button-text">Confirm</p>
            </div>
          </div> : <div className="test-artist-setlists">
            <p id="confirmed-artist-header">{selectedArtist.name.concat("'s recent set lists:")}</p>
            <div className="setlist-results">
              {setLists.map((setlist) => {
                return (
                  <SetlistView setlist={setlist}/>
                )
              })}
            </div>
          </div>}
        </div>
      </div>
      
    </div>
  );
}

export default App;
