import React from 'react';

function SongView (props) {
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