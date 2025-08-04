import Admin from '../models/Admin.js';

export const approveAdmin = async (req, res, next) => {
  try {
    const { token }  = req.params;
    const { action } = req.query;   // ?action=approve|deny

    const admin = await Admin.findOne({ where: { approvalToken: token } });
    if (!admin) return res.status(404).send('Invalid or expired token.');

    if (action === 'approve') {
      admin.isApproved = true;
      await admin.save();
      return res.send('✅ Admin approved. They can now log in.');
    }

    // default: deny
    await admin.destroy();
    return res.send('❌ Registration denied and record removed.');
  } catch (err) {
    next(err);
  }
};
