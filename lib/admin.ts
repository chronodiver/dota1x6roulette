// Admin Steam IDs that have access to admin panel
export const ADMIN_STEAM_IDS = ['76561198119674493'];

export function isAdmin(steamId: string): boolean {
    return ADMIN_STEAM_IDS.includes(steamId);
}
