
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const { DateTime } = require('luxon');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ical = require('ical-generator');
const { log } = require('console');
dotenv.config({ path: '/.env' });
    require('dotenv').config();
console.log(typeof (ical));


app.use(cors())



app.use(bodyParser.urlencoded({ extended: false }));
app.use('/asset', express.static(path.join(__dirname, 'asset')))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const mongo_URI = 'mongodb+srv://SAC:G8BO4x3rWEDFSYqk@cluster0.btu1pyt.mongodb.net/microsite';

mongoose.connect(mongo_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(result => {
        console.log('Connected to the MongoDB database');
    })
    .catch(error => {
        console.error('Error connecting to the MongoDB database:', error);
    });

const dataSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    phone: String,
    company: String,
    designation: String,
    submissionTime: String,
});



const Data = mongoose.model('Data', dataSchema);

console.log('database data', Data);


app.post('/send-email', (req, res) => {
    const { firstname,lastname, email, phone, company, designation } = req.body;

    const submissionTime = DateTime.now().setZone('Asia/Kolkata').toISO();

    const newData = new Data({
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: phone,
        company: company,
        designation: designation,
        submissionTime: submissionTime,
    });
    // res.sendFile(path.join(__dirname, 'display.html'));
    console.log('data going for mongodb', newData);

    newData.save()
        .then(() => {
            console.log('Data saved to MongoDB');
        })
        .catch((err) => {
            console.error('Error saving data to MongoDB:', err);
        });

    const cal = new ical.ICalCalendar();

    cal.createEvent({
        start: new Date(),
        end: new Date(new Date().getTime() + 3600000),
        summary: 'Meeting Invitation',
        description: 'This is a meeting invitation.',
        organizer: 'Qualcomm <yourcompany@example.com>',
        location: 'Meeting Location',
    });

    const icsContent = cal.toString();

    const icsBuffer = Buffer.from(icsContent, 'utf-8');

    console.log('iCalendar Content as Buffer:', icsBuffer);

    var transporter = nodemailer.createTransport({
        host: 'smtpout.secureserver.net',
        // service: 'Godaddy',
        // secureConnection: false,
        secure: true,
        port: 465,
        auth: {
            user: 'info@event-reg.in',
            pass: "xb/YQN.G5MC/Ya_"

        }
    });
    console.log(email);
    var mailOptions = {
        from: 'info@event-reg.in',
        to: 'rohitstories1@gmail.com',

        subject: 'Meeting Invitation',
        text: `Hello,\n\nThank you for reaching out to us. We have received your contact information:\nEmail: ${email}\nPhone: ${phone}\n\nBest regards,\nYour Company`,
        attachments: [
            {
                filename: 'invite.ics',
                content: icsBuffer,
                contentType: 'text/calendar; method=REQUEST',
            },
        ],
    };

    // Send the thank you email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.send('Error sending email.');
        } else {
            console.log('Email sent: ' + info.response);
            // res.send('Thank you for contacting us! Check your email for confirmation.');
            res.sendFile(path.join(__dirname, 'display.html'));
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});  