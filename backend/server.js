require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

require('./config/passport-setup'); // Carrega a configuração do Passport

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
    origin: 'http://localhost:8080', // Troque pelo seu domínio front-end
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'seu_segredo', // Use uma variável de ambiente
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const MONGODB_URI = process.env.MONGODB_URI; // Carrega a variável de ambiente

// Debugging: Verifique se a variável de ambiente está sendo carregada corretamente
console.log('MONGODB_URI:', MONGODB_URI);

// Conectar ao MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Configuração do servidor HTTP e Socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Eventos do Socket.io
io.on('connection', (socket) => {
    console.log('Novo usuário conectado');

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Usuário entrou na sala ${roomId}`);
    });

    socket.on('playMusic', (music) => {
        socket.to(music.roomId).emit('musicPlayed', music);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
        // Remover o usuário de salas, se necessário
    });
});

// Rotas de Autenticação
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Sucesso na autenticação
        res.redirect('/'); // Redirecione para a página desejada após o login
    }
);

// Rota básica (opcional, para teste)
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
