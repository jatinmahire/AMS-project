// Shared between the Master list page and the update form, so both read the same status
// options per verification type (Aadhaar has no "Not Required", Police does).
export const VERIFICATION_TYPES = {
  AADHAAR: {
    label: 'Aadhaar Verification',
    statuses: [['PENDING', 'Pending'], ['VERIFIED', 'Verified'], ['REJECTED', 'Rejected']],
    hasReferenceNo: false,
  },
  POLICE: {
    label: 'Police Verification',
    statuses: [['PENDING', 'Pending'], ['VERIFIED', 'Verified'], ['REJECTED', 'Rejected'], ['NOT_REQUIRED', 'Not Required']],
    hasReferenceNo: true,
  },
};
