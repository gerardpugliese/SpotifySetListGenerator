import React, {useState} from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import SongView from './SongView';
import useCollapse from 'react-collapsed';

function SetlistView (props) {
    const [songList, setSongList] = useState(props.setlist.sets.set);
    const [isExpanded, setExpanded] = useState(false)
    const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

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

    const numToDate = (num) => {
        //Remove 0 if num < 10
        if (num[0] === "0") {
            return num[1]
        } else {
            return num
        }
    }

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

    const formatVenueLocation = (location) => {
        let formattedLocation = ""
        if (location.country.code === "US") {
            formattedLocation = location.name.concat(", ".concat(location.stateCode))
        } else {
            formattedLocation = location.name.concat(", ".concat(location.country.name))
        }

        return formattedLocation
    }

    const songCount = (set) => {
        if (set[0] !== undefined) {
            return "Songs (".concat(set[0].song.length.toString().concat(")"))
        }
    }

    return (
        <div className="setlist-result">
            <div className="setlist-result-top">
                <p className="setlist-venue-name">{props.setlist.venue.name}</p>
                <p className="setlist-venueu-location">{formatVenueLocation(props.setlist.venue.city)}</p>
            </div>
            <div className="setlist-result-bottom">
                <p className="setlist-date">{formatDate(props.setlist.eventDate)}</p>
            </div>
            <div {...getToggleProps({onClick: () => setExpanded((prevExpanded) => !prevExpanded),})}className="setlist-result-songs">
                <p className="setlist-songs-dropdown">
                    {songCount(songList)} 
                    {isExpanded ? <FaAngleUp className="dropdown-btn"/> : <FaAngleDown className="dropdown-btn"/>} 
                </p>
            </div>
            <div {...getCollapseProps()} className="setlist-song-list">
                {songList[0] !== undefined && songList[0].song.map((song, idx) => {
                return (
                    <SongView song={song} songNum={idx+1}/>
                )
                })} 
            </div>
        </div>
    )
}

export default SetlistView;