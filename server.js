const express = require('express');
const bodyparser = require('body-parser');
const yargs = require('yargs');

const env = process.env.NODE_ENV || 'development';
const configure = require('./knexfile')[env];
const database = require('knex')(configure);

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
app.get('/api/v1/projects', (request, response) => {
  database
    .raw('select * from projects')
    .then(function(projects) {
      res.send(projects.rows);
    })
    .catch(function(err) {
      console.log(err);
    });

  database('projects')
    .select()
    .then(projects => {
      console.log(json(projects));
    });
});

// app.get('/api/v1/projects/:id', (request, response) => {
//   database.
// })

app.post({});

//listening for any requests on port 3000
app.listen(port, () => {
  console.log('server is listening on 3000');
});
