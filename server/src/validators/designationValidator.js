const { z } = require('zod');

const designationSchema = z.object({
  designationCode: z.string().min(1, 'Designation code is required').max(20),
  designationName: z.string().min(1, 'Designation name is required').max(100),
});

module.exports = { designationSchema };
