let express = require('express'),
    router = express.Router(),
    maintenanceTeamMiddleware = require('../middleware/maintenanceTeam'),
    indexMiddleware = require('../middleware/index');

router.get('/', indexMiddleware.verifyToken, maintenanceTeamMiddleware.getAllTeams);
router.get('/:id', indexMiddleware.verifyToken, maintenanceTeamMiddleware.getTeamById);
router.post('/', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), maintenanceTeamMiddleware.createTeam);
router.put('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), maintenanceTeamMiddleware.updateTeam);
router.delete('/:id', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN']), maintenanceTeamMiddleware.deleteTeam);
router.post('/:id/members', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), maintenanceTeamMiddleware.addTeamMember);
router.put('/:id/members/:memberId', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), maintenanceTeamMiddleware.updateTeamMember);
router.delete('/:id/members/:memberId', indexMiddleware.verifyToken, indexMiddleware.checkRole(['ADMIN', 'TECHNICIAN']), maintenanceTeamMiddleware.removeTeamMember);

module.exports = router;