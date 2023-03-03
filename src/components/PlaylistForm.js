import React, {useState, useEffect} from 'react'
import ReactSwitch from 'react-switch';

function PlaylistForm(props) {
    const [checked, setChecked] = useState(true);
    const [image, setImage] = useState(null)

    const handleChange = val => {
        setChecked(val)
    }

    const handeImageChange = (e) => {
        setImage(URL.createObjectURL(e.target.files[0]))
    }

    return (
        <div className="playlist-form-wrapper">
            <p className="playlist-form-title">Your Playlist Details</p>
            <div className="playlist-form-name-wrapper">
                <p className="playlist-form-name-title">Playlist Name:</p>
                <input className="playlist-form-name-input" type="text" />
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
                <img src={image}/>
            </div>
            <div className="playlist-confirm-form-wrapper">
                <div className="playlist-confirm-form-btn">
                    <p className="playlist-conffirm-form-btn-texg">Create</p>
                </div>
            </div>
        </div>
    )
}

export default PlaylistForm