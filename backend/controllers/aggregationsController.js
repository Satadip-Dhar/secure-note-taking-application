const mongoose = require('mongoose');
const User = require('../models/User');

exports.getUsersByInterests = async (req, res) => {
  try {
    const results = await User.aggregate([
      {
        $match: {
          interests: { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: '$interests',
      },
      {
        $group: {
          _id: '$interests',
          totalUsers: { $sum: 1 },
          users: {
            $push: {
              _id: '$_id',
              name: '$name',
              email: '$email',
              role: '$role',
            },
          },
        },
      },
      {
        $sort: {
          totalUsers: -1,
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          interest: '$_id',
          totalUsers: 1,
          users: 1,
        },
      },
    ]);

    return res.status(200).json({ data: results });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserPostsLookup = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const results = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(targetUserId),
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
          pipeline: [{ $sort: { createdAt: -1 } }],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          interests: 1,
          posts: 1,
          postCount: { $size: '$posts' },
        },
      },
    ]);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ data: results[0] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
