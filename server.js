require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/student_grading", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Student Schema
const studentSchema = new mongoose.Schema({
  rollNo: { type: Number, unique: true, required: true },
  studentName: { type: String, required: true },
  marks: { type: Object, required: true }, // Marks stored as { "Math": 90, "Science": 85 }
});

const Student = mongoose.model("Student", studentSchema);

// Subject Schema
const subjectSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
});

const Subject = mongoose.model("Subject", subjectSchema);

// Student API Routes
app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/students', async (req, res) => {
    const { rollNo, studentName, marks } = req.body;

    try {
        let student = await Student.findOne({ rollNo });

        if (student) {
            // Update existing student
            student.studentName = studentName;
            student.marks = marks;
            await student.save();
            res.json(student);
        } else {
            // Create a new student
            student = new Student({ rollNo, studentName, marks });
            await student.save();
            res.status(201).json(student);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/students/:rollNo', async (req, res) => {
    const { studentName, marks } = req.body;

    try {
        let student = await Student.findOneAndUpdate(
            { rollNo: req.params.rollNo },
            { studentName, marks },
            { new: true }
        );

        if (!student) return res.status(404).json({ message: "Student not found" });

        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete("/students/:rollNo", async (req, res) => {
  try {
    await Student.findOneAndDelete({ rollNo: req.params.rollNo });
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subject API Routes
app.get("/subjects", async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
});

app.post("/subjects", async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/subjects/:name", async (req, res) => {
  try {
    await Subject.findOneAndDelete({ name: req.params.name });
    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
