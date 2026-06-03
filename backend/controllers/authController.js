import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { resolveProfileId, normalizeRole } from '../utils/resolveProfile.js';

const VALID_ROLES = ['employee', 'hr', 'company', 'superadmin'];

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: normalizeRole(user.role) },
    process.env.SECRET_KEY || 'dev_secret_change_me',
    { expiresIn: '7d' }
  );

const buildAuthResponse = (user) => {
  const role = normalizeRole(user.role);
  const profileId = resolveProfileId(user);

  const payload = {
    email: user.email,
    name: user.name,
    role,
    token: signToken(user),
  };

  if (role === 'company' && profileId) {
    payload.userId = profileId;
  } else if (role !== 'superadmin' && profileId) {
    payload.userId = profileId;
  }

  return payload;
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [employee, hr, company, superadmin] }
 *               profileId: { type: string, description: "Optional emp001 / hr001 / co001" }
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, profileId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const normalizedRole = normalizeRole(role);
    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: normalizedRole,
      profileId: profileId || null,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, description: "Optional — must match account role if provided" }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req, res) => {
  try {
    const { email, password, role: selectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accountRole = normalizeRole(user.role);

    if (selectedRole && normalizeRole(selectedRole) !== accountRole) {
      return res.status(403).json({
        error: `This account is registered as ${accountRole}. Please select the correct role.`,
      });
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
