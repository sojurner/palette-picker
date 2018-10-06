//requiring to pull in express library
const express = require('express');
// enables express server to parse the content of body of http requests
const bodyparser = require('body-parser');
//setting the env variable to the NODE_env or development
const env = process.env.NODE_ENV || 'development';
const configure = require('./knexfile')[env];
const database = require('knex')(configure);
//instantiating express method
const app = express();
//setting port variable to the env.PORT or 3000
const port = process.env.PORT || 3000;
//aactivates the body parser imported above
app.use(bodyparser.json());
//sets urlencoded properted extended to true by default
app.use(bodyparser.urlencoded({ extended: true }));
//server access to the public folder which contains client files
app.use(express.static(__dirname + '/public'));

//setting endpoint to project get request
app.get('/api/v1/projects', (request, response) => {
  //accessing the projects table from db
  database('projects')
    // if successful return projects array
    .then(projects => response.status(200).json(projects))
    // catch block for unsuccessful response
    .catch(err => {
      //throws an internal server error
      response.status(500).json({ err });
    });
});
//setting endpoint to for specific project by id
app.get('/api/v1/projects/:id', (request, response) => {
  //accessing the projects table
  database('projects')
    //specifying the column of id and the row that matches the id of the params of the request
    .where('id', request.params.id)
    //resolution block
    .then(project => {
      //conditional to see if the project exists, if so return the project object if not return error msg
      project.length
        ? response.status(200).json(project)
        : response.status(404).send({ error: 'Project does not exist' });
    })
    //catch block if request was rejected
    .catch(error => {
      response.status(500).json({ error });
    });
});
//endpoint for all palettes
app.get('/api/v1/palettes', (request, response) => {
  //accessing palettes table from db
  database('palettes')
    .then(palette => {
      //returning palette array if request was successfully fulfilled
      response.status(200).json(palette);
    })
    //catch block if request was rejected
    .catch(err => console.log(err));
});
//setting endpoint to palette by the id
app.get('/api/v1/palettes/:id/projects', (request, response) => {
  //accesing palettes table from db
  database('palettes')
    //locating the project_id column and the row that matches the id sent by the request params
    .where('project_id', request.params.id)
    //resolution block if request was successfully resolved
    .then(palette => {
      //checking if the palette exists.  if it does return the palette object, if not return error message
      palette.length
        ? response.status(200).json(palette)
        : response.status(404).send({ error: 'project does not exist' });
    })
    //catch block if request was rejected
    .catch(err => console.log(err));
});
//post request to insert new project
app.post('/api/v1/projects', (request, response) => {
  //setting variable to the value of the requests body
  const project = request.body;
  //accessing the projects table from the db
  database('projects')
    //inserting the request body into the row of the projects table and requesting id
    .insert(project, 'id')
    //resolution block if request was successful
    .then(project => {
      //returns the the project object with the new unique id
      response.status(201).json({ id: project[0] });
    })
    //catch block if request was rejected
    .catch(error => {
      //throws internal server error
      response.status(500).json({ error });
    });
});
//post request to insert new palette
app.post('/api/v1/palettes', (request, response) => {
  //the requests body and an array of the required params
  const newPalette = request.body;
  const paletteKeys = [
    'project_id',
    'title',
    'color_one',
    'color_two',
    'color_three',
    'color_four',
    'color_five'
  ];
  //to iterating through params array the checking if the palette has all required params
  paletteKeys.forEach(param => {
    //if the requests body does not have the param property
    if (!newPalette[param]) {
      //throw unprocessable entity error for missing param
      return response.status(422).send('error');
    }
  });
  //access the palettes table from db
  database('palettes')
    //inserting a new row for the new palette and giving it a unique id
    .insert(newPalette, 'id')
    //resolution block if request was successfully resolved
    .then(palette => {
      //return the palette object with new id
      response.status(201).json({ id: palette[0], ...newPalette });
    })
    //catch block if request was rejected
    .catch(error => {
      //return internal server error msg
      response.status(500).json({ error });
    });
});
//delete request endpoint to delete specific palette by id
app.delete('/api/v1/palettes/:id', (request, response) => {
  //destucturing the id of the request param
  const { id } = request.params;
  //access the palettes table from db
  database('palettes')
    //dive into the column of id and the row that matches the id of the request params
    .where('id', id)
    //deleting entire row that matches the above
    .del()
    //success block if request was resolved
    .then(result => {
      // if palette existed return msg specifiying which palette was deleted, if not return error message
      return result
        ? response.status(200).json({
            result: `${result} was deleted`
          })
        : response.status(404).json({ error: `${result} was not deleted` });
    })
    //catch block if request was rejected
    .catch(error => {
      //throw internal server error
      response.status(500).json({ error });
    });
});

//listening for any requests on port 3000
app.listen(port, () => {
  console.log('server is listening on 3000');
});
