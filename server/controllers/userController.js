import User from "../models/User.js";

// Fetch User Data & Sync with Clerk ID : /api/user/data
export const userData = async (req, res) => {
    try {
        const { userId } = req.body; // clerkId set from authUser middleware

        let user = await User.findOne({ clerkId: userId });

        if (!user) {
            // Lazy sync: user doesn't exist in MongoDB yet
            // Normally you would get name/email from the Clerk verification 'decoded' object 
            // but we can also just create a skeleton user if only clerkId is available
            user = await User.create({
                clerkId: userId,
                name: "Clerk User", // Fallback, update later if possible
                email: "clerk@user.com", // Fallback
                cartItems: {}
            });
        }

        return res.json({ success: true, user });

    } catch (error) {
        console.log("Error syncing user data:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// Authentication Check : /api/user/is-auth (Alternative to above)
export const isAuth = async (req, res) => {
    try {
        return res.json({ success: true, message: 'Authenticated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}