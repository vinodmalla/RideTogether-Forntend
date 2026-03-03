import React, { useState,useId,useEffect} from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';



function Home() {
  const [isID, setID] = useState(true);
  const uniqueID = useId();
  const [username, setUsername] = useState("");
  const [roomID, setRoomID] = useState("");
  const randomString = generateRandomString(10);
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  
  useEffect(() => {
    localStorage.setItem('username', username);
    localStorage.setItem('userID',username+randomString)
  },[username]);

  const createRoom = async() => {
   const data=await axios.post("https://ridetogether-backend.onrender.com/createroom",{roomID:uniqueID,adminUserID:username+randomString,username:username});
   console.log(data)
    
  }

 
  return (
   
    <div className='bg-[#191616] min-h-screen w-full flex flex-col'>

      {/* Header */}
      <div className='px-6 pt-8 md:px-12'>
        <h1 className='font-bold text-[#2539EB] text-3xl md:text-4xl'>
          RideTogether
        </h1>
        <p className='text-[#B6BAC4] text-sm md:text-lg mt-1'>
          Group Navigation Made Easy
        </p>
       
      </div>

      {/* Card Container */}
      <div className='flex flex-1 justify-center items-center px-4'>

        <div className='bg-[#161A22] w-full max-w-md md:max-w-lg rounded-2xl p-6 md:p-8'>

          {/* Create Room */}
          {isID && (
            <div className='flex flex-col gap-4'>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Enter your username'
                className='w-full h-10 rounded-full bg-[#E8E8E8] text-[#333] text-base px-4'
              />

              <Link to={`/room/${uniqueID}`} onClick={createRoom} className='w-full h-10 rounded-full bg-[#33B650] text-white flex items-center justify-center text-center font-semibold'>
                Create Room
              </Link>

            </div>
          )}

          {/* Join Room */}
          {!isID && (
            <div className='flex flex-col gap-4'>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Enter your username'
                className='w-full h-10 rounded-full bg-[#E8E8E8] text-[#333] text-base px-4'
              />

              <input
                type="text"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
                placeholder='Enter your Room ID'
                className='w-full h-10 rounded-full bg-[#E8E8E8] text-[#333] text-base px-4'
              />

              <Link to={`/room/${roomID}`} className='w-full h-10 rounded-full bg-[#33B650] flex items-center justify-center     text-white text-center font-semibold'>
                Join Room
              </Link>

            </div>
          )}

          {/* Toggle */}
          <button
            onClick={() => setID(!isID)}
            className='text-[#B6BAC4] text-sm md:text-base text-center mt-6 w-full hover:text-white transition'
          >
            {isID ? "Join an existing room" : "Create a new room"}
          </button>

        </div>

      </div>

    </div>
    
  )
}


export default Home