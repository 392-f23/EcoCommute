import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import './ProfileForm.css';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ProfileForm = ({ onProfileSubmit, user }) => {

  const [eventName, setEventName] = useState('');
  const [modeOfTransportation, setModeOfTransportation] = useState('');
  const [maxNumberOfPeople, setMaxNumberOfPeople] = useState('');
  const [datetime, setDatetime] = useState('');
  const [recurring, setRecurring] = useState('');
  const [notes, setNotes] = useState('');


  const [imageFile, setImageFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    if (file && allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setImageFile(file);
    } else {
      alert('Please upload a .jpg, .jpeg, or .png file.');
    }
  };

  // const handleSkillsHaveChange = (index, field, value) => {
  //   const newSkillsHaveFields = [...skillsHaveFields];
  //   newSkillsHaveFields[index][field] = value;
  //   setSkillsHaveFields(newSkillsHaveFields);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = user.displayName;
    const email = user.email;
    let imageUrl = user.photoURL; // default to the user's current photo URL

    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, 'profileImages/' + imageFile.name);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      try {
        await uploadTask;
        imageUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    onProfileSubmit({
      name,
      eventName,
      modeOfTransportation,
      maxNumberOfPeople,
      datetime,
      recurring,
      notes,
      image: imageUrl,
      email
    });

    setEventName('');
    setModeOfTransportation('');
    setMaxNumberOfPeople('');
    setDatetime('');
    setRecurring('');
    setNotes('');
    setImageFile(null);
  };

  return (
    <div className='profileForm'>
     <Form onSubmit={handleSubmit} className="custom-form">
       <Form.Group className="form-group">
         <Form.Label>Event Name</Form.Label>
         <Form.Control className="form-control" placeholder="e.g., grocery run" required type="text" />
       </Form.Group>
       <Form.Group className="form-group-horizontal">
            <Form.Label className="form-label-horizontal">Car Type:</Form.Label>
            <Form.Control className="form-control" as="select">
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
         <Form.Control className="form-control" as="select">
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
            <Form.Control className="form-control datetime-control" required type="date" />
            <Form.Control className="form-control datetime-control" required type="time" />
        </div>
    </Form.Group>
       <Form.Group className="form-group-horizontal">
            <Form.Label className="form-label-horizontal">Recurring:</Form.Label>
            <Form.Control className="form-control" as="select">
                <option value="no">No</option>
                <option value="yes">Yes</option>
            </Form.Control>
        </Form.Group>

       <Form.Group className="form-group">
         <Form.Label>Additional Notes</Form.Label>
         <Form.Control className="form-control" placeholder="e.g., may have dog hair" type="text" />
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
