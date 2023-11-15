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
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Event Name</Form.Label>
          <Form.Control placeholder="e.g., grocery run" required type="text" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Mode of transportation</Form.Label>
          <Form.Control placeholder="SUV, Sedan, ..." required type="text" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Max number of people</Form.Label>
          <Form.Control required type="number" min="1"/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Datetime</Form.Label>
          <Form.Control required type="date" />
          <Form.Control required type="time" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Recurring</Form.Label>
          <Form.Control
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
          <Form.Control placeholder="e.g., may have dog hair" type="text" />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Profile Picture</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} accept=".jpg,.jpeg,.png" />
        </Form.Group>

        <Button type="submit">Create Profile</Button>
      </Form>

          {/* {skillsHaveFields.map((field, index) => (
            <div className="row">
              <div key={index} className="input-skills-have">
                <div className="col-7">
                <Form.Control
                  required
                  type="text"
                  value={field.skill}
                  onChange={(e) => handleSkillsHaveChange(index, 'skill', e.target.value)}
                />
                </div>
                <div className="col">
                <Form.Control
                  as="select"
                  value={field.level}
                  onChange={(e) => handleSkillsHaveChange(index, 'level', e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Form.Control>
                </div>
                <Button variant="danger" className="remove-skills-button" onClick={() => removeSkillsHaveField(index)}>-</Button>
              </div>
            </div>
          ))} 
          <Button variant="success" className="add-skills-button" onClick={addSkillsHaveField}>+ Add Skill</Button>
          </Form.Group> */}    
{/* 
        <Form.Group>
          <Form.Label>Card Color</Form.Label>
          <Form.Control required type="color" />
        </Form.Group>     */}

        
    </div>
  );
};

export default ProfileForm;
