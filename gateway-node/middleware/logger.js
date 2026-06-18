const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
};
const errorHandler = (err, req, res, next) => {
  console.error(`[ERRO] ${err.message}`);
  res.status(err.status || 500).json({ error: { message: err.message || "Erro interno", timestamp: new Date().toISOString() } });
};
module.exports = { requestLogger, errorHandler };
