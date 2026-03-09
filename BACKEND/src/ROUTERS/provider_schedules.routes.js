import { Router } from 'express';

import {
    createSchedule,
    getSchedule,
    updateSchedule,
    deleteSchedule
}   from '../CONTROLLERS/provider_schedules.controller.js';

const router = Router();

// Route to create a provider schedule

router.route('/createSchedule').post(createSchedule);

// Route to get a provider schedule by provider ID

router.route('/getSchedule/:providerId').get(getSchedule);

// Route to update a provider schedule

router.route('/updateSchedule').put(updateSchedule);

// Route to delete a provider schedule

router.route('/deleteSchedule').delete(deleteSchedule);

export default router;