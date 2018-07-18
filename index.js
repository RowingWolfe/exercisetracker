const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const moment = require('moment');

//Conf
const app = express();
const PORT = 3000;

//DB
mongoose.connect(process.env.MONGO_URI, () => {
    console.log('Connected to MongoDB');
});
const db = mongoose.connection;
const exerciseSchema = mongoose.Schema({
    username: String,
    pin: Number,
    exerciseArr: [],
});
const Exercise = mongoose.model('Exercise', exerciseSchema);

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes
app.get('/', (req, res, next) => {
    const form = `
    <h2>Log hours</h2>
    <form action="/add" method="POST">
        <label> Username:
            <input type="text" name="username">
        </label>
        <label> Pin:
            <input type="text" name="pin">
        </label>
        <label> Exercise name:
            <input type="text" name="exercisename">
        </label>
        <label> Time exercised in minutes:
            <input type="text" name="timeinminutes">
        </label>
        <button>Submit</button>
    </form>
    <p>Accounts are automatically created.</p>
    `;
    res.send(form);
});

//Add exercise data to user
app.post('/add', (req, res, next) =>{
    //Send form data.
    //Check if user exists. if not, create user.
    //If user exists, check the pin against the form data.
    //If pin is correct log the data to the db.
    //Destructure please.
    const {username, pin, exercisename, timeinminutes} = req.body;

    if(username && pin && exercisename && timeinminutes){
        Exercise.findOne({'username': username},(err, data) => {
            if(err){console.log('ERROR: '+err)}
            if(data){
                if(data.pin === parseInt(pin)){
                    //Update exerciseArr.
                    let newExerciseToLog = {exercisename, timeinminutes, 'added': moment().format("dddd, MMM DD, YYYY @ HH:mm")};
                    data.exerciseArr.push(newExerciseToLog);
                    data.save();

                    res.send(data.exerciseArr);
                }else{
                    res.send('Wrong Pin, mateyboy.');
                    console.log('dbdata',data);
                }
            }else{
                //Create new User with pin, then add exercise.
                let exerciseArr = [{exercisename, timeinminutes, 'added': moment().format("dddd, MMM DD, YYYY @ HH:mm")}]
                let newUser = new Exercise({username, pin, exerciseArr});
                newUser.save();
                res.send(`<div>
                            <p>New user created: <strong>${username}</strong>, your pin is <strong>${pin}</strong>.</p>
                            <p>Added a new exercise record: ${exerciseArr[0].exercisename} for ${exerciseArr[0].timeinminutes} minutes.</p>
                            <p><a href="/">Back to form...</a></p>
                        </div>`);
            }
        });
    }else{
        res.send('Nah, man. You didn\'t fill out the form right.')
    }
    console.log(req.body);
});



//Start server
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});
