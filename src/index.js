const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => {
    return user.username === username;
  });

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;
  next();
}

function toDoExists(user, toDoID) {
  const toDo = user.todos.find(todo => {
    return todo.id === toDoID;
  });

  return toDo || false; 
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.some(user => { return user.username === username;});

  if (usernameExists) {
    return response.status(400).json({ error: "Username already exists" });
  }
  
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);
  
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const toDo = toDoExists(user, id);
  
  if(!toDo) {
    return response.status(404).json({ error: "toDo not found!" });
  }
  
  toDo.title = title;
  toDo.deadline = deadline;

  return response.json(toDo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const toDo = toDoExists(user, id);

  if(!toDo) {
    return response.status(404).json({ error: "toDo not found!" });
  }

  toDo.done = !toDo.done;

  return response.json(toDo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const toDo = toDoExists(user, id);

  if(!toDo) {
    return response.status(404).json({ error: "toDo not found!" });
  }

  const findIndex = user.todos.findIndex(todo => {
    return todo.id === id;
  });

  user.todos.splice(findIndex, 1);

  return response.status(204).send();
  
});

module.exports = app;