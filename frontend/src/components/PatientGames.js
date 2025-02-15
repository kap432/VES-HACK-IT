import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client"; // Import socket.io-client
import "./PatientGames.css"; // Optional for styling

const socket = io("http://localhost:5000"); // Connect to backend WebSocket server

const PatientGames = () => {
  const { patientId } = useParams(); // Get the patient ID from URL
  const [gamesData, setGamesData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  const [notifications, setNotifications] = useState([]); // Store real-time notifications
  const token = localStorage.getItem("token");

  // Family form states
  const [familyName, setFamilyName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [familyImageUrl, setFamilyImageUrl] = useState("");
  const [familyMessage, setFamilyMessage] = useState("");

  // Dropdown options for family relations
  const relationOptions = [
    "Great-Grandfather",
    "Great-Grandmother",
    "Grandfather",
    "Grandmother",
    "Father",
    "Mother",
    "Paternal Uncle",
    "Maternal Aunt",
    "Child",
    "Sibling",
    "First-Cousin",
    "Baby-Cousin",
  ];
  

  // Function to fetch game progress for the patient
  const fetchPatientGames = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/guardian/patient/${patientId}`,
        { headers: { "x-auth-token": token } }
      );
      setGamesData(res.data);
      setErrorMessage("");
    } catch (error) {
      console.error(
        "Error fetching patient games:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to load game data for this patient.");
    }
  };

  useEffect(() => {
    fetchPatientGames();

    // Listen for real-time task notifications
    socket.on(`taskNotification-${patientId}`, (message) => {
      setNotifications((prev) => [...prev, message]); // Store new notifications
    });

    return () => {
      socket.off(`taskNotification-${patientId}`);
    };
  }, [patientId]);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        taskDescription,
        startTime,
        endTime,
      };
      const res = await axios.post(
        `http://localhost:5000/api/tasks/${patientId}`,
        payload,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      setAssignMessage(res.data.msg);
      socket.emit("newTaskAssigned", { patientId, message: res.data.msg });

      // Fetch the user's mobile number
      const userRes = await axios.get(
        `http://localhost:5000/api/users/${patientId}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      


      const userMobile = userRes.data.mobile;

     // Send SMS notification
     const smsPayload = {
       phone: userMobile,
       message: `New task assigned: ${taskDescription} from ${startTime} to ${endTime}`,
     };
      await axios.post(
        "http://localhost:5000/api/notifications/send-sms",
        smsPayload,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      setTaskDescription("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Error assigning task:", error);
      setAssignMessage("Failed to assign task.");
    }
  };
  // Function to add a family member record for the patient
  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: familyName,
        relation: familyRelation,
        imageUrl: familyImageUrl,
      };
      const res = await axios.post(
        `http://localhost:5000/api/family/${patientId}`,
        payload,
        { headers: { "x-auth-token": token, "Content-Type": "application/json" } }
      );
      setFamilyMessage(res.data.msg);
      setFamilyName("");
      setFamilyRelation("");
      setFamilyImageUrl("");
    } catch (error) {
      console.error(
        "Error adding family record:",
        error.response?.data || error.message
      );
      setFamilyMessage("Failed to add family record.");
    }
  };

  useEffect(() => {
    fetchPatientGames();
  }, [patientId]);

  return (
    <div className="patient-games">
      <h2>Game Details for Patient</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      
      {gamesData.length > 0 ? (
        <div className="games-list">
          {gamesData.map((game) => (
            <div key={game.sessionId} className="game-card">
              <p><strong>Game:</strong> {game.gameName}</p>
              <p><strong>Score:</strong> {game.score}</p>
              <p><strong>Mistakes:</strong> {game.mistakes}</p>
              <p><strong>Total Time:</strong> {game.totalTime} seconds</p>
              <p><strong>Levels:</strong> {game.startLevel} to {game.endLevel}</p>
              <p><strong>Completed:</strong> {game.completed ? "Yes" : "No"}</p>
              <p><strong>Session ID:</strong> {game.sessionId}</p>
              <p><strong>Date:</strong> {new Date(game.timestamp).toLocaleString()}</p>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No game progress data found for this patient.</p>
      )}

      <hr />

      {/* Task Assignment Section */}
      <h3>Assign a New Task</h3>
      {assignMessage && <p>{assignMessage}</p>}
      <form onSubmit={handleAssignTask} className="task-form">
        <input
          type="text"
          placeholder="Task Description (e.g., Morning Walk)"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <button type="submit">Assign Task</button>
      </form>

      <hr />

      {/* Family Member Assignment Section */}
      <h3>Add Family Member</h3>
      {familyMessage && <p>{familyMessage}</p>}
      <form onSubmit={handleAddFamilyMember} className="family-form">
        {/* Patient ID is already known (patientId from URL) */}
        <p><strong>Patient ID:</strong> {patientId}</p>
        <label>
          Relation:
          <select 
            value={familyRelation} 
            onChange={(e) => setFamilyRelation(e.target.value)}
            required
          >
            <option value="">Select Relation</option>
            {relationOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Name:
          <input
            type="text"
            placeholder="Family Member Name"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />
        </label>
        <label>
          Image URL:
          <input
            type="text"
            placeholder="Image URL (Optional)"
            value={familyImageUrl}
            onChange={(e) => setFamilyImageUrl(e.target.value)}
          />
        </label>
        <button type="submit">Add Family Member</button>
      </form>
    </div>
  );
};

export default PatientGames;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import { io } from "socket.io-client"; // Import socket.io-client
// import "./PatientGames.css";

// const socket = io("http://localhost:5000"); // Connect to backend WebSocket server

// const PatientGames = () => {
//   const { patientId } = useParams();
//   const [gamesData, setGamesData] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [taskDescription, setTaskDescription] = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [assignMessage, setAssignMessage] = useState("");
//   const [notifications, setNotifications] = useState([]); // Store real-time notifications
//   const token = localStorage.getItem("token");
//     //Family form states
//   const [familyName, setFamilyName] = useState("");
//   const [familyRelation, setFamilyRelation] = useState("");
//   const [familyImageUrl, setFamilyImageUrl] = useState("");
//   const [familyMessage, setFamilyMessage] = useState("");
//     // Dropdown options for family relations
//   const relationOptions = [
//     "Great-Grandfather",
//     "Great-Grandmother",
//     "Grandfather",
//     "Grandmother",
//     "Father",
//     "Mother",
//     "Paternal Uncle",
//     "Maternal Aunt",
//     "Child",
//     "Sibling",
//     "First-Cousin",
//     "Baby-Cousin",
//   ];

//   console.log("Auth Token:", token);


//   useEffect(() => {
//     fetchPatientGames();

//     // Listen for real-time task notifications
//     socket.on(`taskNotification-${patientId}`, (message) => {
//       setNotifications((prev) => [...prev, message]); // Store new notifications
//     });

//     return () => {
//       socket.off(`taskNotification-${patientId}`);
//     };
//   }, [patientId]);

//   const fetchPatientGames = async () => {
//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/guardian/${patientId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setGamesData(res.data);
//       setErrorMessage("");
//     } catch (error) {
//       console.error("Error fetching patient games:", error);
//       setErrorMessage("Failed to load game data for this patient.");
//     }
//   };

//   const handleAssignTask = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         taskDescription,
//         startTime,
//         endTime,
//       };
//       const res = await axios.post(
//         `http://localhost:5000/api/tasks/${patientId}`,
//         payload,
//         {
//           headers: {
//             "x-auth-token": token,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       setAssignMessage(res.data.msg);
//       socket.emit("newTaskAssigned", { patientId, message: res.data.msg });

//       // Fetch the user's mobile number
//       const userRes = await axios.get(
//         `http://localhost:5000/api/users/${patientId}`,
//         {
//           headers: {
//             "x-auth-token": token,
//           },
//         }
//       );
      


//       const userMobile = userRes.data.mobile;

//      // Send SMS notification
//      const smsPayload = {
//        phone: userMobile,
//        message: `New task assigned: ${taskDescription} from ${startTime} to ${endTime}`,
//      };
//       await axios.post(
//         "http://localhost:5000/api/notifications/send-sms",
//         smsPayload,
//         {
//           headers: {
//             "x-auth-token": token,
//           },
//         }
//       );

//       setTaskDescription("");
//       setStartTime("");
//       setEndTime("");
//     } catch (error) {
//       console.error("Error assigning task:", error);
//       setAssignMessage("Failed to assign task.");
//     }
//   };
//   return (
//     <div className="patient-games">
//       <h2>Game Details for Patient</h2>
//       {errorMessage && <p className="error-message">{errorMessage}</p>}

//       {gamesData.length > 0 ? (
//         <div className="games-list">
//           {gamesData.map((game) => (
//             <div key={game.sessionId} className="game-card">
//               <p>
//                 <strong>Game:</strong> {game.gameName}
//               </p>
//               <p>
//                 <strong>Score:</strong> {game.score}
//               </p>
//               <p>
//                 <strong>Mistakes:</strong> {game.mistakes}
//               </p>
//               <p>
//                 <strong>Total Time:</strong> {game.totalTime} seconds
//               </p>
//               <p>
//                 <strong>Levels:</strong> {game.startLevel} to {game.endLevel}
//               </p>
//               <p>
//                 <strong>Completed:</strong> {game.completed ? "Yes" : "No"}
//               </p>
//               <p>
//                 <strong>Session ID:</strong> {game.sessionId}
//               </p>
//               <p>
//                 <strong>Date:</strong>{" "}
//                 {new Date(game.timestamp).toLocaleString()}
//               </p>
//               <hr />
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No game progress data found for this patient.</p>
//       )}

//       <hr />

//       {/* Task Assignment Section */}
//       <h3>Assign a New Task</h3>
//       {assignMessage && <p>{assignMessage}</p>}
//       <form onSubmit={handleAssignTask} className="task-form">
//         <input
//           type="text"
//           placeholder="Task Description (e.g., Morning Walk)"
//           value={taskDescription}
//           onChange={(e) => setTaskDescription(e.target.value)}
//           required
//         />
//         <input
//           type="time"
//           value={startTime}
//           onChange={(e) => setStartTime(e.target.value)}
//           required
//         />
//         <input
//           type="time"
//           value={endTime}
//           onChange={(e) => setEndTime(e.target.value)}
//           required
//         />
//         <button type="submit">Assign Task</button>
//         <hr/>
//       </form>
//        {/* Family Member Assignment Section */}
//        <h3>Add Family Member</h3>
//        {familyMessage && <p>{familyMessage}</p>}
//        <form onSubmit={handleAddFamilyMember} className="family-form">
//          {/* Patient ID is already known (patientId from URL) */}
//          <p><strong>Patient ID:</strong> {patientId}</p>
//          <label>
//            Relation:
//            <select 
//              value={familyRelation} 
//              onChange={(e) => setFamilyRelation(e.target.value)}
//              required
//           >
//             <option value="">Select Relation</option>
//             {relationOptions.map((option, idx) => (
//               <option key={idx} value={option}>{option}</option>
//             ))}
//           </select>
//         </label>
//         <label>
//           Name:
//           <input
//             type="text"
//             placeholder="Family Member Name"
//             value={familyName}
//             onChange={(e) => setFamilyName(e.target.value)}
//             required
//           />
//         </label>
//         <label>
//           Image URL:
//           <input
//             type="text"
//             placeholder="Image URL (Optional)"
//             value={familyImageUrl}
//             onChange={(e) => setFamilyImageUrl(e.target.value)}
//           />
//         </label>
//         <button type="submit">Add Family Member</button>
//       </form>
//     </div>
//   );
// };

// export default PatientGames;
