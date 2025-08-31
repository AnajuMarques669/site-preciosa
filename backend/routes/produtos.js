const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar produtos
router.get('/', (req, res) => {
  db.query('SELECT * FROM produtos', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Cadastrar produto
router.post('/', (req, res) => {
  const { nome, preco, categoria, imagem } = req.body;
  db.query(
    'INSERT INTO produtos (nome, preco, categoria, imagem) VALUES (?, ?, ?, ?)',
    [nome, preco, categoria, imagem],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json({ id: results.insertId, nome, preco, categoria, imagem });
    }
  );
});

module.exports = router;
