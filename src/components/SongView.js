import React, {useState} from 'react';

function SongView (props) {
    return (
        <div className="song-wrapper">
            <p className="song-num">{props.songNum.toString().concat(".")}</p>
            <p className="song-title">{props.song.name}</p>
        </div>
    )
}

export default SongView;