import React, { useState } from 'react';
import "../../styles/GroupsPage.css";

export default function InvitationCard({ invitation, onAccept, onDecline }) {

  
  const handleAccept = () => {
console.log("Accept");

  };
  
  const handleDecline = () => {
console.log("Decline");

  };
  


  return (
    <div 
      className={`invitation-card`}

    >    
      <div className="invitation-card-content">
        <div className="invitation-header">
          <div className="invitation-avatar">
            
              <img src={invitation.avatar} alt={invitation.sender} />

          </div>
          <div className="invitation-requester">
            <h4 className="invitation-sender">@{invitation.sender}</h4>
            <span className="invitation-label">{invitation.created_at || "2 hours ago"}</span>
          </div>
        </div>
        
        <div className="invitation-group-info">
          <h3 className="invitation-title">{invitation.name}</h3>
          
            <p className="invitation-group">{`${invitation.group} (${invitation.total_members || 2} members)`}</p>

        </div>

        
        <div className="invitation-actions">
          <button
            className={`invitation-accept-btn`}
            onClick={handleAccept}
          >
            Accept
          </button>
          <button
            className={`invitation-decline-btn`}
            onClick={handleDecline}

          >

              Decline
            
          </button>
        </div>
      </div>
    </div>
  );
}