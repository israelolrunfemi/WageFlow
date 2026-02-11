import { defaultSession } from '../../config/index.js';
export const sessionMiddleware = async (ctx, next) => {
    if (!ctx.session) {
        const initialSession = {
            ...defaultSession,
        };
        ctx.session = initialSession;
    }
    await next();
};
//# sourceMappingURL=session.js.map