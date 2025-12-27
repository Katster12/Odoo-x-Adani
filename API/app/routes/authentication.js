let express = require('express'),
    router = express.Router(),
    authMiddleware = require('../middleware/auth'),
    indexMiddleware = require('../middleware/index');

router.post('/signup', authMiddleware.signUp);
router.post('/login', authMiddleware.authToken);
router.post('/change-password', indexMiddleware.verifyToken, authMiddleware.changePassword);

module.exports = router;