import jwt from 'jsonwebtoken';

const authSuperAdmin = async (req, res, next) => {
    const { sellerToken } = req.cookies;

    if (!sellerToken) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if (tokenDecode.role === 'superadmin' && tokenDecode.email === process.env.SUPER_ADMIN_EMAIL) {
            next();
        } else {
            return res.json({ success: false, message: 'Not Authorized: Super Admin Access Required' });
        }

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export default authSuperAdmin;
