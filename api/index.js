const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..','public', 'frontend')));
app.use('/assets', express.static(path.join(__dirname, '..', 'public','assets')));
console.log('ASSETS PATH:', path.join(__dirname, '..', 'public','assets'));

// 1. Connection String using the .env variable
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
    .then(() => console.log("✅ Successfully connected to MongoDB"))
    .catch(err => console.log("❌ Connection Error:", err));

// 2. Schema & Model
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: String, 
        default: () => new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })

    },
    status: { type: String, default: 'pending' }
    
});

app.patch('/api/admin/messages/:id/done', async (req, res) => {
    try {
        await Contact.findByIdAndUpdate(req.params.id, { status: 'completed' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

const Contact = mongoose.model('Contact', contactSchema,'contact-form');

// 3. Home Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','public', 'frontend', 'index.html'));
});

// 4. API Route to save
app.post('/api/contact', async (req, res) => {
  // console.log("BODY RECEIVED:", req.body);
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ success: true, message: "Data stored!" });
    } catch (err) {
        console.error("Detailed Server Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/dormrp', (req, res) => {
    res.sendFile(path.join(__dirname, '..','admin.html'));
});

// This fetches all messages from MongoDB and sends them to the page
app.get('/api/admin/messages', async (req, res) => {
    try {
        // .sort({ _id: -1 }) puts the newest messages at the top
        const messages = await Contact.find().sort({ _id: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch messages" });
    }
});

app.delete('/api/admin/messages/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));