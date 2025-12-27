let express = require('express'),
    router = express.Router(),
    equipmentMiddleware = require('../middleware/equipment'),
    indexMiddleware = require('../middleware/index');

router.get('/', indexMiddleware.verifyToken, equipmentMiddleware.getAllEquipment);
router.get('/categories', indexMiddleware.verifyToken, equipmentMiddleware.getEquipmentCategories);
router.get('/by-team/:teamId', indexMiddleware.verifyToken, equipmentMiddleware.getEquipmentByTeam);
router.get('/by-technician/:technicianId', indexMiddleware.verifyToken, equipmentMiddleware.getEquipmentByTechnician);
router.get('/:id', indexMiddleware.verifyToken, equipmentMiddleware.getEquipmentById);
router.post('/', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), equipmentMiddleware.createEquipment);
router.put('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), equipmentMiddleware.updateEquipment);
router.put('/:id/assign-team', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), equipmentMiddleware.assignTeam);
router.put('/:id/assign-technician', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), equipmentMiddleware.assignTechnician);
router.delete('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN']), equipmentMiddleware.deleteEquipment);

module.exports = router;