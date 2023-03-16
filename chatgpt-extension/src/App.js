import './App.css';
import { Paper, TextField, Typography, Button, styled } from '@mui/material';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import React, { useState } from 'react';
import ChatComponent from './ChatBoxComponent';
import axios from 'axios';

  const AppContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    width: '500px',
    height: '600px',
    backgroundColor: '#4c5f7a'
  });

  const ChatContainer = styled('div')({
    flexGrow: 1,
  });

  const Header = styled(Typography)({
    variant: "h5",
    textAlign: 'center',
    color: 'white'
  })

  const Footer = styled(Paper)({
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#393e6f',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 0,
    padding: '8px',
  });

  const InputContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  })

  const FooterButton = styled(Button)({
    backgroundColor: '#321d2f',
    variant: 'contained',
  });

  const TextInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
      '& fieldset': { 
        borderColor: '3d2e4f',
      },
      '&:hover fieldset': {
        borderColor: 'rgb(25, 118, 210)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'rgb(25, 118, 210)',
      },
    },
  })



export default function App() {
  const chrome = window.chrome;
  const [input, setInput] = useState('');
  const [userMessages, setUserMessages] = useState([]);
  const [gptMessages, setGPTMessages] = useState([]);

  function sendInput(){
    console.log(userMessages)
    setUserMessages([
      ...userMessages,
      { id: userMessages.length + 1, primary: 'User', secondary: input },
    ]);
  }

  function sendImage(){
    setUserMessages([
      ...userMessages,
      { id: userMessages.length + 1, primary: 'User', secondary: 'Image sent to GPT!' },
    ]);
  }

  async function handleStringOutput() {
    try {
      const question = input;
      setInput('');
      const response = await axios.post('http://localhost:3000/ask/text', { data: question });
      console.log('App.js -> Input sent successfully!', response.data);
      setGPTMessages([
        ...gptMessages,
        { id: gptMessages.length + 1, primary: 'GPT', secondary: response.data },
      ]);

    } catch (error) {
      console.error('App.js -> Error sending input', error);
    }
  }

  async function handleUpload() {
    try {

      chrome.runtime.sendMessage({ action: 'minimizeWindow' });
      console.log("App.js -> Sending message to background.js")
      
      // Send a message to the content script to request a screenshot
      const screenshotUrl = await chrome.runtime.sendMessage({ action: 'takeScreenshot' });
      // Resolve the Promise with the screenshotUrl
      console.log('App.js -> Screenshot taken:', {screenshotUrl});

      // Send HTTP POST request to server-side endpoint
      const requestBody = { image: screenshotUrl };
      const response = await axios.post('http://localhost:3000/ask/image', requestBody);

      console.log('App.js -> Image sent successfully!', response.data);

      setGPTMessages([
        ...gptMessages,
        { id: gptMessages.length + 1, primary: 'GPT', secondary: response.data },
      ]);
      
    } catch (error) {
      console.error('App.js -> Error in handleUpload function:', error);
    }
  }

  return (
    <AppContainer>
      <ChatContainer>
        <Header> Capture for GPT! </Header>
        <ChatComponent userMessages={userMessages} gptMessages={gptMessages}></ChatComponent>
      </ChatContainer>
      <Footer elevation={3}>
        <InputContainer>
          <TextInput size="small" label='Input' sx={{ input: { color: 'white' } }} value={input} onChange={(e) => setInput(e.target.value)}></TextInput>
          <FooterButton size="large" onClick={() => {sendInput(); handleStringOutput();}} endIcon={<SendIcon />}>Send</FooterButton>
        </InputContainer>
        <FooterButton size="large" onClick={() => {sendImage(); handleUpload();}} endIcon={<CameraIcon />}>Screenshot</FooterButton>
      </Footer>
    </AppContainer>
  );
}
