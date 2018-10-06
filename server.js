const express = require('express');
const bodyparser = require('body-parser');

const env = process.env.NODE_ENV || 'development';
const configure = require('./knexfile')[env];
const database = require('knex')(configure);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.get('/api/v1/projects', (request, response) => {
  database('projects')
    .then(projects => response.status(200).json(projects))
    .catch(err => {
      response.status(500).json({ err });
    });
});

app.get('/api/v1/projects/:id', (request, response) => {
  database('projects')
    .where('id', request.params.id)
    .then(project => {
      project.length
        ? response.status(200).json(project)
        : response.status(404).send({ error: 'Project does not exist' });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/palettes', (request, response) => {
  database('palettes')
    .then(palette => {
      response.status(200).json(palette);
    })
    .catch(err => console.log(err));
});

app.get('/api/v1/palettes/:id/projects', (request, response) => {
  database('palettes')
    .where('project_id', request.params.id)
    .then(palette => {
      palette.length
        ? response.status(200).json(palette)
        : response.status(404).send({ error: 'project does not exist' });
    })
    .catch(err => console.log(err));
});

app.post('/api/v1/projects', (request, response) => {
  const project = request.body;
  database('projects')
    .insert(project, 'id')
    .then(project => {
      response.status(201).json({ id: project[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/palettes', (request, response) => {
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

  paletteKeys.forEach(param => {
    if (!newPalette[param]) {
      return response.status(422).send('error');
    }
  });

  database('palettes')
    .insert(newPalette, 'id')
    .then(palette => {
      response.status(201).json({ id: palette[0], ...newPalette });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.delete('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params;

  database('palettes')
    .where('id', id)
    .del()
    .then(result => {
      return result
        ? response.status(200).json({
            result: `${result} was deleted`
          })
        : response.status(404).json({ error: `${result} was not deleted` });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.listen(port, () => {
  console.log('server is listening on 3000');
});
