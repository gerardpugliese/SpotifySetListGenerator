import './index.css';
import App from './App';
import ArtistResults from './components/ArtistResults';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
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
