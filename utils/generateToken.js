import crypto from 'crypto';
export const generateApprovalToken = () =>
  crypto.randomBytes(32).toString('hex');
