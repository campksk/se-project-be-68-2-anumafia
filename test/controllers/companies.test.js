/**
 * Companies Controller Tests
 * Tests for getCompanies, getCompany, createCompany, updateCompany, deleteCompany, updateCompanyPublicStatus
 */

const companiesController = require('../../controllers/companies');
const Company = require('../../models/Company');
const User = require('../../models/User');
const Interview = require('../../models/Interview');
const Review = require('../../models/Review');
const authController = require('../../controllers/auth');

jest.mock('../../models/Company');
jest.mock('../../models/User');
jest.mock('../../models/Interview');
jest.mock('../../models/Review');
jest.mock('../../controllers/auth');

describe('Companies Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            params: {},
            query: {},
            user: { id: 'user123', role: 'user' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('Get Companies', () => {
        test('should get public companies for regular users', async () => {
            req.query = { page: 1, limit: 25 };
            req.user = { id: 'user123', role: 'user' };

            const mockCompanies = [
                { _id: 'comp1', name: 'Company 1', public: true }
            ];

            Company.countDocuments.mockResolvedValue(1);
            Company.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockCompanies)
            });

            await companiesController.getCompanies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                data: mockCompanies
            });
        });

        test('should get public and own companies for company users', async () => {
            req.query = { page: 1, limit: 25 };
            req.user = { id: 'company123', role: 'company' };

            const mockCompanies = [
                { _id: 'comp1', name: 'My Company', public: false, user: 'company123' }
            ];

            Company.countDocuments.mockResolvedValue(1);
            Company.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockCompanies)
            });

            await companiesController.getCompanies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should get all companies for admin users', async () => {
            req.query = { page: 1, limit: 25 };
            req.user = { id: 'admin123', role: 'admin' };

            const mockCompanies = [
                { _id: 'comp1', name: 'Company 1', public: true },
                { _id: 'comp2', name: 'Company 2', public: false }
            ];

            Company.countDocuments.mockResolvedValue(2);
            Company.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockCompanies)
            });

            await companiesController.getCompanies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should handle error in getCompanies', async () => {
            req.query = { page: 1 };

            Company.countDocuments.mockRejectedValue(new Error('Database error'));

            await companiesController.getCompanies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false
            });
        });

        test('should apply select fields in getCompanies', async () => {
            req.query = { select: 'name,tel' };
            req.user = { id: 'user123', role: 'user' };

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            };
            Company.countDocuments.mockResolvedValue(0);
            Company.find.mockReturnValue(mockQuery);

            await companiesController.getCompanies(req, res, next);

            expect(mockQuery.select).toHaveBeenCalledWith('name tel');
        });

        test('should apply sort in getCompanies', async () => {
            req.query = { sort: 'name,-createdAt' };
            req.user = { id: 'user123', role: 'user' };

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            };
            Company.countDocuments.mockResolvedValue(0);
            Company.find.mockReturnValue(mockQuery);

            await companiesController.getCompanies(req, res, next);

            expect(mockQuery.sort).toHaveBeenCalledWith('name -createdAt');
        });

        test('should apply query operators (gte, lte, etc.) in getCompanies', async () => {
            req.query = { rating: { gte: '3' } };
            req.user = { id: 'admin123', role: 'admin' };

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            };
            Company.countDocuments.mockResolvedValue(0);
            Company.find.mockReturnValue(mockQuery);

            await companiesController.getCompanies(req, res, next);

            expect(Company.find).toHaveBeenCalledWith(
                expect.objectContaining({ rating: { $gte: '3' } })
            );
        });

        test('should include pagination.next and pagination.prev when applicable', async () => {
            req.query = { page: '2', limit: '1' };
            req.user = { id: 'admin123', role: 'admin' };

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ _id: 'comp2' }])
            };
            // page=2, limit=1 → startIndex=1>0 (prev), endIndex=2<5 (next)
            Company.countDocuments.mockResolvedValue(5);
            Company.find.mockReturnValue(mockQuery);

            await companiesController.getCompanies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should handle unauthenticated user in getCompanies', async () => {
            req.query = {};
            req.user = null;

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            };
            Company.countDocuments.mockResolvedValue(0);
            Company.find.mockReturnValue(mockQuery);

            await companiesController.getCompanies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Get Company', () => {
        test('should get public company for any user', async () => {
            req.params.id = 'comp123';
            req.user = { id: 'user123', role: 'user' };

            const mockCompany = {
                _id: 'comp123',
                name: 'Tech Corp',
                public: true,
                user: 'company123'
            };

            Company.findById.mockResolvedValue(mockCompany);

            await companiesController.getCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCompany
            });
        });

        test('should not allow accessing private company if not owner', async () => {
            req.params.id = 'comp123';
            req.user = { id: 'user123', role: 'user' };

            const mockCompany = {
                _id: 'comp123',
                name: 'Private Corp',
                public: false,
                user: 'company456'
            };

            Company.findById.mockResolvedValue(mockCompany);

            await companiesController.getCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Company is not public'
            });
        });

        test('should allow owner to access private company', async () => {
            req.params.id = 'comp123';
            req.user = { id: 'company123', role: 'company' };

            const mockCompany = {
                _id: 'comp123',
                name: 'My Private Corp',
                public: false,
                user: { toString: jest.fn().mockReturnValue('company123') }
            };

            Company.findById.mockResolvedValue(mockCompany);

            await companiesController.getCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should allow admin to access any company', async () => {
            req.params.id = 'comp123';
            req.user = { id: 'admin123', role: 'admin' };

            const mockCompany = {
                _id: 'comp123',
                name: 'Any Corp',
                public: false,
                user: 'company456'
            };

            Company.findById.mockResolvedValue(mockCompany);

            await companiesController.getCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return error if company not found', async () => {
            req.params.id = 'nonexistent';
            Company.findById.mockResolvedValue(null);

            await companiesController.getCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });

        test('should handle server error in getCompany', async () => {
            req.params.id = 'comp123';
            Company.findById.mockRejectedValue(new Error('DB error'));

            await companiesController.getCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });
    });

    describe('Create Company', () => {
        test('should create company successfully', async () => {
            req.body = {
                name: 'New Tech Corp',
                tel: '0212345678',
                email: 'company@example.com',
                password: 'password123',
                role: 'company'
            };

            const mockUser = {
                _id: 'newcompany123',
                name: 'New Tech Corp',
                email: 'company@example.com'
            };

            const mockCompany = {
                _id: 'comp123',
                name: 'New Tech Corp',
                tel: '0212345678',
                user: 'newcompany123'
            };

            authController.register.mockResolvedValue(mockUser);
            Company.create.mockResolvedValue(mockCompany);

            await companiesController.createCompany(req, res, next);

            expect(authController.register).toHaveBeenCalled();
            expect(Company.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: 'newcompany123'
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCompany
            });
        });

        test('should handle validation error in createCompany', async () => {
            req.body = { name: 'New Corp', role: 'company' };

            const validationError = {
                name: 'ValidationError',
                errors: { name: { message: 'Name is required' } }
            };
            authController.register.mockResolvedValue({ _id: 'newcompany123' });
            Company.create.mockRejectedValue(validationError);

            await companiesController.createCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Name is required' });
        });

        test('should handle generic server error in createCompany', async () => {
            req.body = { name: 'Corp', role: 'company' };

            authController.register.mockResolvedValue({ _id: 'newcompany123' });
            Company.create.mockRejectedValue(new Error('Unexpected error'));

            await companiesController.createCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });
    });

    describe('Update Company', () => {
        test('should update company successfully', async () => {
            req.params.id = 'comp123';
            req.body = { name: 'Updated Corp', tel: '0212345679', description: 'Updated description' };
            req.user = { id: 'company123', role: 'company' };

            const mockCompany = {
                _id: 'comp123',
                name: 'Old Corp',
                tel: '0212345678',
                user: { toString: jest.fn().mockReturnValue('company123') }
            };
            const updatedCompany = { _id: 'comp123', name: 'Updated Corp', tel: '0212345679' };

            Company.findById.mockResolvedValue(mockCompany);
            User.findByIdAndUpdate.mockResolvedValue({});
            Company.findByIdAndUpdate.mockResolvedValue(updatedCompany);

            await companiesController.updateCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedCompany });
        });

        test('should not allow non-owner to update company', async () => {
            req.params.id = 'comp123';
            req.body = { name: 'Updated' };
            req.user = { id: 'user456', role: 'company' };

            const mockCompany = {
                _id: 'comp123',
                user: { toString: jest.fn().mockReturnValue('company123') }
            };
            Company.findById.mockResolvedValue(mockCompany);

            await companiesController.updateCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should allow admin to update any company', async () => {
            req.params.id = 'comp123';
            req.body = { name: 'Updated' };
            req.user = { id: 'admin123', role: 'admin' };

            const mockCompany = { _id: 'comp123', user: 'company456' };
            Company.findById.mockResolvedValue(mockCompany);
            User.findByIdAndUpdate.mockResolvedValue({});
            Company.findByIdAndUpdate.mockResolvedValue({ _id: 'comp123', name: 'Updated' });

            await companiesController.updateCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return error if company not found in updateCompany', async () => {
            req.params.id = 'nonexistent';
            req.body = { name: 'Test' };

            Company.findById.mockResolvedValue(null);

            await companiesController.updateCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });

        test('should handle ValidationError in updateCompany', async () => {
            req.params.id = 'comp123';
            req.body = { name: '' };
            req.user = { id: 'company123', role: 'company' };

            const mockCompany = {
                _id: 'comp123',
                user: { toString: jest.fn().mockReturnValue('company123') }
            };
            const validationError = {
                name: 'ValidationError',
                errors: { name: { message: 'Name is required' } }
            };

            Company.findById.mockResolvedValue(mockCompany);
            User.findByIdAndUpdate.mockResolvedValue({});
            Company.findByIdAndUpdate.mockRejectedValue(validationError);

            await companiesController.updateCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Name is required' });
        });

        test('should handle generic error in updateCompany', async () => {
            req.params.id = 'comp123';
            req.body = { name: 'Test' };
            req.user = { id: 'company123', role: 'company' };

            const mockCompany = {
                _id: 'comp123',
                user: { toString: jest.fn().mockReturnValue('company123') }
            };

            Company.findById.mockResolvedValue(mockCompany);
            User.findByIdAndUpdate.mockResolvedValue({});
            Company.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

            await companiesController.updateCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });
    });

    describe('Delete Company', () => {
        test('should delete company successfully', async () => {
            req.params.id = 'comp123';
            req.user = { id: 'company123', role: 'company' };

            const mockCompany = {
                _id: 'comp123',
                user: { toString: jest.fn().mockReturnValue('company123') }
            };
            const mockCompanyUser = { _id: 'company123', role: 'company' };

            Company.findById.mockResolvedValue(mockCompany);
            Review.deleteMany.mockResolvedValue({});
            Interview.deleteMany.mockResolvedValue({});
            Company.deleteOne.mockResolvedValue({});
            User.findById.mockResolvedValue(mockCompanyUser);
            User.deleteOne.mockResolvedValue({});

            await companiesController.deleteCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Company and associated data deleted successfully',
                data: {}
            });
        });

        test('should not allow non-owner company to delete', async () => {
            req.params.id = 'comp123';
            req.user = { id: 'company456', role: 'company' };

            const mockCompany = {
                _id: 'comp123',
                user: { toString: jest.fn().mockReturnValue('company123') }
            };
            Company.findById.mockResolvedValue(mockCompany);

            await companiesController.deleteCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should return error if company not found', async () => {
            req.params.id = 'nonexistent';
            Company.findById.mockResolvedValue(null);

            await companiesController.deleteCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Company not found' });
        });

        test('should skip user deletion when company user is not company role', async () => {
            req.params.id = 'comp123';
            req.user = { id: 'admin123', role: 'admin' };

            const mockCompany = {
                _id: 'comp123',
                user: { toString: jest.fn().mockReturnValue('admin123') }
            };
            const mockCompanyUser = { _id: 'admin123', role: 'user' };

            Company.findById.mockResolvedValue(mockCompany);
            Review.deleteMany.mockResolvedValue({});
            Interview.deleteMany.mockResolvedValue({});
            Company.deleteOne.mockResolvedValue({});
            User.findById.mockResolvedValue(mockCompanyUser);

            await companiesController.deleteCompany(req, res, next);

            expect(User.deleteOne).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should handle server error in deleteCompany', async () => {
            req.params.id = 'comp123';
            Company.findById.mockRejectedValue(new Error('DB error'));

            await companiesController.deleteCompany(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Failed to delete company' });
        });
    });

    describe('Update Company Public Status', () => {
        test('should update company public status', async () => {
            req.params.id = 'comp123';
            req.body = { public: true };
            req.user = { id: 'company123', role: 'company' };

            const mockCompany = { _id: 'comp123', user: { toString: jest.fn().mockReturnValue('company123') } };
            const updatedCompany = { _id: 'comp123', public: true };

            Company.findById.mockResolvedValue(mockCompany);
            Company.findByIdAndUpdate.mockResolvedValue(updatedCompany);

            await companiesController.updateCompanyPublicStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should not allow non-owner to update public status', async () => {
            req.params.id = 'comp123';
            req.body = { public: true };
            req.user = { id: 'company456', role: 'company' };

            const mockCompany = { _id: 'comp123', user: { toString: jest.fn().mockReturnValue('company123') } };
            Company.findById.mockResolvedValue(mockCompany);

            await companiesController.updateCompanyPublicStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should return error if company not found in updateCompanyPublicStatus', async () => {
            req.params.id = 'nonexistent';
            req.body = { public: true };
            Company.findById.mockResolvedValue(null);

            await companiesController.updateCompanyPublicStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Company not found' });
        });

        test('should handle ValidationError in updateCompanyPublicStatus', async () => {
            req.params.id = 'comp123';
            req.body = { public: 'invalid' };
            req.user = { id: 'company123', role: 'company' };

            const mockCompany = { _id: 'comp123', user: { toString: jest.fn().mockReturnValue('company123') } };
            const validationError = {
                name: 'ValidationError',
                errors: { public: { message: 'Public must be a boolean' } }
            };

            Company.findById.mockResolvedValue(mockCompany);
            Company.findByIdAndUpdate.mockRejectedValue(validationError);

            await companiesController.updateCompanyPublicStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Public must be a boolean' });
        });

        test('should handle generic error in updateCompanyPublicStatus', async () => {
            req.params.id = 'comp123';
            req.body = { public: true };
            req.user = { id: 'company123', role: 'company' };

            const mockCompany = { _id: 'comp123', user: { toString: jest.fn().mockReturnValue('company123') } };
            Company.findById.mockResolvedValue(mockCompany);
            Company.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

            await companiesController.updateCompanyPublicStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });

        test('should return 404 if interview is null BEFORE authorization check', async () => {
            req.params.id = 'interview123';

            // Force direct null without hitting populate chain behavior
            Interview.findById.mockResolvedValue(null);

            await interviewController.getInterviewSession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});