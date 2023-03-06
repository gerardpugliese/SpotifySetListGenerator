import React, {useState, useEffect} from 'react'
import ReactSwitch from 'react-switch';
import imageToBase64 from 'image-to-base64/browser';
import Resizer from "react-image-file-resizer";

function PlaylistForm(props) {
    const [checked, setChecked] = useState(true);
    const [playlistName, setPlaylistName] = useState("");
    const [image, setImage] = useState(null)
    const [imageBase64, setImageBase64] = useState("")
    const [resizedImage, setResizedImage] = useState(null);
    const [userId, setUserId] = useState(props.userId)
    const [songs, setSongs] = useState([])
    const [token, setToken] = useState(props.token)

    useEffect(() => {
        console.log(props.songs)
        let i = 0;
        let uris = [];
        while (i < props.songs.length) {
            if (props.songs[i] != undefined) {
                uris.push(props.songs[i].uri);
            }
            i++;
        }
        setSongs(uris);
    }, [props.songs])

    const handleChange = val => {
        setChecked(val)
    }

    const resizeFile = (file) =>
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
    });

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

    const populatePlaylist = (id) => {
        //
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
            changePlaylistImg(id)
        })
        .catch(error => console.log(error))
    }

    const testCreate = () => {
        console.log(songs)
    }

    const createPlaylist = () => {
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
    .catch(error => console.log(error))
    }

    const handeImageChange = async (e) => {
        try {
            const file = e.target.files[0]
            const image = await resizeFile(file)
            setResizedImage(image)
        } catch (err) {
            console.log(err)
        }
        
        /*imageToBase64(imageUrl) // Image URL
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
        )*/
    }

    return (
        <div className="playlist-form-wrapper">
            <p className="playlist-form-title">Your Playlist Details</p>
            <div className="playlist-form-name-wrapper">
                <p className="playlist-form-name-title">Playlist Name:</p>
                <input onChange={e => setPlaylistName(e.target.value)}className="playlist-form-name-input" type="text" />
            </div>
            <div className="playlist-form-public-wrapper">
                <p className="playlist-form-name-title">{checked === true ? "Public" : "Private"}:</p>
                <ReactSwitch
                className="playlist-form-public-switch"
                checked={checked}
                onColor={'#2c74e7'}
                offColor={'#a8acb3'}
                onChange={handleChange}
                />
            </div>
            <div className="playlist-form-name-wrapper">
                <p className="playlist-form-image-title">Playlist Image:</p>
                <input onChange={handeImageChange} className="playlist-form-image-input" type="file" />
                <img className="playlist-form-image" src={image}/>
            </div>
            <div className="playlist-confirm-form-wrapper">
                <div className="playlist-confirm-form-btn">
                    <p onClick={() => createPlaylist()} className="playlist-conffirm-form-btn-texg">Create</p>
                </div>
            </div>
        </div>
    )
}

export default PlaylistForm