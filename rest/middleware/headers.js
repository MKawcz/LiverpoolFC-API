export const addCustomHeaders = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // API information
    res.setHeader('X-Request-ID', crypto.randomUUID());
    res.setHeader('X-Response-Time', Date.now().toString());

    next();
};