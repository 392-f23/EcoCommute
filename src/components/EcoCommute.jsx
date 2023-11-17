import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EcoCommute.css";
import { Button, Card } from "react-bootstrap";
import ImageDisplay from "./GetImage";
import ProfileForm from "./ProfileForm";
import { getDatabase, ref as dbRef, push, onValue } from "firebase/database"; // Realtime Database imports
import Navigation from "./Navigation";
import { BrowserRouter } from "react-router-dom";

import { db, useAuthState }  from "../utilities/firebase";
import SearchBar from "./SearchBar";
import { Person, Calendar3, InfoCircle } from 'react-bootstrap-icons';

const EcoCommute = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [user, signInWithGoogle] = useAuthState();

  useEffect(() => {
    const db = getDatabase();
    const profilesRef = dbRef(db, "profiles");

    const unsubscribe = onValue(profilesRef, (snapshot) => {
      const profilesData = snapshot.val();
      const profilesArray = profilesData ? Object.keys(profilesData).map(key => ({ ...profilesData[key], id: key })) : [];
      setData(profilesArray);
      setFilteredData(profilesArray);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

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

  return (
    <div className={`${!user ? "not-logged-in" : "logged-in"}`}>
      <BrowserRouter>
        {user ? (
          // User is logged in
          data.some(((profile) => profile.email === user.email) || hasProfile) ? (
            // User has a profile in the database
            <>
              <div className="logged">
                <Navigation />
              </div>
              <h1 className="top-heading">EcoCommute</h1>{" "}
              <SearchBar onSearch={onSearch} />
              <div className="cards-container">
                {filteredData.map((person, index) => (
                  console.log("Person data: ", person),
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
                                <Card.Text>ℹ️ Additional Notes: {person.additionalNotes}</Card.Text>
                            </div>
                            <a href={`mailto:${person.email}`} className="contact-button-link">
                              <Button variant="primary" className="contact-button">Contact</Button>
                          </a>
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
    </div>
  );
};

export default EcoCommute;
