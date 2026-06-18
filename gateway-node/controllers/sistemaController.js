const zmqClient = require("../services/zmqClient");
module.exports = {
  async healthCheck(req, res) {
    res.json({ status: "ok", timestamp: new Date().toISOString(), zmq: zmqClient.healthCheck() });
  },
};
