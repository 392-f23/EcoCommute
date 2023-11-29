import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const PendingRequestsModal = ({ show, onClose, requests, onAccept, onDecline }) => {
console.log('PendingRequestsModal requests:', requests);
console.log('show:', show);
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Pending Ride Requests</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {requests.length > 0 ? (
          <ListGroup>
            {requests.map(request => (
              <ListGroup.Item key={request.id}>
                <div><strong>From:</strong> {request.email}</div>
                <div><strong>Note:</strong> {request.note}</div>
                <Button 
                  variant="success" 
                  onClick={() => onAccept(request.rideId, request.id)}
                  className="mr-2"
                >
                  Accept
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => onDecline(request.rideId, request.id)}
                >
                  Decline
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div>No pending requests.</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PendingRequestsModal;
