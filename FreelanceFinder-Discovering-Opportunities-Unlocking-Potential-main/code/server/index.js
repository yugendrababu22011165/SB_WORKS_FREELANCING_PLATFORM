// index.js
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';  // dotenv import
import { Server } from 'socket.io';
import http from 'http';
import SocketHandler from './SocketHandler.js';
import { Application, Chat, Freelancer, Project, User } from './Schema.js';

// --------------------- DOTENV CONFIG --------------------- //
config({ path: '.env', quiet: true }); // suppress dotenv logs

const app = express();

// --------------------- MIDDLEWARES --------------------- //
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// --------------------- HTTP SERVER + SOCKET.IO --------------------- //
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET','POST','PUT','DELETE']
  }
});

io.on("connection", (socket) => {
  console.log("User connected via Socket.io");
  SocketHandler(socket);
});

// --------------------- PORT --------------------- //
const PORT = process.env.PORT || 6001;

// --------------------- MONGODB CONNECTION --------------------- //
async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("❌ MongoDB connection error:", err.message);
    console.log("⏳ Retrying in 5 seconds...");
    setTimeout(connectMongoDB, 5000); // retry after 5 seconds
  }
}

connectMongoDB(); // initial connection attempt

// --------------------- ROUTES --------------------- //

// Register User
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, usertype } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: passwordHash, usertype });
    const user = await newUser.save();

    if (usertype === 'freelancer') {
      const newFreelancer = new Freelancer({ userId: user._id });
      await newFreelancer.save();
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Freelancer by user ID
app.get('/fetch-freelancer/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ userId: req.params.id });
    res.status(200).json(freelancer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Freelancer
app.post('/update-freelancer', async (req, res) => {
  try {
    const { freelancerId, updateSkills, description } = req.body;
    const freelancer = await Freelancer.findById(freelancerId);

    freelancer.skills = updateSkills.split(',');
    freelancer.description = description;

    await freelancer.save();
    res.status(200).json(freelancer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch single project
app.get('/fetch-project/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all projects
app.get('/fetch-projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new project
app.post('/new-project', async (req, res) => {
  try {
    const { title, description, budget, skills, clientId, clientName, clientEmail } = req.body;
    const projectSkills = skills.split(',');

    const newProject = new Project({
      title, description, budget, skills: projectSkills,
      clientId, clientName, clientEmail, postedDate: new Date()
    });

    await newProject.save();
    res.status(200).json({ message: "Project added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --------------------- SUBMIT BID --------------------- //

app.post("/api/bids", async (req, res) => {
  try {
    const { projectId, budget, time, proposal } = req.body;

    if (!projectId || !budget || !time || !proposal) {
      return res.status(400).json({ msg: "All fields required" });
    }

    // find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // create new application (bid)
    const newApplication = new Application({
      projectId,
      budget,
      time,
      proposal,
      appliedDate: new Date()
    });

    await newApplication.save();

    res.status(200).json({ message: "Bid submitted successfully ✅" });

  } catch (err) {
    console.log("Bid error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------- SERVER START --------------------- //
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});