// backend/server.js

// Importando as ferramentas necessárias
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// Criando o servidor
const app = express();

// Configurações básicas
app.use(express.json());
app.use(cors());

// Conectando ao banco de dados
mongoose.connect('mongodb://localhost/sabor-arte', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Definindo como será um usuário no banco de dados
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String
});

const User = mongoose.model('User', userSchema);

// Rota para criar novo usuário (cadastro)
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Verifica se já existe esse email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    
    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Cria o novo usuário
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    
    await user.save();
    
    res.json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// Rota para login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Busca o usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou senha incorretos' });
    }
    
    // Verifica a senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email ou senha incorretos' });
    }
    
    res.json({ 
      message: 'Login realizado com sucesso',
      user: { email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// Inicia o servidor
app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});