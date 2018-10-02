const express = require('express');
const bodyparser = require('body-parser');
const yargs = require('yargs');

const environment = process.env.NODE_ENV || 'production';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// app//   describe: 'Title of Project', // const optionsTitle = {
//   demand: true,
//   alias: 't'
// };

// const optionsBody = {
//   describe: 'Body of note',
//   demand: true,
//   alias: 'b'
// };

//converts any JSON to an Object

//setting up a route to main page
app.get('/', (request, response) => {
  console.log(request.body);
  // response.render('index');
  console.log(process);
});

app.get('/');

//listening for any requests on pory 3000
app.listen(port, () => {
  console.log('server is listening on 3000');
});
