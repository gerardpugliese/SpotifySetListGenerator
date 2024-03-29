import React, {useEffect, useState} from 'react';
import '../css/PlaylistSong.css';
import { BsDot } from 'react-icons/bs'
import Fade from 'react-reveal/Fade';

function PlaylistSong(props) {
    const [delay, setDelay] = useState(0);

    /**
     * Sets delay based on how far down the page the song is. Creates cascading effect.
     */
    useEffect(() => {
        if (props.idx < 4) {
            setDelay(props.idx * 200)
        }
    }, [])
    
    return (
        <React.Fragment>
            {typeof props.song.song === "string" ? <React.Fragment /> :
            <Fade delay={delay}>
                <div className="playlist-song-outerwrapper">
                    <div className="playlist-song-num-wrapper">
                        <p className="playlist-song-num">{props.songNum}.</p>
                    </div>
                    <div className="confirm-playlist-song-wrapper">
                        {props.song.song.album !== undefined && <div className="playlist-song-img-wrapper">
                            <img className="playlist-song-img" alt="Album Art" src={props.song.song.album.images[0].url}/>
                        </div>}
                        <div className="playlist-song-info-wrapper">
                            <p className="confirm-playlist-song-name">{props.song.song.name}</p>
                            <div className="playlist-song-album-artist-wrapper">
                                <p className="confirm-playlist-song-artist">{props.song.song.artists[0].name}</p>
                                <BsDot className="confirm-playlist-bulletpoint" />
                                <p className="confirm-playlist-song-album">{props.song.song.album.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Fade>}
        </React.Fragment>
    )
}

export default PlaylistSong;