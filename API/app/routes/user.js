let express = require('express'),
    router = express.Router(),
    userMiddleware = require('../middleware/user'),
    indexMiddleware = require('../middleware/index');

router.get('/me', indexMiddleware.verifyToken, userMiddleware.currentUser);
router.get('/', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN']), userMiddleware.getAllUsers);
router.get('/:id', indexMiddleware.verifyToken, userMiddleware.getUserById);
router.put('/me', indexMiddleware.verifyToken, userMiddleware.updateUser);
router.put('/:id/role', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN']), userMiddleware.updateUserRole);
router.delete('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN']), userMiddleware.deleteUser);

module.exports = router;