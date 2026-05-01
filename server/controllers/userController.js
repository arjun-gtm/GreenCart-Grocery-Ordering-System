import User from "../models/User.js";
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
});

const extractUserEmail = (clerkUser) => {
    const primaryEmail = clerkUser.emailAddresses?.find((item) => item.id === clerkUser.primaryEmailAddressId);
    return primaryEmail?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.emailAddress || '';
}

const extractUserName = (clerkUser) => {
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim();
    if (name) return name;
    if (clerkUser.fullName) return clerkUser.fullName;
    return 'Clerk User';
}

const upsertClerkUserToMongo = async (clerkUser) => {
    if (!clerkUser || !clerkUser.id) return null;

    const updateFields = {
        name: extractUserName(clerkUser),
        email: extractUserEmail(clerkUser)
    };

    return User.findOneAndUpdate(
        { clerkId: clerkUser.id },
        { $set: updateFields },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

export const syncClerkUserById = async (clerkId) => {
    if (!clerkId) return null;
    const clerkUser = await clerkClient.users.getUser(clerkId);
    return await upsertClerkUserToMongo(clerkUser);
};

export const syncAllClerkUsers = async () => {
    let offset = 0;
    const limit = 100;
    let totalSynced = 0;

    while (true) {
        const response = await clerkClient.users.getUserList({ limit, offset });
        const clerkUsers = Array.isArray(response?.data) ? response.data : [];
        if (clerkUsers.length === 0) break;

        for (const clerkUser of clerkUsers) {
            await upsertClerkUserToMongo(clerkUser);
            totalSynced += 1;
        }

        if (clerkUsers.length < limit) break;
        offset += limit;
    }

    return totalSynced;
};

// Fetch User Data & Sync with Clerk ID : /api/user/data
export const userData = async (req, res) => {
    try {
        const { userId } = req.body; // clerkId set from authUser middleware
        const user = await syncClerkUserById(userId);
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
