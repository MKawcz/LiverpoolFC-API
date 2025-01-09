export const addCustomHeaders = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');      // info w jakim formacie wysyłamy dane

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');     // Prevents MIME type sniffing - zapobiega zgadywaniu zawartości pliku przez przeglądarkę

    // API information
    res.setHeader('X-Request-ID', crypto.randomUUID());     // Unique request identifier - przydatny przy debugowaniu, do wyszukania konkretnego zapytania
    res.setHeader('X-Response-Time', Date.now().toString());// Response timestamp

    next();
};