export const addCustomHeaders = (req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // API information
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-Request-ID', crypto.randomUUID());
    res.setHeader('X-Response-Time', Date.now().toString());

    next();
};