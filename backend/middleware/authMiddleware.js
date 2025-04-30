// authMiddleware.js - простой пример middleware для аутентификации
module.exports = (req, res, next) => {
    try {
        // Здесь должна быть ваша логика проверки аутентификации
        // Например, проверка JWT токена или сессии

        // Временная заглушка - пропускаем все запросы
        console.log("Auth middleware - request allowed");
        next();

        // Реальный пример проверки токена:
        /*
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({message: "Не авторизован"});
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
        */
    } catch (e) {
        res.status(401).json({message: "Не авторизован"});
    }
}