/**
 * Utility functions for checking profile completion status
 */

export interface UserProfile {
    bio?: string | null;
    class_of_year?: number | null;
    interests?: string[] | null;
}

/**
 * Checks if a user profile has all required fields completed
 * Required fields: bio, class_of_year, interests (at least one)
 */
export const isProfileComplete = (userProfile: UserProfile | null | undefined): boolean => {
    if (!userProfile) return false;

    return !!(
        userProfile.bio &&
        userProfile.bio.trim().length > 0 &&
        userProfile.class_of_year &&
        userProfile.interests &&
        Array.isArray(userProfile.interests) &&
        userProfile.interests.length > 0
    );
};

/**
 * Gets a list of missing required fields
 */
export const getMissingFields = (userProfile: UserProfile | null | undefined): string[] => {
    const missing: string[] = [];

    if (!userProfile) {
        return ['bio', 'class of year', 'interests'];
    }

    if (!userProfile.bio || userProfile.bio.trim().length === 0) {
        missing.push('bio');
    }

    if (!userProfile.class_of_year) {
        missing.push('class of year');
    }

    if (!userProfile.interests || !Array.isArray(userProfile.interests) || userProfile.interests.length === 0) {
        missing.push('interests');
    }

    return missing;
};
