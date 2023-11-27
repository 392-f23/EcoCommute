import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EcoCommute.css";
import { Button, Card } from "react-bootstrap";
import ImageDisplay from "./GetImage";
import ProfileForm from "./ProfileForm";
import { getDatabase, ref as dbRef, push, onValue, remove, update, get } from "firebase/database"; // Realtime Database imports
import Navigation from "./Navigation";
import RideRequestModal from "./RideRequestModal";
import PendingRequestsModal from "./PendingRequestModal";
import { BrowserRouter } from "react-router-dom";

import { db, useAuthState }  from "../utilities/firebase";
import SearchBar from "./SearchBar";
import { Person, Calendar3, InfoCircle } from 'react-bootstrap-icons';

const EcoCommute = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [user, signInWithGoogle] = useAuthState();
  const [userProfiles, setUserProfiles] = useState([]);
  const [currentRideId, setCurrentRideId] = useState(null);
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showPendingRequestModal, setShowPendingRequestModal] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const profilesRef = dbRef(db, "profiles");
  
    const unsubscribe = onValue(profilesRef, (snapshot) => {
      const profilesData = snapshot.val();
      const profilesArray = profilesData 
        ? Object.keys(profilesData).map(key => ({ ...profilesData[key], id: key }))
        : [];
      
      // Set user profiles
      setUserProfiles(profilesArray);
  
      // Filter non-owned 
      const nonOwnedRides = profilesArray.filter(person => person.email !== user.email);
      setData(nonOwnedRides);
      setFilteredData(nonOwnedRides);
    });
  
    return () => unsubscribe(); // Cleanup subscription
  }, [user]);


  useEffect(() => {
    if (user && user.email) {
      const db = getDatabase();
      const profilesRef = dbRef(db, "profiles");
  
      onValue(profilesRef, (snapshot) => {
        const profilesData = snapshot.val();
  
        if (profilesData) {
          const userProfileKey = Object.keys(profilesData).find(key => profilesData[key].email === user.email);
          
          if (userProfileKey) {
            const userRequestsRef = dbRef(db, `profiles/${userProfileKey}/requests`);
  
            onValue(userRequestsRef, (requestsSnapshot) => {
              const requestsData = requestsSnapshot.val();
              let incomingRequests = [];
  
              if (requestsData) {
                Object.keys(requestsData).forEach(requestId => {
                  const request = requestsData[requestId];
                  if (request.recipientEmail === user.email) {
                    incomingRequests.push({
                      id: requestId,
                      ...request
                    });
                  }
                });
              }
  
              if (incomingRequests.length > 0) {
                setPendingRequests(incomingRequests);
                setShowPendingRequestModal(true);
              } else {
                setShowPendingRequestModal(false);
              }
            });
          }
        }
      });
    }
  }, [user]);
  
  
  
  
  function onSearch(searchTerm) {
    const filteredPersons = data.filter((person) => {
      return (
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) 
        ||
        person["skills-have"].some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    });
    setFilteredData(filteredPersons);
  }

  const handleProfileSubmit = async (profile) => {
    const db = getDatabase();
    const profilesRef = dbRef(db, "profiles");
    try {
      await push(profilesRef, profile);
      alert("Profile added successfully!");
    } catch (error) {
      console.error("Error adding profile:", error);
    }
  };

  const handleRequestClick = (rideId) => {
    setShowSendRequestModal(true);
    setCurrentRideId(rideId); // Set the current ride ID in state
  };

  const handleCloseModal = () => {
    setShowSendRequestModal(false);
  };  


  const handleAcceptRequest = async (rideId, requestId) => {
    try {
      const db = getDatabase();
      const profilesRef = dbRef(db, "profiles");
      let userProfileKey;

      const profilesSnapshot = await get(profilesRef);
      const profiles = profilesSnapshot.val();
      userProfileKey = Object.keys(profiles).find(key => profiles[key].email === user.email);

      if (userProfileKey) {
        const rideRef = dbRef(db, `profiles/${userProfileKey}`);
        const rideSnapshot = await get(rideRef);
        const ride = rideSnapshot.val();

        console.log('ride:', ride);

        if (ride) {
          const maxPeople = parseInt(ride.maxNumberOfPeople, 10);
          console.log('maxPeople:', maxPeople);
          if (!isNaN(maxPeople) && maxPeople > 0) {
            await update(rideRef, { maxNumberOfPeople: (maxPeople - 1).toString() });
          }
        }

        // Remove the request
        const requestRef = dbRef(db, `profiles/${userProfileKey}/requests/${requestId}`);
        await remove(requestRef);

        // Update UI (remove the request from pendingRequests state)
        setPendingRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  

  const handleDeclineRequest = async (rideId, requestId) => {
    try {
      const db = getDatabase();
      const profilesRef = dbRef(db, "profiles");
      let userProfileKey;
  
      onValue(profilesRef, (snapshot) => {
        const profiles = snapshot.val();
        userProfileKey = Object.keys(profiles).find(key => profiles[key].email === user.email);
  
        if (userProfileKey) {
          // Remove the request
          const requestRef = dbRef(db, `profiles/${userProfileKey}/rides/${rideId}/requests/${requestId}`);
          remove(requestRef);
  
          // Update UI (remove the request from pendingRequests state)
          setPendingRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        }
      });
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };
  
  

  return (
    <div className={`${!user ? "not-logged-in" : "logged-in"}`}>
      <BrowserRouter>
        {user ? (
          userProfiles.some(profile => profile.email === user.email) ? (
            // User has a profile in the database
            <>
              <div className="logged">
                <Navigation />
              </div>
              <h1 className="top-heading">EcoCommute</h1>{" "}
              <SearchBar onSearch={onSearch} />
              <div className="cards-container">
                {filteredData.map((person, index) => (
                  <div className="skill-cards-container" key={index}>
                    <div className="skill-cards" key={index}>
                      <Card style={{ width: "18rem" }} className="custom-card">
                        <Card.Img variant="top" src={person.image} className="card-img" />
                          <Card.Body>
                            <Card.Title>{person.name}</Card.Title>
                            <div className="text-container">
                                <Card.Text>🎯 Event Name: {person.eventName} </Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>🚗 Mode of Transportation: {person.modeOfTransportation}</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>👥 Max Number of People: {person.maxNumberOfPeople}</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>🗓️ Date and Time: {person.dateTime}</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>🔄 Recurring: {person.recurring === 'yes' ? 'Yes' : 'No'}</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>ℹ️ Additional Notes: {person.additionalNotes} </Card.Text>
                            </div>
                            <a href={`mailto:${person.email}`} className="contact-button-link">
                              <Button variant="primary" className="contact-button">Contact</Button>
                            </a>
                            <Button variant="primary" onClick={() => handleRequestClick(person.id)}>
                              Request to Join
                            </Button>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // User doesn't have a profile in the database
            <>
              <div className="logged">
                <Navigation />
              </div>
              <h1>EcoCommute</h1>
              <ProfileForm onProfileSubmit={handleProfileSubmit} user={user} />
            </>
          )
        ) : (
          // User is not logged in
          <div className="centered-content">
            <h1>EcoCommute</h1>
            <Navigation />
          </div>
        )}
      </BrowserRouter>
      <RideRequestModal
        show={showSendRequestModal}
        handleClose={handleCloseModal}
        rideId={currentRideId}
        user={user}
      />
      {showPendingRequestModal && (
        <PendingRequestsModal
          show={showPendingRequestModal}
          requests={pendingRequests}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          onClose={() => setShowPendingRequestModal(false)}
        />
      )}
    </div>
  );
};

export default EcoCommute;
