const express = require("express");
const router = express.Router();
const db = require("../db");

// Criar pedido
router.post("/", (req, res) => {
  const { usuario_id } = req.body;
  db.query("INSERT INTO pedidos (usuario_id) VALUES (?)", [usuario_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Pedido criado com sucesso!", pedidoId: result.insertId });
  });
});

module.exports = router;
