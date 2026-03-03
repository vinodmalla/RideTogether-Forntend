import {io} from 'socket.io-client';  // Import the io function from the socket.io-client library to establish a connection to the socket server.
export const connectSocket = () => { // Define a function called connectSocket that will be used to establish a connection to the socket server.
    return io({url: "https://ridetogether-backend.onrender.com"}); // Use the io function to connect to the socket server at the specified URL (http://localhost:5000) and return the socket instance.
}
