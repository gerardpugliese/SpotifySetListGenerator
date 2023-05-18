import React, {useState, useEffect} from "react";
import spotify_logo from '../images/Spotify_Logo_RGB_Green.png';

function Header(props) {
    const [token, setToken] = useState("")
    const [userId, setUserId] = useState(null)

    /**
     * Retrieves user's token from local storage.
     */
    useEffect(() => {
      const hash = window.location.hash
      let token = window.localStorage.getItem("token")
      
      if (!token && hash) {
          token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

          window.location.hash = ""
          window.localStorage.setItem("token", token)
      }

      setToken(token)

      if (userId === null && token !== null) { // Retrieves Spotify user info if we have a token and no user info.
        fetch(`https://api.spotify.com/v1/me`, {
            method: "GET",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
        })
        .then(resp => resp.json())
        .then(resp => {
          if ("error" in resp) { // Logout if error occurs
            logout()
          } else {
            setUserId(resp.id) // Stores spotify user id in state variable
            if (props.propagateUserId) { 
              props.propagateUserId(resp.id) // Propagates user id to parent component.
            }
          }
        })
        .catch(error => {
          console.log(error)
        })
      }
    }, [])

    /**
     * Logs user into their Spotify account.
     */
    const login = () => {
      if (props.artistName && props.artistKey && props.songsForPlaylist) {
        window.localStorage.setItem("artistName", props.artistName)
        window.localStorage.setItem("artistKey", props.artistKey)
        window.sessionStorage.setItem("songsForPlaylist", JSON.stringify(props.songsForPlaylist))
      }
      window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=${process.env.REACT_APP_SCOPE}`
    }

    /**
     * Logs user out of their Spotify account.
     */
    const logout = () => {
      setToken("")
      window.localStorage.removeItem("token")
    } 

    const goToHomePage = () => {
      window.localStorage.removeItem("artistName");
      window.localStorage.removeItem("artistKey");
      window.sessionStorage.removeItem("songsForPlaylist");
      window.location.href = "/";
    }
    
    return(
        <div className="home-header">
          <div onClick={() => goToHomePage()} className="home-header-logo-wrapper">
            <p className="home-header-logo-txt">SetListify</p>
          </div>
          {token === "" || token === null ? 
          <div onClick={() => login()} className="log-in-btn-wrapper">
            <img alt="Spotify Logo" className="log-in-btn-img" src={spotify_logo}/>
            <p className="log-in-btn-text">LOGIN WITH SPOTIFY</p>
          </div> 
          : 
          <div onClick={() => logout()} className="log-in-btn-wrapper">
            <img alt="Spotify Logo" className="log-in-btn-img" src={spotify_logo}/>
            <p className="log-in-btn-text">LOG OUT</p>
          </div>}
      </div>
    );
}

export default Header