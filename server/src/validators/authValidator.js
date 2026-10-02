const { z } = require('zod');

const loginSchema = z.object({
  loginId: z.string().min(1, 'Login ID is required'),
  password: z.string().min(1, 'Password is required'),
  selectedRole: z.enum(['ADMIN', 'SUPERVISOR', 'CONTRACTOR'], { errorMap: () => ({ message: 'Select a valid role' }) }),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const updateProfileSchema = z.object({
  fullName: z.string().trim().max(100, 'Display name must be 100 characters or fewer'),
});

module.exports = { loginSchema, changePasswordSchema, updateProfileSchema };
