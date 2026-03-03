import React, { use, useEffect,useState } from 'react'
import { connectSocket } from '../utils/socket'; // Import the connectSocket function from the socket utility file to establish a connection to the socket server.
import { useParams } from 'react-router-dom' // Import the useParams hook from react-router-dom to access URL parameters, specifically to extract the roomID from the URL when the user navigates to a specific room.
import { Link } from 'react-router-dom'; // Import the Link component from react-router-dom to enable navigation between different routes in the application, such as allowing users to leave the room and navigate back to the home page.
import Map from './Map'; // Import the Map component to display the map within the room, allowing users to see their location and navigate together with other participants in the room.
import axios from 'axios'; // Import the axios library to make HTTP requests to the backend server, such as creating a room or fetching data related to the room and its participants.

function Room() {
  const { roomID } = useParams(); // Extract the roomID from the URL parameters 
 
  const [toLocation, setToLocation] = useState(null); // Initialize a state variable to store the destination location for navigation within the room.
  const [username, setUsername] = useState(""); // Initialize a state variable to store the username of the user, which will be used to identify the user in the room and for other functionalities related to the user's identity within the application.
  const [users,setusers] = useState([]); // Initialize a state variable to store the list of users in the room.
  const [latlog,setLatlog] = useState(null); // Initialize a state variable to store the latitude and longitude of the destination location.
  const [currentLocation,setCurrentLocation] = useState(null); // Initialize a state variable to store the current location of the user.
  const [distance, setDistance] = useState("");
const [duration, setDuration] = useState("");
const [adminID, setAdminID] = useState(""); 
const userID = localStorage.getItem('userID'); // Retrieve the userID from local storage to identify the user in the room and for other functionalities related to the user's identity within the application.
    useEffect(() => {
  
      if (!navigator.geolocation) return;
  
      const watchId = navigator.geolocation.getCurrentPosition(
  
        (position) => {
  
          const { latitude, longitude } = position.coords;
  
          setLatlog({
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
    console.log("latlog",latlog)
    const getCurrentLocation = async()=>{
      const data=await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlog.lat},${latlog.lng}&key=${import.meta.env.VITE_API_KEY_FOR_MAP_SERVICE2}`)
      console.log(data.data.results[0].formatted_address)
      setCurrentLocation(data.data.results[0].formatted_address)
    } 
    useEffect(() => {
      getCurrentLocation();
    }
    , [latlog])
    useEffect(() => {
      const saveCurrentLocation=localStorage.getItem('toLocation')
      if(saveCurrentLocation){
        setToLocation(saveCurrentLocation)
      }
    }, [])

    

  useEffect(() => {
    const name = localStorage.getItem('username'); // Retrieve the username from local storage when the component mounts
    if (name) {
      setUsername(name); // Set the username state variable to the retrieved username
      console.log(`Username: ${name}`); // Log the username to the console for debugging purposes
    }
  }, []); // The empty dependency array ensures that this effect runs only once when the component mounts.

  
  useEffect(()=>{
    const name = localStorage.getItem('username');
    const userid = localStorage.getItem('userID')
      const socket = connectSocket(); // Connect to the socket when the component mounts
      socket.emit('join-room',{roomID,name,userid}); // Emit a 'connected' event to the socket server with the roomID as data to notify the server that a user has connected to a specific room.
      socket.on('receive-locations',(roomusers)=>{
        setusers(roomusers); 
        
      })
      socket.on("adminId",(adminID)=>{
        setAdminID(adminID)
      });
      return () => { // Cleanup function to disconnect the socket when the component unmounts
        socket.disconnect(); // Disconnect from the socket when the component unmounts
      }
    },[]) // The empty dependency array ensures that the effect runs only once when the component mounts, and the cleanup function runs when the component unmounts.
    
    const getlatlong =async () => {
      const data=await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${toLocation}&key=${import.meta.env.VITE_API_KEY_FOR_MAP_SERVICE2}`)
      localStorage.setItem('toLocation',toLocation)
    
      const setdata=await axios.post('http://localhost:5000/set-destination',{roomID:roomID,destination:data.data.results[0].geometry.location})
      console.log(setdata)
    }
    
    console.log("users",users)
    console.log("adminID",adminID)
    
  return (
 <div className='bg-[#191616] min-h-screen w-full flex flex-col'>


  {/* Header */}
  <div className='px-6 pt-6 md:px-12'>

    {/* FIXED: removed hidden */}
    <h1 className='font-bold text-[#2539EB] text-3xl md:text-4xl'>
      RideTogether
    </h1>

    <p className='text-[#B6BAC4] text-sm md:text-lg mt-1'>
      Group Navigation Made Easy
    </p>

  </div>



  {/* Room Container */}
  <div className='w-[95%] max-w-6xl m-auto bg-[#161A22] border border-[#45464f] rounded-2xl mt-6 flex flex-col'>


    {/* Top Bar */}
    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 py-4 border-b border-[#45464f]'>



      {/* From location */}
      <input
        type="text"
        placeholder='From Location'
        value={currentLocation}
        className='w-full md:w-[25%] h-10 rounded-full bg-[#E8E8E8] text-[#333] px-4'
      />



      {/* To location */}
      <input
        value={toLocation}
        onChange={(e)=>setToLocation(e.target.value)}
        type="text"
        placeholder='To Location'
        className='w-full md:w-[25%] h-10 rounded-full bg-[#E8E8E8] text-[#333] px-4'
      />



      {/* ✅ Admin only SET button */}
      {

    

          <button
            onClick={getlatlong}
            disabled={adminID !== userID} // Disable the button if the current user is not the admin
             
            className="bg-[#33B650] text-white font-semibold rounded-full px-6 py-2"
          >

            Set Destination

          </button>

        

      }



      {/* Room Info */}
      <h1 className='text-white font-medium text-lg'>

        Room: {roomID} | You: {username}

      </h1>



      {/* Leave button */}
      <Link
        to="/"
        className='bg-[#c53015] text-white font-semibold rounded-full px-4 py-2'
      >

        Leave

      </Link>



    </div>




    {/* Main Content */}
    <div className='flex flex-col md:flex-row'>


      {/* Map Section */}
      <div className='w-full md:w-[70%] h-[300px] md:h-[500px] border-r border-[#45464f]'>

       <Map
  setDistance={setDistance}
  setDuration={setDuration}
/>

      </div>
   




      {/* Participants */}
      <div className='w-full md:w-[30%] p-4'>


        <h2 className='text-white text-lg font-semibold mb-4'>

          Participants

        </h2>



        {Object.entries(users).map(([ index, user]) => (

          <div
              key={index}
              className='flex bg-[#1f2430] rounded-lg px-3 py-2 mb-3 items-center gap-3'
            >

              <div className='w-3 h-3 rounded-full bg-green-500'></div>


              <span className='text-white'>

                {user.username} {user.adminID=== adminID && "(Admin)"}

              </span>

            </div>

          ))

         

        } 
           <div className="text-white">

 Distance: {distance}

</div>

<div className="text-white">

 ETA: {duration}

</div>


      </div>



    </div>


  </div>


</div>

   
  )
}

export default Room
