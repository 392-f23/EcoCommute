import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import './ProfileForm.css';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { getDatabase, ref as dbRef, push, set } from 'firebase/database'; // Import Realtime Database functions

const ProfileForm = ({ user }) => {
  const [eventName, setEventName] = useState('');
  const [modeOfTransportation, setModeOfTransportation] = useState('');
  const [maxNumberOfPeople, setMaxNumberOfPeople] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [recurring, setRecurring] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [imageFile, setImageFile] = useState(undefined);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    if (file && allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setImageFile(file);
    } else {
      alert('Please upload a .jpg, .jpeg, or .png file.');
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setDateTime(`${e.target.value} ${time}`);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
    setDateTime(`${date} ${e.target.value}`);
  };

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  }

  const handleModeOfTransportationChange = (e) => {
    setModeOfTransportation(e.target.value);
  }

  const handleMaxNumberOfPeopleChange = (e) => {
    setMaxNumberOfPeople(e.target.value);
  }

  const handleRecurringChange = (e) => {
    setRecurring(e.target.value);
  }

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const name = user.displayName;
    const email = user.email;
    let imageUrl = user.photoURL;
  
    const createAndPushProfile = () => {
      const newProfile = {
        name,
        image: imageUrl,
        email,
        eventName,
        modeOfTransportation,
        maxNumberOfPeople,
        dateTime,
        recurring,
        additionalNotes,
      };
  
      const db = getDatabase();
      const profilesRef = dbRef(db, 'profiles/');
      push(profilesRef, newProfile);
  
      setEventName('');
      setModeOfTransportation('');
      setMaxNumberOfPeople('');
      setDateTime('');
      setRecurring('');
      setAdditionalNotes('');
      setImageFile(undefined);
    };
  
    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, 'profileImages/' + imageFile.name);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
    
      uploadTask.on(
        'state_changed', 
        (snapshot) => {
          // Handle progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          // Handle unsuccessful uploads
          console.error("Error uploading image:", error);
        }, 
        () => {
          // Handle successful uploads on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            imageUrl = downloadURL;
            createAndPushProfile();
          });
        }
      );
      
    } else {
      // If no image file, proceed to create and push profile
      createAndPushProfile();
    }
  };

  return (
    <div className='profileForm'>
     <Form onSubmit={handleSubmit} className="custom-form">
       <Form.Group className="form-group">
         <Form.Label>Event Name</Form.Label>
         <Form.Control value = {eventName} onChange={handleEventNameChange} className="form-control" placeholder="e.g., grocery run" required type="text" />
       </Form.Group>
       <Form.Group className="form-group-horizontal">
            <Form.Label className="form-label-horizontal">Car Type:</Form.Label>
            <Form.Control value={modeOfTransportation} onChange={handleModeOfTransportationChange} className="form-control" as="select">
                <option value="hatchback">Hatchback</option>
                <option value="sedan">Sedan</option>
                <option value="coupe">Coupe</option>
                <option value="crossover">Crossover</option>
                <option value="suv">SUV</option>
                <option value="minivan">Minivan</option>
                <option value="minivan">Pickup</option>
                <option value="bus">Bus</option>
            </Form.Control>
        </Form.Group>
       <Form.Group className="form-group-horizontal">
         <Form.Label className="form-label-horizontal">Seats</Form.Label>
         <Form.Control value={maxNumberOfPeople} onChange={handleMaxNumberOfPeopleChange} className="form-control" as="select">
                <option value="1"> 1</option>
                <option value="2">2</option>
                <option value="2">3</option>
                <option value="2">4</option>
                <option value="2">5</option>
                <option value="2">6</option>
                <option value="2">7</option>
                <option value="2">8</option>
            </Form.Control>
       </Form.Group>
       <Form.Group className="form-group-horizontal">
          <Form.Label className="form-label-horizontal">Datetime:</Form.Label>
              <div className="datetime-controls">
                  <Form.Control required type="date" value={date} onChange={handleDateChange}/>
                  <Form.Control required type="time"  value={time} onChange={handleTimeChange} />
              </div>
        </Form.Group>
       <Form.Group className="form-group-horizontal">
            <Form.Label className="form-label-horizontal">Recurring:</Form.Label>
            <Form.Control value={recurring} onChange={handleRecurringChange} className="form-control" as="select">
                <option value="no">No</option>
                <option value="yes">Yes</option>
            </Form.Control>
        </Form.Group>

       <Form.Group className="form-group">
         <Form.Label>Additional Notes</Form.Label>
         <Form.Control value={additionalNotes} onChange={handleAdditionalNotesChange} className="form-control" placeholder="e.g., may have dog hair" type="text" />
       </Form.Group>
       <Form.Group className="form-group">
         <Form.Label>Profile Picture</Form.Label>
         <Form.Control className="form-control" type="file" onChange={handleFileChange} accept=".jpg,.jpeg,.png" />
       </Form.Group>

       <Button className="submit-button" type="submit">Create Profile</Button>
     </Form>
  </div>
  );
};

export default ProfileForm;
