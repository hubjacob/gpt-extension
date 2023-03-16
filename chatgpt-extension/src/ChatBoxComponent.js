import './ChatBoxComponent.css';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography, styled } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

const MessageBody = styled('div')({
  paddingTop: '16px',
  display: 'flex',
  flexDirection: 'column',
  background: '#4c5f7a',
});

const LeftMessage = styled(ListItem)({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

const RightMessage = styled(ListItem)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

const LeftMessageText = styled(ListItemText)({
  backgroundColor: '#f0f0f0',
  borderRadius: '20px',
  margin: '4px',
  padding: '8px',
  maxWidth: '200px'
});

const RightMessageText = styled(ListItemText)({
  backgroundColor: '#2979ff',
  color: 'white',
  borderRadius: '20px',
  margin: '4px',
  padding: '8px',
  maxWidth: '200px'
});

export default function ChatBoxComponent({ userMessages, gptMessages }) {
  // Combine the userMessages and gptMessages arrays into a single array of objects with a "type" property
  const messages = userMessages.reduce((acc, msg, index) => {
    acc.push({ message: msg, type: "user" });
    if (gptMessages[index]) {
      acc.push({ message: gptMessages[index], type: "gpt" });
    }
    return acc;
  }, []);

  // Create a ref to the message list to enable scrolling
  const messageListRef = useRef(null);

  // Scroll to the bottom of the message list whenever a new message is added
  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages]);

  return (
    <MessageBody ref={messageListRef}>
      <List sx={{ mb: 2, flexGrow: 1, overflowY: 'auto'}}>
        {messages.map(({ message, type }, index) => (
          <React.Fragment key={index}>
            {type === "user" ? (
              <RightMessage sx={{ color: "white" }}>
                <RightMessageText
                  primary={message.primary}
                  secondary={message.secondary}
                />
                <ListItemAvatar>
                  <Avatar alt="Profile Picture" />
                </ListItemAvatar>
              </RightMessage>
            ) : (
              <LeftMessage sx={{ color: "white" }}>
                <ListItemAvatar>
                  <Avatar alt="Profile Picture" />
                </ListItemAvatar>
                <LeftMessageText
                  primary={message.primary}
                  secondary={message.secondary}
                />
              </LeftMessage>
            )}
          </React.Fragment>
        ))}
      </List>
    </MessageBody>
  );
}
