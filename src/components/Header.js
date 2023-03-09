import React, {useState, useEffect} from "react";
import spotify_logo from '../images/Spotify_Logo_RGB_Green.png';

function Header(props) {
    const [token, setToken] = useState("")
    const [userId, setUserId] = useState(null)

    useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
        token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

        window.location.hash = ""
        window.localStorage.setItem("token", token)
    }
    setToken(token)
    if (userId === null) {
      //Get user profile
      fetch(`https://api.spotify.com/v1/me`, {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
      })
      .then(resp => {
        if (resp.ok) {
          let jsonresp = resp.json()
          setUserId(jsonresp.id)
          props.propagateUserId(jsonresp.id)
        } else {
          logout()
        }
      })
      /*.then(resp => {
        setUserId(resp.id)
        props.propagateUserId(resp.id)
      })*/
      .catch(error => {
        console.log(error)
      })
    }
    }, [])

    const login = () => {
      window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=${process.env.REACT_APP_SCOPE}`
    }

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
      } 
    
    return(
        <div className="home-header">
        <div onClick={() => props.goToHomePage()} className="home-header-logo-wrapper">
          <p className="home-header-logo-txt">SetListify</p>
        </div>
          {token === "" || token === null ? 
          <div onClick={() => login()} className="log-in-btn-wrapper">
          <img alt="Spotify Logo" className="log-in-btn-img" src={spotify_logo}/>
          <p className="log-in-btn-text">LOGIN WITH SPOTIFY</p>
        </div> : <div onClick={() => logout()} className="log-in-btn-wrapper">
              <img alt="Spotify Logo" className="log-in-btn-img" src={spotify_logo}/>
              <p className="log-in-btn-text">LOG OUT</p>
            </div>}
        
      </div>
    );
}

export default Header