import { verifyToken } from '@clerk/backend'

const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.error("Auth Error: No token found in headers");
            return res.status(401).json({ success: false, message: 'Not Authorized: No Token' });
        }

        console.log(`Attempting to verify token starting with ${token.substring(0, 5)}... and ending with ...${token.substring(token.length - 5)}`);

        try {
            const decoded = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY
            });

            if (decoded.sub) {
                req.body.userId = decoded.sub; 
                req.userId = decoded.sub; // Also set as req.userId for GET requests safety
                next();
            } else {
                console.error("Auth Error: Token decoded but no sub claim found");
                return res.status(401).json({ success: false, message: 'Not Authorized: Invalid Token' });
            }
        } catch (verifyError) {
            console.error(`Clerk Token Verification Failed: ${verifyError.name} - ${verifyError.message}`);
            return res.status(401).json({ success: false, message: 'Not Authorized: Token Verification Failed' });
        }

    } catch (error) {
        console.error("Internal Auth Middleware Error:", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error during auth' });
    }
}

export default authUser;