import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const authSeller = async (req, res, next) => {
    const { sellerToken } = req.cookies;

    if (!sellerToken) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);

        if (tokenDecode.role === 'superadmin' && tokenDecode.email === process.env.SUPER_ADMIN_EMAIL) {
            req.sellerRole = 'superadmin';
            next();
        } else if (tokenDecode.role === 'admin' && tokenDecode.id) {
            const admin = await Admin.findById(tokenDecode.id);
            if (admin) {
                req.sellerRole = 'admin';
                next();
            } else {
                return res.json({ success: false, message: 'Not Authorized: Admin not found' });
            }
        } else {
            return res.json({ success: false, message: 'Not Authorized' });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export default authSeller;