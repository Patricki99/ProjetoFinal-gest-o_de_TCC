// Middleware de logging
const morgan = require("morgan");

// Formato customizado de log
morgan.token("timestamp", () => {
  const now = new Date();
  return now.toISOString();
});

const morganFormat = ":timestamp [GATEWAY] :method :url :status :response-time ms";

const logger = morgan(morganFormat);

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toLocaleTimeString()}] [${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";
  
  res.status(status).json({
    error: {
      status,
      message,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  logger,
  requestLogger,
  errorHandler
};
