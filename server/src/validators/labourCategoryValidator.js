const { z } = require('zod');

const LABOUR_TYPES = ['SKILLED', 'SEMI_SKILLED', 'UNSKILLED', 'HIGH_SKILLED'];

const labourCategorySchema = z.object({
  categoryCode: z.string().min(1, 'Category code is required').max(20),
  categoryName: z.enum(LABOUR_TYPES, { errorMap: () => ({ message: 'Select a valid labour type' }) }),
  ratePerDay: z.coerce.number().positive('Rate per day must be greater than 0'),
});

module.exports = { labourCategorySchema, LABOUR_TYPES };
