import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { getDatabase, ref as dbRef, push, get} from "firebase/database"; // Realtime Database imports

const RideRequestModal = ({ show, handleClose, rideId, user }) => {
  const [note, setNote] = useState('');

  const submitRequest = async () => {
    console.log('Submit Request Clicked, rideId:', rideId, 'user:', user);
  
    if (!rideId || !user) return;
  
    try {
      const db = getDatabase();
  
      // Fetch the recipient's profile to get their email
      const recipientProfileRef = dbRef(db, `profiles/${rideId}`);
      const recipientProfileSnapshot = await get(recipientProfileRef);
      const recipientProfile = recipientProfileSnapshot.val();
  
      if (recipientProfile && recipientProfile.email) {
        const request = {
          userId: user.uid,        // ID of the user sending the request
          email: user.email,       // Email of the user sending the request
          note: note,
          recipientEmail: recipientProfile.email  // Email of the ride owner (recipient)
        };
  
        const requestsRef = dbRef(db, `profiles/${rideId}/requests`);
        await push(requestsRef, request);
  
        setNote(''); // Reset the note
        handleClose(); // Close the modal
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };
  

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Request to Join Ride</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={submitRequest}>
          Submit Request
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RideRequestModal;
