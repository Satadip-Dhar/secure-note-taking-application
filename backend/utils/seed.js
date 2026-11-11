require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Note = require('../models/Note');
const Post = require('../models/Post');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes_app';
    await mongoose.connect(mongoUri);

    await Promise.all([
      User.deleteMany({}),
      Note.deleteMany({}),
      Post.deleteMany({}),
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      interests: ['chess', 'reading', 'travel'],
    });

    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      role: 'user',
      interests: ['chess', 'coding', 'music'],
    });

    const bob = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123',
      role: 'user',
      interests: ['reading', 'hiking', 'gaming'],
    });

    const charlie = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'password123',
      role: 'user',
      interests: ['coding', 'chess'],
    });

    await Note.create([
      { title: 'Project Roadmap', content: 'Complete MongoDB interview task and indexing.', userId: admin._id },
      { title: 'System Architecture Notes', content: 'Microservices with separate Docker containers.', userId: admin._id },
      { title: 'Alice Daily Note', content: 'Review pull requests and optimize queries.', userId: alice._id },
      { title: 'Book List', content: 'Design Data-Intensive Applications by Martin Kleppmann.', userId: alice._id },
      { title: 'Grocery List', content: 'Apples, almond milk, coffee beans, dark chocolate.', userId: bob._id },
      { title: 'Weekend Plans', content: 'Hiking trail in national park.', userId: bob._id },
      { title: 'Algorithm Practice', content: 'Solve 3 graph traversal problems on LeetCode.', userId: charlie._id },
    ]);

    await Post.create([
      { title: 'Welcome to the platform', content: 'This is an open community post visible to all authenticated users.', userId: admin._id },
      { title: 'MongoDB Indexing Tips', content: 'Always keep compound index field order in mind: Equality, Sort, Range (ESR rule).', userId: alice._id },
      { title: 'Aggregation Pipelines', content: '$lookup operates efficiently when the foreignField is properly indexed.', userId: alice._id },
      { title: 'Best Outdoor Trails', content: 'Sharing my top 5 hiking trails for anyone interested.', userId: bob._id },
      { title: 'JavaScript Engine Internals', content: 'Deep dive into V8 JIT compilation and event loop mechanics.', userId: charlie._id },
    ]);

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
