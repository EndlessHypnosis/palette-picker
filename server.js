// TODO: have a comment on every line
const express = require('express');
const app = express();
const bodyParser = require('body-parser');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Secret Box';

app.locals.messages = {
  foo: 'bar',
  baz: 'bam',
  qui: 'bur'
};

app.get('/api/messages', (request, response) => {
  response.status(200).json(app.locals.messages)
});

app.get('/api/messages/:id', (request, response) => {

  // if (app.locals.messages[request.params.id]) {
  //   response.json({
  //     id: request.params.id,
  //     value: app.locals.messages[request.params.id]
  //   });
  // } else {
  //   response.status(404).send();
  // }

  // OR (better logic)

  const { id } = request.params;
  const message = app.locals.messages[id];

  if (!message) {
    // the return here is only used to escape the function so we dont have to use else
    return response.sendStatus(404);
  }

  response.status(200).json({ id, message });

});

app.post('/api/messages', (request, response) => {

  const id = Date.now();
  const { message } = request.body;

  app.locals.messages[id] = message;

  response.status(201).json({ id, message }) // 201 is successful post request

});

app.put('/api/messages/:id', (request, response) => {

  const { id } = request.params;
  const localMessage = app.locals.messages[id];
  const requestMessage = request.body.message;

  if (!localMessage) {
    return response.sendStatus(404);
  }

  if (!requestMessage) {
    // 422 is user error
    return response.status(422).json({
      error: 'Missing required parameter: message'
    })
  }

  app.locals.messages[id] = requestMessage;
  // 204 might be more appropriate status code,
  // but can you return the object back?
  response.status(200).json({ id, requestMessage })

});

app.delete('/api/messages/:id', (request, response) => {

  const { id } = request.params;
  const localMessage = app.locals.messages[id];

  if (!localMessage) {
    return response.sendStatus(404);
  }

  delete app.locals.messages[id];
  response.sendStatus(200); // maybe 204

})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});