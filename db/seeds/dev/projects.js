exports.seed = (knex, Promise) => {
  return knex('palettes')
    .del()
    .then(() => knex('projects').del())
    .then(() => {
      return Promise.all([
        knex('projects')
          .insert([{ title: 'Darkness' }, { title: 'Lightness' }], 'id')
          .then(project => {
            return knex('palettes').insert([
              {
                project_id: project[0],
                title: 'bluish',
                color_one: '#133760',
                color_two: '#6152A2',
                color_three: '#79A8D7',
                color_four: '#A8C3C8',
                color_five: '#FCE5A3'
              },
              {
                project_id: project[0],
                title: 'blackish',
                color_one: '#1r3760',
                color_two: '#6152A2',
                color_three: '#79A8D7',
                color_four: '#A8C3C8',
                color_five: '#FCE5A3'
              },
              {
                project_id: project[1],
                title: 'baby teal',
                color_one: '#469A30',
                color_two: '#BDD5AC',
                color_three: '#314C1C',
                color_four: '#FCE5A3',
                color_five: '#7FA4AE'
              }
            ]);
          })
          .then(() => console.log('completed'))
          .catch(error => console.log(error))
      ]);
    })
    .catch(error => console.log(error));
};
