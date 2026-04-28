/**
 * Review Model Tests
 * Tests for Review schema validations and static methods
 */

const mongoose = require('mongoose');
const Review = require('../../models/Review');

describe('Review Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Review Schema Validations', () => {
        test('should create a review with valid data', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'Great company to interview with!'
            };

            const review = new Review(reviewData);
            expect(review.user).toBeDefined();
            expect(review.company).toBeDefined();
            expect(review.rating).toBe(5);
            expect(review.reviewText).toBe('Great company to interview with!');
        });

        test('should require user field', () => {
            const reviewData = {
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'Great company'
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.user).toBeDefined();
        });

        test('should require company field', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'Great company'
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.company).toBeDefined();
        });

        test('should require rating field', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                reviewText: 'Great company'
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.rating).toBeDefined();
        });

        test('should require reviewText field', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.reviewText).toBeDefined();
        });

        test('should validate rating between 0 and 5', () => {
            const validRatings = [0, 1, 2, 3, 4, 5];

            validRatings.forEach(rating => {
                const reviewData = {
                    user: new mongoose.Types.ObjectId(),
                    company: new mongoose.Types.ObjectId(),
                    rating: rating,
                    reviewText: 'Good review'
                };

                const review = new Review(reviewData);
                expect(review.rating).toBe(rating);
            });
        });

        test('should reject rating less than 0', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: -1,
                reviewText: 'Bad review'
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.rating).toBeDefined();
        });

        test('should reject rating greater than 5', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 6,
                reviewText: 'Too high rating'
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.rating).toBeDefined();
        });

        test('should require rating to be an integer', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 4.5,
                reviewText: 'Good review'
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.rating).toBeDefined();
        });

        test('should limit reviewText to 500 characters', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'a'.repeat(501)
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.reviewText).toBeDefined();
        });

        test('should accept reviewText up to 500 characters', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'a'.repeat(500)
            };

            const review = new Review(reviewData);
            expect(review.reviewText).toBe('a'.repeat(500));
        });

        test('should not allow empty or whitespace-only reviewText', () => {
            const emptyReviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: '   '
            };

            const review = new Review(emptyReviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.reviewText).toBeDefined();
        });

        test('should reject completely empty reviewText', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: ''
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.reviewText).toBeDefined();
        });

        test('should not allow future createdAt dates', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'Good review',
                createdAt: futureDate
            };

            const review = new Review(reviewData);
            const error = review.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.createdAt).toBeDefined();
        });

        test('should set createdAt to current date by default', () => {
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'Good review'
            };

            const review = new Review(reviewData);
            expect(review.createdAt).toBeDefined();
            expect(review.createdAt instanceof Date).toBe(true);
        });

        test('should accept past createdAt dates', () => {
            const pastDate = new Date(Date.now() - 86400000);
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'Good review',
                createdAt: pastDate
            };

            const review = new Review(reviewData);
            expect(review.createdAt).toEqual(pastDate);
        });
    });

    describe('Review References', () => {
        test('should reference User model', () => {
            const userId = new mongoose.Types.ObjectId();
            const reviewData = {
                user: userId,
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'Good review'
            };

            const review = new Review(reviewData);
            expect(review.user).toEqual(userId);
        });

        test('should reference Company model', () => {
            const companyId = new mongoose.Types.ObjectId();
            const reviewData = {
                user: new mongoose.Types.ObjectId(),
                company: companyId,
                rating: 5,
                reviewText: 'Good review'
            };

            const review = new Review(reviewData);
            expect(review.company).toEqual(companyId);
        });

        test('should have proper user reference path', () => {
            const userPath = Review.schema.paths.user;
            expect(userPath.options.ref).toBe('User');
        });

        test('should have proper company reference path', () => {
            const companyPath = Review.schema.paths.company;
            expect(companyPath.options.ref).toBe('Company');
        });
    });

    describe('Review Static Methods', () => {
        test('should have getAverageRating static method', () => {
            expect(typeof Review.getAverageRating).toBe('function');
        });
    });

    describe('getAverageRating', () => {
        afterEach(() => jest.restoreAllMocks());

        test('should update company with computed average when reviews exist', async () => {
            const companyId = new mongoose.Types.ObjectId();
            const mockUpdate = jest.fn().mockResolvedValue({});

            jest.spyOn(Review, 'aggregate').mockResolvedValue([{
                _id: companyId,
                ratingAverage: 4,
                reviewCount: 3
            }]);
            jest.spyOn(Review, 'model').mockReturnValue({ findByIdAndUpdate: mockUpdate });

            await Review.getAverageRating(companyId);

            expect(mockUpdate).toHaveBeenCalledWith(companyId, {
                ratingAverage: 4,
                reviewCount: 3
            });
        });

        test('should reset company rating to 0 when no reviews exist', async () => {
            const companyId = new mongoose.Types.ObjectId();
            const mockUpdate = jest.fn().mockResolvedValue({});

            jest.spyOn(Review, 'aggregate').mockResolvedValue([]);
            jest.spyOn(Review, 'model').mockReturnValue({ findByIdAndUpdate: mockUpdate });

            await Review.getAverageRating(companyId);

            expect(mockUpdate).toHaveBeenCalledWith(companyId, {
                ratingAverage: 0,
                reviewCount: 0
            });
        });

        test('should catch and log error if company update fails', async () => {
            const companyId = new mongoose.Types.ObjectId();

            jest.spyOn(Review, 'aggregate').mockResolvedValue([{
                _id: companyId,
                ratingAverage: 3,
                reviewCount: 1
            }]);
            jest.spyOn(Review, 'model').mockReturnValue({
                findByIdAndUpdate: jest.fn().mockRejectedValue(new Error('DB error'))
            });
            jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(Review.getAverageRating(companyId)).resolves.toBeUndefined();
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Review Post Hooks', () => {
        afterEach(() => jest.restoreAllMocks());

        test('should expose schema post method', () => {
            expect(typeof Review.schema.post).toBe('function');
        });

        test('should expose schema hook storage for post middleware', () => {
            expect(Review.schema.s).toBeDefined();
            expect(Review.schema.s.hooks).toBeDefined();
            expect(Review.schema.s.hooks._posts).toBeInstanceOf(Map);
            expect(Review.schema.s.hooks._posts.has('save')).toBe(true);
        });

        test('should call getAverageRating in post-save hook', () => {
            const companyId = new mongoose.Types.ObjectId();
            const mockDoc = new Review({
                user: new mongoose.Types.ObjectId(),
                company: companyId,
                rating: 5,
                reviewText: 'Great!'
            });

            jest.spyOn(mockDoc.constructor, 'getAverageRating').mockResolvedValue();

            // Read hook from Kareem's _posts map (reliable after model compile)
            const hooks = Review.schema.s.hooks._posts.get('save');
            const fn = hooks[0].fn;
            fn.call(mockDoc);

            expect(mockDoc.constructor.getAverageRating).toHaveBeenCalledWith(companyId);
        });

        test('should call getAverageRating in post-deleteOne hook', () => {
            const companyId = new mongoose.Types.ObjectId();
            const mockDoc = new Review({
                user: new mongoose.Types.ObjectId(),
                company: companyId,
                rating: 4,
                reviewText: 'Good company'
            });

            jest.spyOn(mockDoc.constructor, 'getAverageRating').mockResolvedValue();

            const hooks = Review.schema.s.hooks._posts.get('deleteOne');
            const fn = hooks[0].fn;
            fn.call(mockDoc);

            expect(mockDoc.constructor.getAverageRating).toHaveBeenCalledWith(companyId);
        });

        test('should call getAverageRating in post-findOneAnd hook when doc exists', async () => {
            const companyId = new mongoose.Types.ObjectId();
            const mockDoc = {
                company: companyId,
                constructor: { getAverageRating: jest.fn().mockResolvedValue() }
            };

            // Iterate _posts to find the RegExp key
            let fn;
            for (const [key, hooks] of Review.schema.s.hooks._posts.entries()) {
                if (key instanceof RegExp) {
                    fn = hooks[0].fn;
                    break;
                }
            }

            await fn(mockDoc);

            expect(mockDoc.constructor.getAverageRating).toHaveBeenCalledWith(companyId);
        });

        test('should skip getAverageRating in post-findOneAnd hook when doc is null', async () => {
            let fn;
            for (const [key, hooks] of Review.schema.s.hooks._posts.entries()) {
                if (key instanceof RegExp) {
                    fn = hooks[0].fn;
                    break;
                }
            }

            await expect(fn(null)).resolves.toBeUndefined();
        });
    });

    describe('Rating Validation Edge Cases', () => {
        test('should accept all valid integer ratings', () => {
            for (let rating = 0; rating <= 5; rating++) {
                const reviewData = {
                    user: new mongoose.Types.ObjectId(),
                    company: new mongoose.Types.ObjectId(),
                    rating: rating,
                    reviewText: `Review with rating ${rating}`
                };

                const review = new Review(reviewData);
                expect(review.rating).toBe(rating);
            }
        });

        test('should handle boundary values for review text length', () => {
            const reviewData1 = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'A'
            };

            const review1 = new Review(reviewData1);
            expect(review1.reviewText).toBe('A');

            const reviewData2 = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                rating: 5,
                reviewText: 'a'.repeat(500)
            };

            const review2 = new Review(reviewData2);
            expect(review2.reviewText).toHaveLength(500);
        });
        
        test('should skip getAverageRating if doc has no company in post-findOneAnd hook', async () => {
            let fn;

            for (const [key, hooks] of Review.schema.s.hooks._posts.entries()) {
                if (key instanceof RegExp) {
                    fn = hooks[0].fn;
                    break;
                }
            }

            const mockDoc = {
            company: null,
            constructor: { getAverageRating: jest.fn() }
            };

            await fn(mockDoc);

            expect(mockDoc.constructor.getAverageRating).not.toHaveBeenCalled();
        });
    });
});