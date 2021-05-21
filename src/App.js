import React, { useState, useEffect, useCallback } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import * as placeDate from './markerCodes.json';
import cat from './images/marker.png';
import './App.css';

mapboxgl.workerClass =
  // these lines added to correct official mapbox bug in production
  // eslint-disable-next-line import/no-webpack-loader-syntax
  require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

export default function App() {
  const [slide, setSlide] = useState(12);
  const [viewport, setViewport] = useState({
    latitude: 41.012,
    longitude: 28.9933,
    width: 'fit-to-width',
    height: '70vh',
    zoom: slide,
  });
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    const listener = (e) => {
      if (e.key === 'Escape') {
        setSelectedPlace(null);
      }
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);

  const onUpdate = (e) => {
    setSlide(e.target.value);
    setViewport({
      ...viewport,
      zoom: Number(slide),
    });
  };

  const centerMap = useCallback(
    (place) => {
      setViewport((viewport) => ({
        ...viewport,
        zoom: Number(slide),
        latitude: place.geometry.coordinates[1],
        longitude: place.geometry.coordinates[0],
      }));
    },
    [setViewport, slide]
  );

  return (
    <div className="map-container">
      <h1 className="map-name">The Best Places of Istanbul</h1>
      <div className="sidebar-lng-ltd">
        Longitude: {viewport.longitude.toFixed(4)} | Latitude:{' '}
        {viewport.latitude.toFixed(4)} | Zoom: {viewport.zoom.toFixed(0)}
      </div>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken="pk.eyJ1IjoidG9uZGVtb29uIiwiYSI6ImNrZ3lyYnowMzBoMGMycW52Z3Fjdmhha28ifQ.Sy3FsE8nP6Pr3x-WzK_31w"
        mapStyle="mapbox://styles/tondemoon/ckowqibvx0txf18k8lhoeu4p2"
        onViewportChange={(viewport) => {
          setViewport(viewport);
        }}
      >
        {placeDate.features.map((place) => (
          <Marker
            key={place.properties.PLACE_ID}
            latitude={place.geometry.coordinates[1]}
            longitude={place.geometry.coordinates[0]}
          >
            <button
              className="marker-btn"
              onClick={(e) => {
                e.preventDefault();
                setSelectedPlace(place);
                centerMap(place);
              }}
            >
              <img src={cat} alt="Cat Icon" />
            </button>
          </Marker>
        ))}

        {selectedPlace ? (
          <Popup
            closeOnClick={true}
            dynamicPosition={true}
            latitude={selectedPlace.geometry.coordinates[1]}
            longitude={selectedPlace.geometry.coordinates[0]}
            onClose={() => {
              setSelectedPlace(null);
            }}
          >
            <div>
              <h3>{selectedPlace.properties.NAME} </h3>
              <p>{selectedPlace.properties.DESCRIPTION}</p>
              <p className="closing-text">click once more to close</p>
            </div>
          </Popup>
        ) : null}
      </ReactMapGL>
      <div className="mb1">
        <label className="slide-label">{slide}</label>
        <input
          className="slide-input--range"
          list="tickmarks"
          min={10}
          max={20}
          onChange={(e) => onUpdate(e)}
          step={0.5}
          type="range"
          value={slide}
        />
      </div>
    </div>
  );
}
