CREATE DATABASE IF NOT EXISTS tcc_db;
USE tcc_db;

CREATE TABLE propostas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    titulo VARCHAR(255),
    descricao TEXT,
    status ENUM('pendente','aprovada','rejeitada') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historico_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    evento VARCHAR(50),
    resultado JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    tipo VARCHAR(50),
    caminho VARCHAR(255),
    versao INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    feedback TEXT,
    tipo ENUM('parcial','final'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bancas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tcc_id INT NOT NULL,
    avaliador_id INT NOT NULL,
    nota DECIMAL(4,2),
    comentario TEXT,
    status ENUM('pendente','finalizado') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT,
    tipo ENUM('parcial','banca','final'),
    nota DECIMAL(4,2),
    origem VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);