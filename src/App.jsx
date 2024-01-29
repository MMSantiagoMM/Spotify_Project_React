import  { useState, useEffect, useRef } from 'react';
import { generateToken, getTopTracksOfArtists } from './assets.js';
import './App.css';

const App = () => {
  const [accessToken, setAccessToken] = useState('');
  const [tokenType, setTokenType] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [theme, setTheme] = useState('light');
  const audioRef = useRef(null);

  const pinkFloydArtistID = '0k17h0D3J5VfsdmQ1iZtE9';
  const bobMarleyArtistID = '2QsynagSdAqZj3U9HgDzjD'; 

  useEffect(() => {
    const fetchTokenAndTracks = async () => {
      await generateToken(setAccessToken, setTokenType);
    };
    fetchTokenAndTracks();
  }, []);

  useEffect(() => {
    if (accessToken && tokenType) {
      
      getTopTracksOfArtists([pinkFloydArtistID, bobMarleyArtistID], tokenType, accessToken, setAllTracks, 10);
    }
  }, [accessToken, tokenType]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      if (currentTrack.previewURL) {
        audioRef.current.src = currentTrack.previewURL;
        audioRef.current.play();
      } else {
        setErrorMessage('There is not view for this song');
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    const result = searchTerm
      ? allTracks.filter(track =>
          track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          track.artists.some(artist => artist.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : allTracks;

    setFilteredTracks(result);
    setErrorMessage(result.length > 0 ? '' : `No results found for "${searchTerm}".`);
  }, [searchTerm, allTracks]);

  const playSong = (previewURL, id) => {
    if (previewURL) {
      setCurrentTrack({ previewURL, id });
      setErrorMessage('');
    } else {
      setErrorMessage('There is not view for this song');
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    document.body.className = theme;
  };

  return (
    <div className={`app ${theme}`}>
      <div className="navbar">
        <h1>Spotify player</h1>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? 'Night mode' : 'Light'}
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          id="search-box"
          className="search-box"
          placeholder="Search for songs, artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div id="error-message" className="error-message">{errorMessage}</div>

      <div className="main-content">
        <h2>Popular Songs</h2>
        <ul className="song-list" id="songs">
          {filteredTracks.map((track) => (
            <li
              key={track.id}
              className={`song-list-item ${currentTrack && currentTrack.id === track.id ? 'playing' : ''}`}
              onClick={() => playSong(track.preview_url, track.id)}
            >
              <img src={track.album.images[0].url} alt="Song cover" />
              <div className="song-info">
                <h3>{track.name}</h3>
                <p>{track.artists.map(artist => artist.name).join(', ')}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <audio controls="controls" id="player" ref={audioRef} onEnded={() => setCurrentTrack(null)}>
        {currentTrack && <source id="audioSource" src={currentTrack.previewURL} type="audio/mpeg" />}
      </audio>
    </div>
  );
};

export default App;