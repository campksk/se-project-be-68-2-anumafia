/**
 * User Model Tests
 * Tests for User schema validations and methods
 */

const mongoose = require('mongoose');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('User Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('User Schema Validations', () => {
        test('should create a user with valid data', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123',
                role: 'user'
            };

            const user = new User(userData);
            expect(user.name).toBe('John Doe');
            expect(user.tel).toBe('0812345678');
            expect(user.email).toBe('john@example.com');
            expect(user.role).toBe('user');
        });

        test('should include require option on name field', () => {
            const path = User.schema.paths.name;
            expect(path.options.require).toBeDefined();
            expect(path.options.require[0]).toBe(true);
            expect(path.options.require[1]).toBe('Please add a name');
        });

        test('should include require option on tel field', () => {
            const path = User.schema.paths.tel;
            expect(path.options.require).toBeDefined();
            expect(path.options.require[0]).toBe(true);
            expect(path.options.require[1]).toBe('Please add a telephone number');
        });

        test('should include require option on email field', () => {
            const path = User.schema.paths.email;
            expect(path.options.require).toBeDefined();
            expect(path.options.require[0]).toBe(true);
            expect(path.options.require[1]).toBe('Please add an email');
        });

        test('should include require option on password field', () => {
            const path = User.schema.paths.password;
            expect(path.options.require).toBeDefined();
            expect(path.options.require[0]).toBe(true);
            expect(path.options.require[1]).toBe('Please add a password');
        });

        test('should validate email format', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'invalid-email',
                password: 'password123'
            };

            const user = new User(userData);
            const error = user.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.email).toBeDefined();
        });

        test('should validate valid email formats', () => {
            const validEmails = [
                'user@example.com',
                'user.name@example.com',
                'user+tag@example.co.uk'
            ];

            validEmails.forEach(email => {
                const userData = {
                    name: 'John Doe',
                    tel: '0812345678',
                    email: email,
                    password: 'password123'
                };
                const user = new User(userData);
                expect(user.email).toBe(email);
            });
        });

        test('should set role to user by default', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123'
            };

            const user = new User(userData);
            expect(user.role).toBe('user');
        });

        test('should accept valid roles', () => {
            const roles = ['user', 'company', 'admin'];

            roles.forEach(role => {
                const userData = {
                    name: 'John Doe',
                    tel: '0812345678',
                    email: `john-${role}@example.com`,
                    password: 'password123',
                    role: role
                };

                const user = new User(userData);
                expect(user.role).toBe(role);
            });
        });

        test('should reject invalid role', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123',
                role: 'invalid_role'
            };

            const user = new User(userData);
            const error = user.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.role).toBeDefined();
        });

        test('should require password with minimum 6 characters', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: '12345'
            };

            const user = new User(userData);
            const error = user.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.password).toBeDefined();
        });

        test('should initialize ban as not banned', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123'
            };

            const user = new User(userData);
            expect(user.ban.isBanned).toBe(false);
            expect(user.ban.reason).toBe('');
        });

        test('should initialize yellowCards as empty', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123'
            };

            const user = new User(userData);
            expect(user.yellowCards.count).toBe(0);
            expect(user.yellowCards.records).toEqual([]);
        });
    });

    describe('User Methods', () => {
        test('getSignedJwtToken should return a valid JWT token', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123',
                _id: new mongoose.Types.ObjectId()
            };

            const user = new User(userData);
            const token = user.getSignedJwtToken();

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.id).toBe(user._id.toString());
        });

        test('matchPassword should return true for correct password', async () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123'
            };

            const user = new User(userData);
            
            // Mock bcrypt.compare to return true
            bcrypt.compare = jest.fn().mockResolvedValue(true);

            const isMatch = await user.matchPassword('password123');
            expect(isMatch).toBe(true);
        });

        test('matchPassword should return false for incorrect password', async () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123'
            };

            const user = new User(userData);
            
            // Mock bcrypt.compare to return false
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            const isMatch = await user.matchPassword('wrongpassword');
            expect(isMatch).toBe(false);
        });
    });

    describe('Ban and Yellow Cards', () => {
        test('should support ban structure', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123',
                ban: {
                    isBanned: true,
                    reason: 'Inappropriate behavior'
                }
            };

            const user = new User(userData);
            expect(user.ban.isBanned).toBe(true);
            expect(user.ban.reason).toBe('Inappropriate behavior');
        });

        test('should support yellowCards with records', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123',
                yellowCards: {
                    count: 2,
                    records: [
                        { reason: 'First warning' },
                        { reason: 'Second warning' }
                    ]
                }
            };

            const user = new User(userData);
            expect(user.yellowCards.count).toBe(2);
            expect(user.yellowCards.records).toHaveLength(2);
        });
    });

    describe('User Creation Timestamp', () => {
        test('should set createAt timestamp by default', () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123'
            };

            const user = new User(userData);
            expect(user.createAt).toBeDefined();
            expect(user.createAt instanceof Date).toBe(true);
        });
    });

    describe('Password Hashing Pre-save Hook', () => {
        afterEach(() => jest.restoreAllMocks());

        test('should hash password before saving', async () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'plainpassword'
            };
            const user = new User(userData);

            jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('fakesalt');
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2a$hashedpassword');

            // Read hook from Kareem's _pres map (reliable after model compile)
            const hooks = User.schema.s.hooks._pres.get('save');
            const preSaveFn = hooks[0].fn;
            await preSaveFn.call(user, jest.fn());

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 'fakesalt');
            expect(user.password).toBe('$2a$hashedpassword');
        });
    });
});