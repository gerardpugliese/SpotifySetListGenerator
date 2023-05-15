import PlaylistSong from './PlaylistSong';
import React, {useState, useEffect} from 'react'
import ReactSwitch from 'react-switch';

function PlaylistForm(props) {
    const [checked, setChecked] = useState(true);
    const [playlistName, setPlaylistName] = useState("");
    const [userId] = useState(props.userId)
    const [songs, setSongs] = useState(props.songs)
    const [token] = useState(props.token)
    const [errorText, setErrorText] = useState("")

    /**
     * Builds list of song URIs.
     */
    useEffect(() => {
        let i = 0;
        let uris = [];
        while (i < songs.length) {
            if (typeof songs[i] !== "string") { //If song type is string it's not on Spotify and has no URI
                uris.push(songs[i].uri);
            }
            i++;
        }
        setSongs(uris);
    }, [props.songs])

    /**
     * Changes state of private / public playlist toggle switch.
     */
    const handleChange = val => {
        setChecked(val)
    }

    /**
     * Adds playlist songs to newly created Spotify playlist.
     */
    const populatePlaylist = (id) => {
        let data = {
            "uris": songs,
            "position": 0
        }
        fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
            method: "POST",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
          })
        .then(resp => resp.json())
        .then(resp => {
            if (resp["error"]) {
                props.changePlaylistFormState(-1) // Error occurred populating Spotify playlist.
            } else {
                props.changePlaylistFormState(2) // Spotify playlist was created successfully.
            }
        })
        .catch(error => {
            props.changePlaylistFormState(-1)
        })
    }

    /**
     * Creates new Spotify playlist for user.
     */
    const createPlaylist = () => {
        if (playlistName === "") {
            setErrorText("Playlist name can't be empty!")
            setTimeout(() => {
                setErrorText("") //Show error for 3 seconds
              }, 3000)
        } else {
            props.changePlaylistFormState(1)
            let data = {
                "name": playlistName,
                "public": checked,
            }
            fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                method: "POST",
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })
            .then(resp => resp.json())
            .then(resp => {
                populatePlaylist(resp.id) // Adds songs to newly created playlist.
            })
            .catch(error => {
                console.log(error)
            })
        } 
    }

    return (
        <div className="playlist-form-wrapper">
            <p className="playlist-form-title">Your Playlist Details</p>
            <div className="playlist-form-name-wrapper">
                <p className="playlist-form-name-title">Playlist Name:</p>
                <input style={errorText !== "" ? {border: "1px solid #e80c1f"} : {}} onChange={e => setPlaylistName(e.target.value)} className="playlist-form-name-input" type="text" />
            </div>
            <div className="playlist-form-public-wrapper">
                <p className="playlist-form-name-title">{checked === true ? "Public" : "Private"}:</p>
                <ReactSwitch
                className="playlist-form-public-switch"
                checked={checked}
                onColor={'#14213d'}
                offColor={'#a8acb3'}
                onChange={handleChange}
                />
            </div>
            <div className="finalize-playlist-mobile-songs">
                <p style={{marginRight: "auto", marginLeft: "auto"}}className="playlist-songs-name-title">Playlist Songs:</p>
                <div className="finalize-playlist-right-songs">
                {props.songs.map((song, idx, arr) => {
                    if (typeof song.song !== "string") {
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
                                <p className="confirm-playlist-song-name">{song.song} - not found on Spotify!</p>
                            </div>
                        </div>
                        </div>
                    }
                    })}
                </div>
            </div>
            <div className="playlist-confirm-form-wrapper">
                <div className="playlist-confirm-form-btn">
                    <p onClick={() => createPlaylist()} className="playlist-confirm-form-btn-text">Create</p>
                </div>
            </div>
            {
                errorText !== "" && <div className="error-text-wrapper">
                    <p className="error-text">{errorText}</p>
                </div>
            }
        </div>
    )
}

export default PlaylistForm