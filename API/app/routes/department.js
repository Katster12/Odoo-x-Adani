let express = require('express'),
    router = express.Router(),
    departmentMiddleware = require('../middleware/department'),
    indexMiddleware = require('../middleware/index');

router.get('/', indexMiddleware.verifyToken, departmentMiddleware.getAllDepartments);
router.get('/:id', indexMiddleware.verifyToken, departmentMiddleware.getDepartmentById);
router.post('/', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), departmentMiddleware.createDepartment);
router.put('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), departmentMiddleware.updateDepartment);
router.delete('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN']), departmentMiddleware.deleteDepartment);

module.exports = router;