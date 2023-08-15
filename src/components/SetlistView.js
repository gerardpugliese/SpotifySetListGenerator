import React, {useState, useEffect} from 'react';
import '../css/SetlistView.css';
import { FaAngleDown, FaAngleUp, FaPlus } from 'react-icons/fa';
import Fade from 'react-reveal/Fade';
import SongView from './SongView';
import useCollapse from 'react-collapsed';

function SetlistView (props) {
    const [delay, setDelay] = useState(0);
    const [isExpanded, setExpanded] = useState(false);
    const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded });
    const [songList, setSongList] = useState([]);

    /**
     * Creates song list and and sets delays.
     */
    useEffect(() => {
        if (props.setlist.sets.set.length > 1) { // If encores exist (more than one element in setlist array), make sure all are combined.
            let setlist_length = props.setlist.sets.set.length;
            let i = 1;
            let full_setlist = props.setlist.sets.set[0].song;
            while (i < setlist_length) {
                full_setlist = [...full_setlist, ...props.setlist.sets.set[i].song];
                i += 1;
            }
            setSongList(sanitizeSetlist(full_setlist))
        }
        else { // No encore exists.
            setSongList(sanitizeSetlist(props.setlist.sets.set[0].song))  
        }
 
        if (props.idx < 4) { //Sets delay based on how far down the page the song is. Creates cascading effect.
            setDelay(props.idx * 200)
        }
    }, [])

    /**
     * Removes unwanted songs from setlist 
     */
    const sanitizeSetlist = (setlist) => {
        return setlist;
    }

    /**
     * Converts numbered month to string month.
     */
    const numToMonth = (num) => {
        switch(num) {
            case "01":
            return "January";
            case "02":
            return "February";
            case "03":
            return "March";
            case "04":
            return "April";
            case "05":
            return "May";
            case "06":
            return "June";
            case "07":
            return "July";
            case "08":
            return "August";
            case "09":
            return "September";
            case "10":
            return "October";
            case "11":
            return "November";
            case "12":
            return "December";
            default: 
            return "";
        }
    }

    /**
     * Formats setlist day.
     */
    const numToDate = (num) => {
        if (num[0] === "0") { // Remove 0 if num < 10.
            return num[1]
        } else {
            return num
        }
    }

    /**
     * Formats setlist date.
     */
    const formatDate = (date) => {
        let split_date = date.split("-") //split_date[0] -> day, split_date[1] -> month, split_date[2] -> year
        let formatted_date = ""
        
        formatted_date = formatted_date.concat(numToMonth(split_date[1]))
        formatted_date = formatted_date.concat(" ")
        formatted_date = formatted_date.concat(numToDate(split_date[0]))
        formatted_date = formatted_date.concat(", ")
        formatted_date = formatted_date.concat(split_date[2])

        return formatted_date
    }

    /**
     * Formats venue location.
     */
    const formatVenueLocation = (location) => {
        let formattedLocation = ""
        if (location.country.code === "US") { //Include state if location is in US.
            formattedLocation = location.name.concat(", ".concat(location.stateCode))
        } else {
            formattedLocation = location.name.concat(", ".concat(location.country.name))
        }
        return formattedLocation
    }

    /**
     * Extract song count and format it as a string.
     */
    const songCount = (set) => {
        if (set[0] !== undefined) {
            return "Songs (".concat(songList.length.toString().concat(")"))
        }
    }

    return (
        <Fade delay={delay}>
            <div key={props.idx} className="setlist-result">
                <div className="setlist-result-top">
                    <div className="setlist-result-top-left">
                        <p className="setlist-venue-name">{props.setlist.venue.name}</p>
                        <p className="setlist-venue-location">{formatVenueLocation(props.setlist.venue.city)}</p>
                    </div>
                    <div className="setlist-result-top-right">
                        <FaPlus onClick={() => props.addSetToPlaylist(songList)} className="add-setlist-btn"/>
                    </div>
                </div>
                <div className="setlist-result-bottom">
                    <p className="setlist-date">{formatDate(props.setlist.eventDate)}</p>
                </div>
                <div {...getToggleProps({onClick: (e) => {
                    e.stopPropagation()
                    setExpanded((prevExpanded) => !prevExpanded)
                    }})}className="setlist-result-songs">
                    <p className="setlist-songs-dropdown">
                        {songCount(songList)} 
                        {isExpanded ? <FaAngleUp className="dropdown-btn"/> : <FaAngleDown className="dropdown-btn"/>} 
                    </p>
                </div>
                <div {...getCollapseProps()} className="setlist-song-list">
                    {songList !== undefined && songList.map((song, idx) => {
                        if (song.name !== '') {
                        return (
                            <div key={idx}>
                                <SongView song={song} songNum={idx+1} addSongToPlaylist={props.addSongToPlaylist}/>
                            </div> 
                        )} else {
                            return <React.Fragment />
                        }
                    })} 
                </div>
            </div>
        </Fade>
    )
}

export default SetlistView;