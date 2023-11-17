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
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Event Name</Form.Label>
          <Form.Control value={eventName} placeholder="e.g. grocery run..." required type="text" onChange={handleEventNameChange}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Mode of transportation</Form.Label>
          <Form.Control value={modeOfTransportation} placeholder="SUV, Sedan, ..." required type="text" onChange={handleModeOfTransportationChange}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Max number of people</Form.Label>
          <Form.Control value={maxNumberOfPeople} required type="number" min="1" onChange={handleMaxNumberOfPeopleChange}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Datetime</Form.Label>
          <Form.Control required type="date" value={date} onChange={handleDateChange}/>
          <Form.Control required type="time"  value={time} onChange={handleTimeChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Recurring</Form.Label>
          <Form.Control
                  value={recurring}
                  onChange={handleRecurringChange}
                  as="select"
                  // value={field.level}
                  // onChange={(e) => handleSkillsHaveChange(index, 'level', e.target.value)}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
            </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Additional Notes</Form.Label>
          <Form.Control value={additionalNotes} placeholder="e.g., may have dog hair" type="text" onChange={handleAdditionalNotesChange}/>
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Profile Picture</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} accept=".jpg,.jpeg,.png" />
        </Form.Group>

        <Button type="submit">Create Profile</Button>
      </Form>
    </div>
  );
};

export default ProfileForm;
