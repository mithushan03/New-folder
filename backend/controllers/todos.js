const Todo = require('../models/Todo');

// @desc    Get all todos
// @route   GET /api/v1/todos
// @access  Public
exports.getTodos = async (req, res, next) => {
  try {
    const { search, category, status, start_date, end_date } = req.query;
    const query = { status: { $ne: 'Completed' } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = { $in: status.split(',') };
    }

    if (start_date && end_date) {
      query.modifiedAt = { $gte: new Date(start_date), $lte: new Date(end_date) };
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Todo.countDocuments(query);

    const todos = await Todo.find(query).skip(startIndex).limit(limit);

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: todos.length,
      pagination,
      data: todos,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new todo
// @route   POST /api/v1/todos
// @access  Public
exports.createTodo = async (req, res, next) => {
  console.log("Request body:", req.body);
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({
      success: true,
      data: todo,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update todo
// @route   PUT /api/v1/todos/:id
// @access  Public
exports.updateTodo = async (req, res, next) => {
  try {
    req.body.modifiedAt = Date.now();
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!todo) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete todo
// @route   DELETE /api/v1/todos/:id
// @access  Public
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};