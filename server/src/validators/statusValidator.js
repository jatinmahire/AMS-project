const { z } = require('zod');

const statusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED'], {
    errorMap: () => ({ message: 'Select a valid status' }),
  }),
});

module.exports = { statusUpdateSchema };
