const User = require('../models/User');
const Note = require('../models/Note');
const Post = require('../models/Post');
const paginate = require('../utils/paginate');

exports.getUsers = async (req, res) => {
  try {
    const result = await paginate(User, {}, {
      page: req.query.page,
      limit: req.query.limit,
      sort: { _id: -1 },
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    let parsedInterests = [];
    if (Array.isArray(interests)) {
      parsedInterests = interests.map((i) => String(i).trim()).filter(Boolean);
    } else if (typeof interests === 'string') {
      parsedInterests = interests.split(',').map((i) => i.trim()).filter(Boolean);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'user',
      interests: parsedInterests,
    });

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, interests, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined && ['user', 'admin'].includes(role)) user.role = role;

    if (interests !== undefined) {
      if (Array.isArray(interests)) {
        user.interests = interests.map((i) => String(i).trim()).filter(Boolean);
      } else if (typeof interests === 'string') {
        user.interests = interests.split(',').map((i) => i.trim()).filter(Boolean);
      }
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Promise.all([
      user.deleteOne(),
      Note.deleteMany({ userId: user._id }),
      Post.deleteMany({ userId: user._id }),
    ]);

    return res.status(200).json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
