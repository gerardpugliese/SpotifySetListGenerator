import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ArtistResults from './components/ArtistResults';
import reportWebVitals from './reportWebVitals';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import PlaylistFinalization from './components/PlaylistFinalization';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<App />}/>
        <Route exact path="/artist_results/:name/:id" element={<ArtistResults />} />
        <Route exact path="/finalize_playlist" element={<PlaylistFinalization />} />
      </Routes>
  </BrowserRouter>
);

reportWebVitals();
