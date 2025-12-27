let express = require('express'),
    router = express.Router(),
    maintenanceRequestMiddleware = require('../middleware/maintenanceRequest'),
    indexMiddleware = require('../middleware/index');

router.get('/', indexMiddleware.verifyToken, maintenanceRequestMiddleware.getAllRequests);
router.get('/my-requests', indexMiddleware.verifyToken, maintenanceRequestMiddleware.getMyRequests);
router.get('/assigned-to-me', indexMiddleware.verifyToken, maintenanceRequestMiddleware.getAssignedRequests);
router.get('/dashboard-stats', indexMiddleware.verifyToken, maintenanceRequestMiddleware.getDashboardStats);
router.get('/:id', indexMiddleware.verifyToken, maintenanceRequestMiddleware.getRequestById);
router.post('/', indexMiddleware.verifyToken, maintenanceRequestMiddleware.createRequest);
router.put('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), maintenanceRequestMiddleware.updateRequest);
router.put('/:id/stage', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), maintenanceRequestMiddleware.updateRequestStage);
router.put('/:id/assign', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), maintenanceRequestMiddleware.assignRequest);
router.delete('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN']), maintenanceRequestMiddleware.deleteRequest);

module.exports = router;