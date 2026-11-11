const Note = require('../models/Note');
const paginate = require('../utils/paginate');

exports.getNotes = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'admin') {
      if (req.query.userId) {
        filter.userId = req.query.userId;
      }
    } else {
      filter.userId = req.user._id;
    }

    const sort = filter.userId ? { createdAt: -1 } : { _id: -1 };

    const result = await paginate(Note, filter, {
      page: req.query.page,
      limit: req.query.limit,
      sort,
      populate: { path: 'userId', select: 'name email' },
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('userId', 'name email');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isOwner = note.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    return res.status(200).json({ note });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const note = await Note.create({
      title,
      content,
      userId: req.user._id,
    });

    const populatedNote = await note.populate('userId', 'name email');

    return res.status(201).json({ note: populatedNote });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isOwner = note.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();

    const populatedNote = await note.populate('userId', 'name email');

    return res.status(200).json({ note: populatedNote });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isOwner = note.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    await note.deleteOne();

    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
