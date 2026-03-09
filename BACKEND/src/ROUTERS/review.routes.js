import { Router } from 'express';

import {
    createReview,
    getReviews,
    updateReview,
    deleteReview
} from '../CONTROLLERS/reviews.controllers.js';

const router = Router();

// router to create a new review

router.route('/createReview').post(createReview);

// router to get reviews for a specific service

router.route('/service/:serviceId/reviews').get(getReviews);

// router to update a review

router.route('/updateReview/:reviewId').put(updateReview);

// router to delete a review

router.route('/deleteReview/:reviewId').delete(deleteReview);

export default router;