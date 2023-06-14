import React from 'react';
import '../css/SongView.css';

function SongView (props) {
    /**
     * Song view in setlist view.
     */
    return (
        <div onClick={(e) => {
            e.stopPropagation()
            props.addSongToPlaylist(props.song)
            }} className="song-wrapper">
            <p className="song-num">{props.songNum.toString().concat(".")}</p>
            <p className="song-title">{props.song.name}</p>
        </div>
    )
}

export default SongView;