import React, {useState, useEffect} from 'react';
import { BsDot } from 'react-icons/bs'


function PlaylistSong(props) {
    
    return (
        <div className="playlist-song-outerwrapper">
            <div className="playlist-song-num-wrapper">
                <p className="playlist-song-num">{props.songNum}.</p>
            </div>
            <div className="confirm-playlist-song-wrapper">
                {props.song.album != undefined && <div className="playlist-song-img-wrapper">
                    <img className="playlist-song-img" alt="Album Art" src={props.song.album.images[0].url}/>
                </div>}
                <div className="playlist-song-info-wrapper">
                    <p className="confirm-playlist-song-name">{props.song.name}</p>
                    <div className="playlist-song-album-artist-wrapper">
                        <p className="confirm-playlist-song-artist">{props.song.artists[0].name}</p>
                        <BsDot className="confirm-playlist-bulletpoint" />
                        <p className="confirm-playlist-song-album">{props.song.album.name}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaylistSong;