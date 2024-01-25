import React from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Message = ({ message }) => {
    const [user] = useAuthState(auth);

    return (
        <div
            className={`chat-bubble ${message.uid === user.uid ? "right" : ""}`}>
            <div style={{ alignItems: 'center', justifyContent: 'center' }} className="chat-bubble__right">
                <p style={{ marginLeft: '80%' }} className="user-name">{message.name}</p>
                <div style={{ width: '90%', backgroundColor: 'gray', marginLeft: '5%', marginRight: '5%', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '5px' }}>
                    <p className="user-message">{message.text}</p>
                </div>
            </div>
        </div>
    );
};
export default Message;