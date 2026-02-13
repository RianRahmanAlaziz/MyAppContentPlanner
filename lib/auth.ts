export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user" | string;
};
const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, remember: boolean = true) {
    if (typeof window === "undefined") return;
    if (remember) localStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function setUser(user: AuthUser, remember: boolean = true) {
    if (typeof window === "undefined") return;
    const raw = JSON.stringify(user);
    if (remember) localStorage.setItem(USER_KEY, raw);
    else sessionStorage.setItem(USER_KEY, raw);
}

export function clearUser() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

export function isAdmin(): boolean {
    const user = getUser();
    return user?.role === "admin";
}

export function logout() {
    clearToken();
    clearUser();
}