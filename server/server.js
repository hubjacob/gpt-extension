require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');
const os = require('os');
const Jimp = require('jimp');
const Tesseract = require('tesseract.js');

const port = 3000;
const app = express();
const multer  = require('multer');
// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

// Things I want on every route of my server.
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');

// View of the main server
app.get('/', (req, res) => {
    res.render('index')
})

async function askGpt(question) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: question}],
  });

  return completion.data.choices[0].message;
}

app.post('/ask/text', async (req, res) => {
    const question = req.body.data;
    console.log('Question: ', question);

    const response = await askGpt(question);
    console.log('Response: ', response);

    res.send(response.content);
});

// Define a route for handling the image upload
app.post('/ask/image', async (req, res) => {
    try {

      //Loading image from the extension
      const base64Image = req.body.image;
      console.log(base64Image);
      console.log(typeof base64Image);      
      
      // Convert the base64-encoded image to a Buffer
      const buffer = Buffer.from(base64Image, 'base64');
      
      // Use Jimp to load the image from the buffer
      const image = await Jimp.read(buffer);
      
      const filename = Date.now().toString() + '.png';
      // Write the image to a temporary PNG file
      const tempFilePath = path.join(os.tmpdir(), filename);
      await image.writeAsync(tempFilePath);

  
      // TODO: Determine how to parse the image into text (find a library that does that)
      // Use Tesseract to extract the text from the image
      
      const worker = await Tesseract.createWorker();
      await worker.loadLanguage('fra+eng');
      await worker.initialize('fra+eng');
      const { data: { text } } = await worker.recognize(tempFilePath);
      console.log('Question: ', text);

  
      const response = await askGpt(text);
      console.log('Response: ', response);
  
      // res.send(response);
      res.send('Text extracted from image:' + response.content);

      await worker.terminate();
    } catch (error) {
      console.error('Error handling image upload:', error);
      res.status(500).send('Error handling image upload');
    }
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
