let express = require('express'),
    router = express.Router();

let authRoutes = require('./authentication');
let userRoutes = require('./user');
let departmentRoutes = require('./department');
let equipmentRoutes = require('./equipment');
let maintenanceRequestRoutes = require('./maintenanceRequest');
let maintenanceTeamRoutes = require('./maintenanceTeam');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/maintenance-requests', maintenanceRequestRoutes);
router.use('/maintenance-teams', maintenanceTeamRoutes);

module.exports = router;