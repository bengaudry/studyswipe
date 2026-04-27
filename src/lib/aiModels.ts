import {User} from "@/db/generated/prisma";

export const AVAILABLE_MODELS = ['gpt-4o-mini', 'gemini-3.1-pro-preview', 'gpt-5-mini', 'gpt-5.4-mini', 'gpt-5', 'gpt-5.3-codex']

export const AVAILABLE_MODELS_BY_PLAN: Record<User['plan'], typeof AVAILABLE_MODELS[number][]> = {
    FREE: ['gpt-4o-mini'],
    PREMIUM: ['gemini-3.1-pro-preview', 'gpt-4o-mini', 'gpt-5-mini'],
    PRO: AVAILABLE_MODELS
}

export function isUserAuthorizedToUseModel(model: typeof AVAILABLE_MODELS[number], user: User): boolean {
    const allowedModels = AVAILABLE_MODELS_BY_PLAN[user.plan]
    if (!allowedModels) return false;
    return allowedModels.includes(model)
}
