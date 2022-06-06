const fs = require('fs');
const express = require('express');
const database = require('../Data/database/db_connection');
const recommender = require('../Data/recommender/recommenderApi');
const geocoder = require('../Data/geocoder/geocodeApi')
const { PythonShell } = require('python-shell');
const crypto = require('crypto');
const hash = crypto.createHash('sha512');
const conn = JSON.parse(fs.readFileSync('connections.json'));
const recommenderService = new PythonShell('../Data/recommender/recommender.py');
const geocoderService = new PythonShell('../Data/geocoder/geocoder.py');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');

var ratingsSize = 0;
var userActivityLogSizes = {};

async function refreshPredMatrix(currentNumberOfRatings) {
  if (ratingsSize * 1.05 < currentNumberOfRatings) {
    database.fetchDataForCF();
    ratingsSize = currentNumberOfRatings;
  }
}

async function refreshUserModel(uid, currentUserModelSize) {
  if (!userActivityLogSizes[uid] || userActivityLogSizes[uid] * 1.05 < currentUserModelSize) {
    database.fetchDataForNN(uid);
    userActivityLogSizes[uid] = currentUserModelSize;
  }
}

recommenderService.on('message', (message) => {
  console.log('Recommender: ' + message);
});

geocoderService.on('message', (message) => {
  console.log('Geocoder: ' + message);
});

app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './images');
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  let msg = 'AppServer is listening';
  res.status(200).send(msg);
  console.log(msg);
});

app.get('/geocode', (req, res) => {
  geocoder.geocode(req.query.address).then((result) => res.send(result));
});

app.get('/geocodeReverse', (req, res) => {
  geocoder.reverse(req.query.latitude, req.query.longitude)
    .then((result) => { res.send(result) });
});

app.post('/imageUpload', upload.array('photo', 3), (req, res) => {
  res.status(200).json({
    message: 'success!',
  });
});

/** USERS */

app.post('/createUser', (req, res) => {
  newUser = {
    username: req.body.username,
    password: hash.update(req.body.password, 'utf-8').digest('hex'),
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    images: req.body.images, // first image is the profile picture
    bio: req.body.bio,
    city: req.body.city,
    state: req.body.state,
    phone: req.body.phone,
    email: req.body.email,
    facebook: req.body.facebook,
    twitter: req.body.twitter,
    linkedin: req.body.linkedin,
    github: req.body.github,
    lastGeo: req.body.lastGeo,
    school: req.body.school,
    collage: req.body.collage,
    interests: req.body.interests, // for CF, contains objects of {"interestId": interestId, "rating:" rate}
    activityLog: [], // for NN, contains objects of {"activity": eventObj, "label": label}
    initiatedActivities: [],
    managedActivities: [],
    participantedActivities: [],
    suspension: false,
    creationTime: Date()
  };
  database.createUser(newUser).then((result) => res.send(result));
});

app.post('/editUser', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/changePassword', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/login', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/updateLastLocation', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addInterestToUser', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeInterestToUser', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/updateActivityLog', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/updateInitiatedActivities', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addManagedActivity', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeManagedActivity', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/suspendUser', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/releaseUser', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.get('/getUser', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.get('/deleteUser', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

/** ACTIVITIES */

app.post('/createTest', (req, res) => {
  console.log(req.query)
  console.log(req.body)
  res.send('Success');
});

app.post('/createActivity', (req, res) => {
  newActivity = {
    title: req.body.title,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    recurrent: req.body.recurrent,
    location: req.body.location,
    description: req.body.description,
    interests: req.body.interests,
    preconditions: req.body.preconditions,
    initiator: req.body.initiator,
    managers: req.body.managers,
    participants: req.body.participants,
    images: req.body.images,
    qrCode: req.body.qr,
    tags: req.body.tags,
    status: req.body.status,
    creationTime: Date()
  };
  let result = database.createNewActivity(newActivity);
  res.send(result);
});

app.post('/editActivity', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addInterestToActivity', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeInterestToActivity', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addPreconditionToActivity', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removePreconditionToActivity', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addActivityManager', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeActivityManager', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addParticipant', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeParticipant', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/generateActivityQRCode', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.get('/getActivity', (req, res) => {
  let aid = req.query.activity_id;
  database.getActivityById(aid).then((event) => res.send(event));
});

app.get('/searchActivity', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
  // let keyword = req.query.keyword;
  // database.searchActivity(keyword).then((eventList) => res.send(eventList));
});

app.get('/getAllActivities', (req, res) => {

  database.getAllActivities().then((activities) => { res.send(activities) });
});

/** GROUPS */

app.post('/createGroup', (req, res) => {
  newGroup = {
    title: req.body.title,
    description: req.body.description,
    commonInterests: req.body.commonInterests,
    preconditions: req.body.preconditions,
    initiator: req.body.initiator,
    managers: req.body.managers,
    participants: req.body.participants,
    images: req.body.images,
    qrCode: req.body.qrCode,
    activityHistory: [],
    creationTime: Date()
  };
  let result = database.createGroup(newGroup);
  res.send(result);
});

app.post('/editGroup', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addCommonInterest', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeCommonInterest', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addGroupPrecondition', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeGroupPrecondition', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addGroupManager', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeGroupManager', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addParticipants', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/removeParticipants', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/addGroupActivityHistory', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

app.post('/generateGroupQRCode', (req, res) => {
  console.log('NOT YET IMPLEMENTED.');
});

/** RECOMMENDATIONS */

app.get('/getInterestPrediction', (req, res) => {
  let uid = req.query.userId;
  let k = req.query.k;
  let userbased = req.query.userbased;
  recommender.predict_cf(uid, k, userbased).then((topk) => res.send(topk));
});

app.get('/getActivityPrediction', (req, res) => {
  let userId = req.query.userId;
  let interestId = req.query.interestId;
  console.log('NOT YET IMPLEMENTED.');
  // let test = req.query.test; // test should hold all activities that their interests list contains the given interest.
  // recommender.predict_nn(uid, test).then((topk) => res.send(topk));
});

app.listen(conn.App.port, () => console.log('AppServer is up!'));
