import React, { useState, useEffect } from 'react';
import './App.css';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';

let map;
let bounds = new window.google.maps.LatLngBounds();
let sub_area;
let coordinates=[];
let color = "black"

const App = () => {

  const [options, setOptions] = useState([]);
  
  useEffect(() => {
    getLocation()
  },[])

  const getLocation = () => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(success)
      function success(position) {
        initMap(position.coords.latitude,position.coords.longitude)
      }
    }
  }

  const initMap = (latitude,longitude) => {
    map = new window.google.maps.Map(document.getElementById('map'),{
      center: {lat: latitude, lng: longitude},
      zoom: 5,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER
      },
      mapTypeId: 'roadmap',
    });
  }

  const handleSearch = (query) => {
    if (query === "") {
      return null;
    }else{
      fetch(`https://nominatim.openstreetmap.org/search.php?q=${query}&polygon_geojson=1&format=json`)
      .then(resp => resp.json())
      .then(data => {
        let filterGeoJsonType = data.filter(function(data){
          return data.geojson.type === "MultiPolygon" || data.geojson.type === "Polygon"
        });
        setOptions(filterGeoJsonType);
      });
    }
  }

  const renderCoordinate = (paths) => {
    coordinates = [];
    let position = 0;
    paths.map((location) =>{
        if(position %10 === 0){
          coordinates.push({"lat": location[1], "lng": location[0]});
          bounds.extend({"lat": location[1], "lng": location[0]});
        }
        position++
        return true;
    });
  }

  const renderToMaps = (selectedOptions) => {
      selectedOptions.forEach((option) => {
      if(option.geojson.type === "MultiPolygon"){
        renderCoordinate(option.geojson.coordinates[0][0]);
      }else if(option.geojson.type === "Polygon"){
        renderCoordinate(option.geojson.coordinates[0]);
      }else{
        alert('option.geojson.type: MultiPolygon & Polygon');
  }
      
      if(coordinates.length > 1){
        sub_area = new window.google.maps.Polygon({
          paths: coordinates,
          strokeColor: color[1],
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color[1],
          fillOpacity: 0.35,
          editable: true
        });
        
        sub_area.setMap(map);
        map.setOptions({ maxZoom: 15 });
        map.fitBounds(bounds);
        coordinates = [];
      }
    })
  }

  const handleChange = (option) => {
    initMap()
    renderToMaps(option)
  }

    return (
      <div className="container">
        <div className="page-header">
            <h1>Apptunix Geofence Task</h1>
          </div>
           <AsyncTypeahead
                id="typehead"
                multiple
                labelKey="display_name"
                onSearch={handleSearch}
                onChange={handleChange}
                options={options}
                placeholder="Enter City ... "
                className="search-box"
            />
              
            <div className="maps" id="map"></div>
      </div>
    );
}

export default App;
