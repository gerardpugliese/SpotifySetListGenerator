import React, {useState, useEffect} from 'react'
import ReactSwitch from 'react-switch';
//import imageToBase64 from 'image-to-base64/browser';
//import Resizer from "react-image-file-resizer";

function PlaylistForm(props) {
    const [checked, setChecked] = useState(true);
    const [playlistName, setPlaylistName] = useState("");
    //const [image] = useState(null)
    //const [imageBase64, setImageBase64] = useState("")
    //const [resizedImage, setResizedImage] = useState(null);
    const [userId] = useState(props.userId)
    const [songs, setSongs] = useState(props.songs)
    const [token] = useState(props.token)
    //const [showError, setShowError] = useState(false)
    const [errorText, setErrorText] = useState("")

    useEffect(() => {
        let i = 0;
        let uris = [];
        console.log(props)
        while (i < songs.length) {
            if (songs[i] !== undefined) {
                uris.push(songs[i].uri);
            }
            i++;
        }
        setSongs(uris);
    }, [props.songs])

    const handleChange = val => {
        setChecked(val)
    }

    /*const resizeFile = (file) =>
        new Promise((resolve) => {
        Resizer.imageFileResizer(
            file,
            300,
            300,
            "JPEG",
            100,
            0,
            (uri) => {
                resolve(uri);
            },
            "base64"
        );
    });*/

    /*
    const changePlaylistImg = (id) => {
        fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
            method: "PUT",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'image/jpeg',
            'Authorization': `Bearer ${token}`
            },
            body: resizedImage
          })
        .then(resp => resp.json())
        .then(resp => {
            console.log(resp)
        })
        .catch(error => console.log(error))
    }
    */

    const populatePlaylist = (id) => {
        console.log(songs)
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
            console.log(resp)
            props.changePlaylistFormState(2)
            //changePlaylistImg(id)
        })
        .catch(error => console.log(error))
    }

    const createPlaylist = () => {
        if (playlistName === "") {
            //Set error for 3 seconds
            setErrorText("Playlist name can't be empty!")
            setTimeout(() => {
                setErrorText("")
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
                console.log(resp)
                populatePlaylist(resp.id)
                //Call function to add songs to playlist
            })
            .catch(error => {
                console.log(error)
            })
        } 
    }

    
    /*const handeImageChange = async (e) => {
        try {
            const file = e.target.files[0]
            //const image = await resizeFile(file)
            //setResizedImage(image)
        } catch (err) {
            console.log(err)
        }
        
        imageToBase64(imageUrl) // Image URL
        .then(
            (response) => {
                setImageBase64(response)
                console.log(response); // "iVBORw0KGgoAAAANSwCAIA..."
            }
        )
        .catch(
            (error) => {
                console.log(error); // Logs an error if there was one
            }
        )
    }*/

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
            {/*<div className="playlist-form-name-wrapper">
                <p className="playlist-form-image-title">Playlist Image:</p>
                <input /*onChange={handeImageChange}*//* className="playlist-form-image-input" type="file" />
                {image !== null && <img alt="Playlist Cover" className="playlist-form-image" src={image}/>}
            </div>*/}
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