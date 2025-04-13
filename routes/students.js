const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const { sendMessage } = require('../whatsapp/whatsapp');
const { scheduleMessage } = require('../whatsapp/scheduler');

// ✅ Show Registration Form
router.get('/register', (req, res) => {
    res.render('register');
});

// ✅ View a Single Student
router.get('/view/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).send('Student not found');
        res.render('viewStudent', { student });
    } catch (error) {
        console.error("❌ Error fetching student:", error);
        res.status(500).send('Error fetching student details');
    }
});

// ✅ Delete Student Completely
router.post('/delete/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send('Student not found');
        }

        await Student.findByIdAndDelete(req.params.id);
        console.log(`🗑️ Deleted Student: ${student.name} (ID: ${req.params.id})`);

        res.redirect('/students/records'); // ✅ This also updates Fees Management automatically
    } catch (error) {
        console.error("❌ Error deleting student:", error);
        res.status(500).send('Error deleting student');
    }
});

// ✅ Show All Registered Students
router.get('/records', async (req, res) => {
    try {
        const students = await Student.find();
        res.render('records', { students });
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).send('Error fetching student records');
    }
});

// ✅ Handle Student Registration
router.post('/register', async (req, res) => {
    console.log("📩 Received Registration Request:", req.body);

    const { name, phone, email, course, courseFees, paidFees, reminderDate, reminderTime } = req.body;

    try {
        if (!name || !phone || !email || !courseFees || !paidFees) {
            console.log("❌ Missing required fields");
            return res.status(400).send("All fields are required.");
        }

        // ✅ Check if the email already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            console.log("⚠️ Student with this email already exists:", email);
            return res.status(400).send("This email is already registered. Please use a different email.");
        }

        const remainingFees = courseFees - paidFees;

        const newStudent = new Student({
            name,
            phone,
            email,
            course: course || "Not Provided",
            courseFees: courseFees || 0,
            paidFees: paidFees || 0,
            reminderDate: reminderDate || null,
            reminderTime: reminderTime || null,
            remainingFees
        });

        await newStudent.save();

        console.log("✅ Student Registered Successfully!");

        // ✅ Redirect after successful student creation
        res.redirect('/students/records');

        // ✅ Send WhatsApp Messages (Non-blocking)
        sendMessage(phone, `✅ Registration Successful! Welcome, ${name}.`);
        if (paidFees > 0) {
            sendMessage(phone, `💰 Fees Paid: ₹${paidFees}`);
        }

    } catch (error) {
        console.error("❌ Error registering student:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Fees Management Page
router.get('/fees-management', async (req, res) => {
    try {
        const students = await Student.find();
        res.render('feesManagement', { students });
    } catch (error) {
        res.status(500).send('Error fetching student records');
    }
});

// ✅ Update Fees Without Sending WhatsApp Message
router.post('/update-fees/:id', async (req, res) => {
    try {
        const { paidFees } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).send('Student not found');

        student.paidFees = paidFees;
        student.remainingFees = student.courseFees - paidFees;
        await student.save();

        res.json({ success: true, remainingFees: student.remainingFees });
    } catch (error) {
        console.error("❌ Error updating fees:", error);
        res.status(500).send('Error updating fees');
    }
});

// ✅ Schedule Reminder for Pending Fees
router.post('/schedule-reminder', async (req, res) => {
    try {
        const { reminderDate, reminderTime } = req.body;

        if (!reminderDate || !reminderTime) {
            return res.json({ success: false, message: 'Reminder date and time are required.' });
        }

        const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
        if (isNaN(reminderDateTime.getTime())) {
            return res.json({ success: false, message: 'Invalid date/time format' });
        }

        // Fetch students with remaining fees > 0
        const students = await Student.find({ remainingFees: { $gt: 0 } });

        if (students.length === 0) {
            return res.json({ success: false, message: 'No students with pending fees.' });
        }

        // Loop through students and schedule messages for each one
        students.forEach(student => {
            const message = `📢 Reminder: Your remaining fees of ₹${student.remainingFees} are pending!`;
            scheduleMessage(student.phone, message, reminderDate, reminderTime);
        });

        res.json({ success: true, message: "All reminders scheduled successfully!" });

    } catch (error) {
        console.error("❌ Error scheduling reminders:", error);
        res.status(500).json({ success: false, message: 'Error scheduling reminders' });
    }
});

module.exports = router;
