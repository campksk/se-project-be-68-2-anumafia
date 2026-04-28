/**
 * Interview Controller Tests
 * Tests for getInterviewSessions, getInterviewSession, addInterviewSession, 
 * updateInterviewSession, deleteInterviewSession, updateAttendanceStatus
 */

const interviewController = require('../../controllers/interview');
const Interview = require('../../models/Interview');
const Company = require('../../models/Company');

jest.mock('../../models/Interview');
jest.mock('../../models/Company');

const createPopulateChain = (result, reject = false) => {
    const chain = {
        populate: jest.fn().mockReturnThis(),
        then(onFulfilled, onRejected) {
            return reject
                ? Promise.reject(result).then(onFulfilled, onRejected)
                : Promise.resolve(result).then(onFulfilled, onRejected);
        }
    };
    return chain;
};

describe('Interview Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            params: {},
            user: { id: 'user123', role: 'user' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('Get Interview Sessions', () => {
        test('should get user interview sessions', async () => {
            const mockInterviews = [
                {
                    _id: 'interview1',
                    user: 'user123',
                    company: { name: 'Company 1' }
                }
            ];

            Interview.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockInterviews)
            });

            await interviewController.getInterviewSessions(req, res, next);

            expect(Interview.find).toHaveBeenCalledWith({ user: 'user123' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                data: mockInterviews
            });
        });

        test('should get company interviews', async () => {
            req.user = { id: 'company123', role: 'company' };
            req.params.companyid = 'comp123';

            const mockCompany = {
                _id: 'comp123',
                user: { toString: jest.fn().mockReturnValue('company123') }
            };

            const mockInterviews = [
                {
                    _id: 'interview1',
                    company: 'comp123'
                }
            ];

            Company.findById.mockResolvedValue(mockCompany);
            Interview.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockInterviews)
            });

            await interviewController.getInterviewSessions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should get all interviews for admin', async () => {
            req.user = { id: 'admin123', role: 'admin' };
            req.params = {};

            const mockInterviews = [
                { _id: 'interview1' }
            ];

            Interview.find.mockReturnValue(createPopulateChain(mockInterviews));

            await interviewController.getInterviewSessions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return error if company not found', async () => {
            req.user = { id: 'company123', role: 'company' };
            req.params.companyid = 'nonexistent';

            Company.findById.mockResolvedValue(null);

            await interviewController.getInterviewSessions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No company with the id of nonexistent'
            });
        });

        test('should not allow company to access other company interviews', async () => {
            req.user = { id: 'company123', role: 'company' };
            req.params.companyid = 'comp456';

            const mockCompany = {
                _id: 'comp456',
                user: { toString: jest.fn().mockReturnValue('company456') }
            };

            Company.findById.mockResolvedValue(mockCompany);

            await interviewController.getInterviewSessions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not authorized to get this company'
            });
        });

        test('should return 401 for non-admin non-user role without companyid', async () => {
            req.user = { id: 'company123', role: 'company' };
            req.params = {};

            await interviewController.getInterviewSessions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorized to access this route'
            });
        });

        test('should handle server error', async () => {
            Interview.find.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            await interviewController.getInterviewSessions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Get Interview Session', () => {
        test('should get single interview session', async () => {
            req.params.id = 'interview123';

            const mockInterview = {
                _id: 'interview123',
                user: {
                    _id: 'user123'
                },
                company: { name: 'Company 1' }
            };

            Interview.findById.mockReturnValue(createPopulateChain(mockInterview));

            await interviewController.getInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockInterview
            });
        });

        test('should not allow unauthorized user to view interview', async () => {
            req.params.id = 'interview123';

            const mockInterview = {
                _id: 'interview123',
                user: {
                    _id: 'user456'
                }
            };

            Interview.findById.mockReturnValue(createPopulateChain(mockInterview));

            await interviewController.getInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should return server error if interview not found', async () => {
            req.params.id = 'nonexistent';

            Interview.findById.mockReturnValue(createPopulateChain(null));

            await interviewController.getInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test('should handle server error', async () => {
            req.params.id = 'interview123';

            Interview.findById.mockReturnValue(createPopulateChain(new Error('Database error'), true));

            await interviewController.getInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Add Interview Session', () => {
        test('should add interview session successfully', async () => {
            req.params.companyid = 'comp123';
            req.body = {
                sessionDate: new Date(Date.now() + 86400000)
            };

            const mockCompany = {
                _id: 'comp123'
            };

            const mockInterviews = [];

            const mockNewInterview = {
                _id: 'interview123',
                company: 'comp123',
                user: 'user123'
            };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.find.mockResolvedValue(mockInterviews);
            Interview.create.mockResolvedValue(mockNewInterview);

            await interviewController.addInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockNewInterview
            });
        });

        test('should return error if company not found', async () => {
            req.params.companyid = 'nonexistent';
            req.body = { sessionDate: new Date(Date.now() + 86400000) };

            Company.findById.mockResolvedValue(null);

            await interviewController.addInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No company with the id of nonexistent'
            });
        });

        test('should limit non-admin users to 3 interviews', async () => {
            req.params.companyid = 'comp123';
            req.body = { sessionDate: new Date(Date.now() + 86400000) };
            req.user = { id: 'user123', role: 'user' };

            const mockCompany = {
                _id: 'comp123'
            };

            const mockInterviews = [
                { _id: 'int1' },
                { _id: 'int2' },
                { _id: 'int3' }
            ];

            Company.findById.mockResolvedValue(mockCompany);
            Interview.find.mockResolvedValue(mockInterviews);

            await interviewController.addInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'The user with ID user123 has already booked 3 interviews'
            });
        });

        test('should allow admin to book more than 3 interviews', async () => {
            req.params.companyid = 'comp123';
            req.body = { sessionDate: new Date(Date.now() + 86400000) };
            req.user = { id: 'admin123', role: 'admin' };

            const mockCompany = {
                _id: 'comp123'
            };

            const mockInterviews = [
                { _id: 'int1' },
                { _id: 'int2' },
                { _id: 'int3' },
                { _id: 'int4' }
            ];

            const mockNewInterview = {
                _id: 'interview123'
            };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.find.mockResolvedValue(mockInterviews);
            Interview.create.mockResolvedValue(mockNewInterview);

            await interviewController.addInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should handle validation error', async () => {
            req.params.companyid = 'comp123';
            req.body = { sessionDate: new Date(Date.now() - 86400000) };

            const mockCompany = {
                _id: 'comp123'
            };

            const mockInterviews = [];

            const validationError = {
                name: 'ValidationError',
                errors: {
                    sessionDate: { message: 'Date must be in future' }
                }
            };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.find.mockResolvedValue(mockInterviews);
            Interview.create.mockRejectedValue(validationError);

            await interviewController.addInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should handle generic server error in addInterviewSession', async () => {
            req.params.companyid = 'comp123';
            req.body = {};

            const mockCompany = { _id: 'comp123' };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.find.mockResolvedValue([]);
            Interview.create.mockRejectedValue(new Error('Unexpected DB error'));

            await interviewController.addInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot create Interview'
            });
        });
    });

    describe('Update Interview Session', () => {
        test('should update interview session by owner', async () => {
            req.params.id = 'interview123';
            req.body = {
                sessionDate: new Date(Date.now() + 172800000)
            };

            const mockInterview = {
                _id: 'interview123',
                user: { toString: jest.fn().mockReturnValue('user123') }
            };

            const updatedInterview = {
                _id: 'interview123',
                sessionDate: new Date(Date.now() + 172800000)
            };

            Interview.findById.mockResolvedValue(mockInterview);
            Interview.findByIdAndUpdate.mockResolvedValue(updatedInterview);

            await interviewController.updateInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedInterview
            });
        });

        test('should allow admin to update any interview', async () => {
            req.params.id = 'interview123';
            req.user = { id: 'admin123', role: 'admin' };
            req.body = { sessionDate: new Date(Date.now() + 172800000) };

            const mockInterview = {
                _id: 'interview123',
                user: { toString: jest.fn().mockReturnValue('user456') }
            };

            const updatedInterview = {
                _id: 'interview123'
            };

            Interview.findById.mockResolvedValue(mockInterview);
            Interview.findByIdAndUpdate.mockResolvedValue(updatedInterview);

            await interviewController.updateInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return error if interview not found', async () => {
            req.params.id = 'nonexistent';

            Interview.findById.mockResolvedValue(null);

            await interviewController.updateInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No interview with the id of nonexistent'
            });
        });

        test('should handle validation error', async () => {
            req.params.id = 'interview123';
            req.body = { sessionDate: new Date(Date.now() - 86400000) };

            const mockInterview = {
                _id: 'interview123',
                user: { toString: jest.fn().mockReturnValue('user123') }
            };

            const validationError = {
                name: 'ValidationError',
                errors: {
                    sessionDate: { message: 'Date must be in future' }
                }
            };

            Interview.findById.mockResolvedValue(mockInterview);
            Interview.findByIdAndUpdate.mockRejectedValue(validationError);

            await interviewController.updateInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should not allow non-owner to update interview', async () => {
            req.params.id = 'interview123';
            req.body = { sessionDate: new Date(Date.now() + 86400000) };

            const mockInterview = {
                _id: 'interview123',
                user: { toString: jest.fn().mockReturnValue('user456') }
            };

            Interview.findById.mockResolvedValue(mockInterview);

            await interviewController.updateInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User user123 is not authorized to update this interview'
            });
        });

        test('should handle generic server error in updateInterviewSession', async () => {
            req.params.id = 'interview123';
            req.body = { sessionDate: new Date(Date.now() + 86400000) };

            const mockInterview = {
                _id: 'interview123',
                user: { toString: jest.fn().mockReturnValue('user123') }
            };

            Interview.findById.mockResolvedValue(mockInterview);
            Interview.findByIdAndUpdate.mockRejectedValue(new Error('Unexpected DB error'));

            await interviewController.updateInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot update Interview'
            });
        });
    });

    describe('Delete Interview Session', () => {
        test('should delete interview by owner', async () => {
            req.params.id = 'interview123';

            const mockInterview = {
                _id: 'interview123',
                user: { toString: jest.fn().mockReturnValue('user123') },
                deleteOne: jest.fn().mockResolvedValue({})
            };

            Interview.findById.mockResolvedValue(mockInterview);

            await interviewController.deleteInterviewSession(req, res, next);

            expect(mockInterview.deleteOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {}
            });
        });

        test('should allow admin to delete any interview', async () => {
            req.params.id = 'interview123';
            req.user = { id: 'admin123', role: 'admin' };

            const mockInterview = {
                _id: 'interview123',
                user: { toString: jest.fn().mockReturnValue('user456') },
                deleteOne: jest.fn().mockResolvedValue({})
            };

            Interview.findById.mockResolvedValue(mockInterview);

            await interviewController.deleteInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should not allow non-owner to delete', async () => {
            req.params.id = 'interview123';

            const mockInterview = {
                _id: 'interview123',
                user: { toString: jest.fn().mockReturnValue('user456') }
            };

            Interview.findById.mockResolvedValue(mockInterview);

            await interviewController.deleteInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should return error if interview not found', async () => {
            req.params.id = 'nonexistent';

            Interview.findById.mockResolvedValue(null);

            await interviewController.deleteInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No interview with the id of nonexistent'
            });
        });

        test('should handle delete error', async () => {
            req.params.id = 'interview123';

            Interview.findById.mockRejectedValue(new Error('Database error'));

            await interviewController.deleteInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Update Attendance Status', () => {
        test('should update attendance status successfully', async () => {
            req.params.id = 'interview123';
            req.body = { attendanceStatus: 'attended' };

            const mockInterview = {
                _id: 'interview123'
            };

            const updatedInterview = {
                _id: 'interview123',
                attendanceStatus: 'attended'
            };

            Interview.findById.mockResolvedValue(mockInterview);
            Interview.findByIdAndUpdate.mockResolvedValue(updatedInterview);

            await interviewController.updateAttendanceStatus(req, res, next);

            expect(Interview.findByIdAndUpdate).toHaveBeenCalledWith(
                'interview123',
                { attendanceStatus: 'attended' },
                { new: true, runValidators: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedInterview
            });
        });

        test('should accept all valid attendance statuses', async () => {
            const statuses = ['pending', 'attended', 'absent'];

            statuses.forEach(status => {
                req.params.id = 'interview123';
                req.body = { attendanceStatus: status };

                const mockInterview = {
                    _id: 'interview123'
                };

                Interview.findById.mockResolvedValue(mockInterview);
                Interview.findByIdAndUpdate.mockResolvedValue({});

                interviewController.updateAttendanceStatus(req, res, next);
            });
        });

        test('should return error for invalid attendance status', async () => {
            req.params.id = 'interview123';
            req.body = { attendanceStatus: 'invalid' };

            await interviewController.updateAttendanceStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'attendanceStatus must be pending, attended, or absent'
            });
        });

        test('should return error if interview not found', async () => {
            req.params.id = 'nonexistent';
            req.body = { attendanceStatus: 'attended' };

            Interview.findById.mockResolvedValue(null);

            await interviewController.updateAttendanceStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No interview with the id of nonexistent'
            });
        });

        test('should handle server error in updateAttendanceStatus', async () => {
            req.params.id = 'interview123';
            req.body = { attendanceStatus: 'attended' };

            Interview.findById.mockRejectedValue(new Error('Database error'));

            await interviewController.updateAttendanceStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot update attendance status'
            });
        });
    });
});