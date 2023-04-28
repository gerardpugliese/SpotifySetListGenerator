import React, {useState, useEffect} from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import SongView from './SongView';
import useCollapse from 'react-collapsed';
import Fade from 'react-reveal/Fade';


function SetlistView (props) {
    const [songList, setSongList] = useState([]);
    const [isExpanded, setExpanded] = useState(false)
    const [delay, setDelay] = useState(0)
    const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

    useEffect(() => {
        //Musicbrainz stores an encore as a second set in the setlist data. If there is more than 1 set present, that means
        //there was an encore. In that case, we need to merge these two sets and set the song list as the combined list.
        if (props.setlist.sets.set.length > 1) { //Encore exists
            let full_setlist = [...props.setlist.sets.set[0].song, ...props.setlist.sets.set[1].song]
            setSongList(full_setlist)
        }
        else {
            setSongList(props.setlist.sets.set[0].song)
        }

        //First 4 setlist views (the amount that will be on screen) need have offset fade in effects for the desire 
        //cascading effect. 
        if (props.idx < 4) {
            setDelay(props.idx * 200)
        }
    }, [])

    const numToMonth = (num) => {
        //Helper funciton to convert a month number to string. 
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

    const numToDate = (num) => {
        //Helper function to format date
        if (num[0] === "0") { //Remove 0 if num < 10
            return num[1]
        } else {
            return num
        }
    }

    const formatDate = (date) => {
        //Takes in date from setlist data and formats it.
        let split_date = date.split("-") //split_date[0] -> day, split_date[1] -> month, split_date[2] -> year
        let formatted_date = ""
        
        formatted_date = formatted_date.concat(numToMonth(split_date[1]))
        formatted_date = formatted_date.concat(" ")
        formatted_date = formatted_date.concat(numToDate(split_date[0]))
        formatted_date = formatted_date.concat(", ")
        formatted_date = formatted_date.concat(split_date[2])

        return formatted_date
    }

    const formatVenueLocation = (location) => {
        //Takes in venue location from setlist data and formats it.
        let formattedLocation = ""
        if (location.country.code === "US") {
            formattedLocation = location.name.concat(", ".concat(location.stateCode))
        } else {
            formattedLocation = location.name.concat(", ".concat(location.country.name))
        }

        return formattedLocation
    }

    const songCount = (set) => {
        //Extracts song count from setlist data and returns formatted string
        if (set[0] !== undefined) {
            return "Songs (".concat(songList.length.toString().concat(")"))
        }
    }

    return (
        <Fade delay={delay}>
            <div key={props.idx} onClick={() => props.addSetToPlaylist(songList)} className="setlist-result">
                <div className="setlist-result-top">
                    <p className="setlist-venue-name">{props.setlist.venue.name}</p>
                    <p className="setlist-venueu-location">{formatVenueLocation(props.setlist.venue.city)}</p>
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
                    return (
                        <div key={idx}>
                            <SongView song={song} songNum={idx+1} addSongToPlaylist={props.addSongToPlaylist}/>
                        </div>
                    )
                    })} 
                </div>
            </div>
        </Fade>
    )
}

export default SetlistView;