
import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker,  DirectionsRenderer } from "@react-google-maps/api";
import { connectSocket } from "../utils/socket";
import { useParams } from "react-router-dom";

// Map container size
const containerStyle = {
  width: "100%",
  height: "500px",
};

// ✅ Create ONE socket instance outside component lifecycle
// This ensures same socket is used everywhere
const socket = connectSocket();

function Map({ setDistance, setDuration }) {

  // Get roomID from URL
  const { roomID } = useParams();

  // Store all users locations
  const [userLocations, setUserLocations] = useState({});

  // Store destination
  const [destination, setDestination] = useState(null);

  // Store current user location
  const [currentLocation, setCurrentLocation] = useState(null);

  const [directions, setDirections] = useState(null);

  
  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_API_KEY_FOR_MAP_SERVICE,
  });

  // --------------------------------------------------
  // ✅ 1. JOIN ROOM (VERY IMPORTANT)
  // This allows backend to send destination and users data
  // --------------------------------------------------
  useEffect(() => {

  // Only run if both exist
  if (!currentLocation || !destination) return;

  // Create directions service
  const directionsService =
    new window.google.maps.DirectionsService();

  directionsService.route(

    {
      origin: currentLocation, // user location

      destination: destination, // destination received from backend

      travelMode:
        window.google.maps.TravelMode.DRIVING,
    },

    (result, status) => {

      if (status === "OK") {

        console.log("Route created");
        const leg = result.routes[0].legs[0];


        setDirections(result);
        setDistance(leg.distance.text)
        setDuration(leg.duration.text)

      } else {

        console.error("Route error:", status);

      }

    }

  );

}, [currentLocation, destination]);

  useEffect(() => {

    const username = localStorage.getItem("username");

    // Join socket room
    socket.emit("join-room", {
      roomID,
      name: username,
    });

  }, [roomID]);



  // --------------------------------------------------
  // ✅ 2. GET CURRENT LOCATION CONTINUOUSLY
  // --------------------------------------------------

  useEffect(() => {

    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(

      (position) => {

        const { latitude, longitude } = position.coords;

        setCurrentLocation({
          lat: latitude,
          lng: longitude,
        });

      },

      (error) => {
        console.error(error);
      }

    );

    // cleanup watch
    return () => navigator.geolocation.clearWatch(watchId);

  }, []);




  // --------------------------------------------------
  // ✅ 3. SEND LOCATION TO BACKEND
  // AND RECEIVE OTHER USERS LOCATIONS
  // --------------------------------------------------

  useEffect(() => {

    if (!currentLocation) return;

    const username = localStorage.getItem("username");
    const userID = localStorage.getItem("userID");

    // Send location to backend
    socket.emit("location-update", {

      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
      roomID,
      name: username,
      userID,

    });

  }, [currentLocation, roomID]);



  // Listen for other users locations
  useEffect(() => {

    socket.on("receive-locations", (locations) => {

      console.log("Received locations:", locations);

      setUserLocations(locations);

    });

    return () => {
      socket.off("receive-locations");
    };

  }, []);




  // --------------------------------------------------
  // ✅ 4. RECEIVE DESTINATION FROM BACKEND
  // --------------------------------------------------

  useEffect(() => {

    socket.on("set-destination", (destinationData) => {

      console.log("Destination received:", destinationData);

      setDestination(destinationData);

    });

    return () => {
      socket.off("set-destination");
    };

  }, []);




  // --------------------------------------------------
  // Loading checks
  // --------------------------------------------------

  if (!isLoaded)
    return <div className="text-white">Loading map...</div>;

  if (!currentLocation)
    return <div className="text-white">Getting location...</div>;




  // --------------------------------------------------
  // MAP UI
  // --------------------------------------------------

  return (

    <GoogleMap

      mapContainerStyle={containerStyle}
      center={currentLocation}
      zoom={14}

    >

      {/* Current Users Markers */}

      {Object.entries(userLocations).map(([id, location]) => (

        <Marker
          key={id}
          position={{
            lat: location.latitude,
            lng: location.longitude,
          }}
        />

      ))}



      {/* Destination Marker */}

      {destination && (

        <Marker
          position={{
            lat: destination.lat,
            lng: destination.lng,
          }}
        />

      )}
      {directions && (

  <DirectionsRenderer

    directions={directions}

  />

)}



    </GoogleMap>

  );

}

export default React.memo(Map);

