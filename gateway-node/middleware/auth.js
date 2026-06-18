// Autenticacao (token de sessao assinado, estilo JWT) + autorizacao por perfil (RBAC).
// Usa apenas o modulo 'crypto' nativo do Node (sem dependencia extra).
const crypto = require("crypto");
const SECRET = process.env.JWT_SECRET || "tcc-dev-secret";
const VALIDADE_MS = 8 * 60 * 60 * 1000; // 8h

function emitirToken(usuario) {
  const corpo = { id: usuario.id, nome: usuario.nome, email: usuario.email,
                  role: usuario.role, exp: Date.now() + VALIDADE_MS };
  const payload = Buffer.from(JSON.stringify(corpo)).toString("base64url");
  const assinatura = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${assinatura}`;
}

function verificarToken(token) {
  if (!token) return null;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return null;
  const esperada = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  // comparacao em tempo constante
  if (assinatura.length !== esperada.length ||
      !crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(esperada))) return null;
  try {
    const dados = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (dados.exp && Date.now() > dados.exp) return null;
    return dados;
  } catch {
    return null;
  }
}

// Middleware: exige token valido (Authorization: Bearer <token>)
function autenticar(req, res, next) {
  const h = req.headers.authorization || "";
  const user = verificarToken(h.startsWith("Bearer ") ? h.slice(7) : null);
  if (!user) return res.status(401).json({ error: "Nao autenticado" });
  req.user = user;
  next();
}

// Middleware: exige um dos perfis informados (RBAC)
function autorizar(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ error: `Acesso negado para o perfil '${req.user && req.user.role}'` });
    next();
  };
}

module.exports = { emitirToken, verificarToken, autenticar, autorizar };
