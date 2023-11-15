import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EcoCommute.css";
import { Button, Card } from "react-bootstrap";
import ImageDisplay from "./GetImage";
import ProfileForm from "./ProfileForm";
import { fetchDataArray } from "../utilities/fetch_data";
import { collection, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import Navigation from "./Navigation";
import { BrowserRouter } from "react-router-dom";
import { db, useAuthState }  from "../utilities/firebase";
import SearchBar from "./SearchBar";
import { Person, Calendar3, InfoCircle } from 'react-bootstrap-icons';

const EcoCommute = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [user, signInWithGoogle] = useAuthState();

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

  // using useEffect like this calls fetchData() once rather than repeatedly!!!
  // apparently useEffect doesn't allow async requests unless it's done this way
  // any alternatives?
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetchDataArray() => [{data}] (from fetch_data.js)
        const result = await fetchDataArray(db);
        setData(result);
        setFilteredData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // data follows this format:
  // [
  //   user0: {
  //     email: str
  //     image: str (URL of image in storage)
  //     name: str
  //     skills-have: str[]
  //     skills-want: str[]
  //   },
  //   user1: {...},
  //   user2: {...}
  // ]

  const handleProfileSubmit = async (profile) => {
    try {
      await addProfileToDB(profile);
      // Refresh the data after adding a new profile
      const result = await fetchDataArray(db);
      setData(result);
    } catch (error) {
      console.error("Error adding profile:", error);
    }
  };

  const addProfileToDB = async (profile) => {
    try {
      // Reference to the specific document "AAAAAAAA" in the "users" collection
      const userDocRef = doc(db, "users", "AAAAAAAA");

      // Retrieve the current data from the "AAAAAAAA" document
      const docSnap = await getDoc(userDocRef);

      let nextUserNumber = 0;
      if (docSnap.exists()) {
        // Determine the next available user number
        const currentData = docSnap.data();
        const userNumbers = Object.keys(currentData)
          .filter((key) => key.startsWith("user"))
          .map((key) => parseInt(key.replace("user", ""), 10));

        if (userNumbers.length > 0) {
          const highestUserNumber = Math.max(...userNumbers);
          nextUserNumber = highestUserNumber + 1;
        }
      }

      // Construct the new user key and image name
      const newUserKey = `user${nextUserNumber}`;
      console.log("profile", profile);
      // Add or update the user in the "AAAAAAAA" document
      await setDoc(userDocRef, { [newUserKey]: profile }, { merge: true });

      console.log("Profile added successfully!");
    } catch (error) {
      console.error("Error adding profile to DB:", error);
      throw error; // Re-throw the error so it can be caught in handleProfileSubmit
    }
  };

  return (
    <div className={`${!user ? "not-logged-in" : "logged-in"}`}>
      <BrowserRouter>
        {user ? (
          // User is logged in
          data.some((profile) => profile.email === user.email) ? (
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
                                <Card.Text>🎯 Go to work</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>🚗 SUV</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>👥 5</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>🗓️ 11/10/23</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>⏰ 8:15 am</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>🔄 Yes</Card.Text>
                            </div>
                            <div className="text-container">
                                <Card.Text>ℹ️ May have dog hair. Non smoking</Card.Text>
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
