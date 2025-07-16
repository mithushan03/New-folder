const express = require('express');
const router = express.Router();
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todos');

router.route('/').get(getTodos).post(createTodo);
router.route('/:id').put(updateTodo).delete(deleteTodo);

module.exports = router;