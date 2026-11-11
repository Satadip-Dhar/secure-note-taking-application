const express = require('express');
const router = express.Router();
const aggregationsController = require('../controllers/aggregationsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/users-by-interests', aggregationsController.getUsersByInterests);
router.get('/users/:userId/posts', aggregationsController.getUserPostsLookup);
router.get('/my-posts', aggregationsController.getUserPostsLookup);

module.exports = router;
