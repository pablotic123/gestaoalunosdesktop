# 🖥️ SGE Desktop - Guia de Instalação e Uso

## 📋 Pré-requisitos

Antes de executar o SGE Desktop, certifique-se de ter instalado:

### 1. MongoDB (Obrigatório)
O SGE utiliza MongoDB como banco de dados. Você precisa instalá-lo:

**Windows:**
1. Baixe o MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Execute o instalador (escolha "Complete")
3. Marque "Install MongoDB as a Service" para iniciar automaticamente
4. Conclua a instalação

**Verificar se está rodando:**
```bash
# Abra o Prompt de Comando e digite:
mongod --version
```

### 2. Python 3.11+ (Para desenvolvimento)
Se você vai desenvolver ou modificar o sistema:
1. Baixe: https://www.python.org/downloads/
2. Durante instalação, marque "Add Python to PATH"

---

## 🚀 Instalação do SGE Desktop

### Opção 1: Usar o Instalador (Recomendado)
1. Execute o arquivo `SGE - Sistema de Gestão Escolar-Setup-1.0.0.exe`
2. Siga as instruções do instalador
3. O SGE será instalado e um atalho será criado na área de trabalho

### Opção 2: Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sge-sistema-gestao-escolar.git
cd sge-sistema-gestao-escolar

# Instale as dependências do backend
cd backend
pip install -r requirements.txt

# Instale as dependências do frontend
cd ../frontend
yarn install

# Inicie em modo desenvolvimento
yarn electron:dev
```

---

## 🔧 Configuração

### Variáveis de Ambiente do Backend

Crie um arquivo `.env` na pasta `backend` com:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=sge_database
JWT_SECRET_KEY=sua-chave-secreta-aqui
CORS_ORIGINS=*
```

### Primeiro Acesso

Após a instalação, execute o seed para criar dados iniciais:

```bash
cd backend
python seed.py
```

**Credenciais padrão:**
- **Admin:** `admin` / `#admin123%`
- **Professor:** `professor` / `#professor123%`

---

## 📦 Gerar Instalador (Para Distribuição)

### Windows
```bash
cd frontend
yarn electron:build:win
```

O instalador será gerado em `frontend/dist/`

### macOS
```bash
yarn electron:build:mac
```

### Linux
```bash
yarn electron:build:linux
```

---

## 🐛 Solução de Problemas

### "Servidor Offline" ao abrir o app
1. Verifique se o MongoDB está rodando
2. Abra o Gerenciador de Serviços do Windows (services.msc)
3. Procure por "MongoDB Server" e inicie se necessário

### Erro de conexão com banco de dados
1. Verifique se o MongoDB está instalado corretamente
2. Confirme que está rodando na porta padrão 27017
3. Tente reiniciar o serviço do MongoDB

### Tela branca ou app não carrega
1. Pressione Ctrl+Shift+I para abrir o DevTools
2. Verifique erros no console
3. Reinicie o aplicativo

---

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação completa no README.md

---

## 📜 Licença

MIT License - Veja o arquivo LICENSE para mais detalhes.
