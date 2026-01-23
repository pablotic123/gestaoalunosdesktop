# 🎓 SGE - Sistema de Gestão Escolar

<div align="center">

![SGE Logo](https://img.shields.io/badge/SGE-Sistema%20de%20Gestão%20Escolar-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb)

**Sistema completo de gestão escolar desenvolvido com tecnologias modernas**

[🚀 Demo](#demo) • [📖 Documentação](#documentação) • [⚙️ Instalação](#instalação) • [🤝 Contribuir](#contribuindo)

</div>

---

## 📋 Sobre o Projeto

O **SGE (Sistema de Gestão Escolar)** é uma aplicação web full-stack moderna e escalável, desenvolvida para facilitar a administração de instituições de ensino. O sistema oferece uma interface intuitiva e responsiva para gerenciamento completo de alunos, turmas, cursos e usuários.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação JWT** - Sistema seguro de login com tokens
- 👥 **Gestão de Usuários** - Perfis de Administrador e Professor
- 📚 **CRUD de Cursos** - Gerenciamento completo de cursos com carga horária
- 🏫 **CRUD de Turmas** - Organização de turmas por curso, período e ano letivo
- 👨‍🎓 **CRUD de Alunos** - Cadastro detalhado com upload de fotos (Base64)
- 🖼️ **Grade de Fotos** - Visualização em cards dos alunos por turma
- 📊 **Dashboard Interativo** - Métricas em tempo real e gráficos
- 🔍 **Filtros e Buscas** - Pesquisa por nome, turma e status
- 🏢 **Configuração da Instituição** - Dados da escola/universidade
- 📱 **Design Responsivo** - Interface adaptável para todos os dispositivos

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework Python moderno e rápido para APIs
- **[MongoDB](https://www.mongodb.com/)** - Banco de dados NoSQL orientado a documentos
- **[Motor](https://motor.readthedocs.io/)** - Driver assíncrono do MongoDB para Python
- **[Pydantic](https://docs.pydantic.dev/)** - Validação de dados e serialização
- **[Python-Jose](https://github.com/mpdavis/python-jose)** - Implementação JWT para autenticação
- **[Passlib](https://passlib.readthedocs.io/)** - Criptografia de senhas com bcrypt

### Frontend
- **[React](https://react.dev/)** - Biblioteca JavaScript para interfaces de usuário
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Shadcn/UI](https://ui.shadcn.com/)** - Componentes de UI acessíveis e customizáveis
- **[Axios](https://axios-http.com/)** - Cliente HTTP para requisições à API
- **[React Router](https://reactrouter.com/)** - Roteamento declarativo
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficos para React
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificações toast elegantes
- **[Lucide React](https://lucide.dev/)** - Ícones modernos e consistentes

### DevOps & Ferramentas
- **[Supervisor](http://supervisord.org/)** - Gerenciador de processos
- **[Python-dotenv](https://github.com/theskumar/python-dotenv)** - Gerenciamento de variáveis de ambiente
- **[Yarn](https://yarnpkg.com/)** - Gerenciador de pacotes JavaScript

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Yarn** - [Instalação](https://yarnpkg.com/getting-started/install)
- **MongoDB 6.0+** - [Download](https://www.mongodb.com/try/download/community)

---

## ⚙️ Instalação

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/seu-usuario/sge-sistema-gestao-escolar.git
cd sge-sistema-gestao-escolar
```

### 2️⃣ Configuração do Backend

```bash
# Navegue até o diretório do backend
cd backend

# Crie um ambiente virtual Python
python -m venv venv

# Ative o ambiente virtual
# No Windows:
venv\Scripts\activate
# No Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

**Arquivo `.env` do Backend:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=sge_database
JWT_SECRET_KEY=sua-chave-secreta-super-segura-aqui
CORS_ORIGINS=http://localhost:3000,https://seu-dominio.com
```

### 3️⃣ Configuração do Frontend

```bash
# Navegue até o diretório do frontend
cd ../frontend

# Instale as dependências
yarn install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

**Arquivo `.env` do Frontend:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=false
```

### 4️⃣ Inicialize o Banco de Dados

```bash
# No diretório backend
python seed.py
```

Este comando criará:
- 2 usuários padrão (admin e professor)
- Cursos de exemplo
- Turmas de exemplo

Para popular com dados massivos (900 alunos):
```bash
python seed_full.py
```

---

## 🚀 Como Executar

### Opção 1: Execução Manual

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

Acesse: **http://localhost:3000**

### Opção 2: Com Supervisor (Produção)

```bash
# Certifique-se de ter o supervisor instalado
sudo apt-get install supervisor  # Linux
# ou
pip install supervisor  # Python

# Configure o supervisor (arquivo já incluído no projeto)
sudo cp supervisor.conf /etc/supervisor/conf.d/sge.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

---

## 📁 Estrutura do Projeto

```
sge-sistema-gestao-escolar/
├── backend/
│   ├── routes/
│   │   ├── auth_routes.py          # Rotas de autenticação
│   │   ├── students_routes.py      # CRUD de alunos
│   │   ├── courses_routes.py       # CRUD de cursos
│   │   ├── turmas_routes.py        # CRUD de turmas
│   │   ├── users_routes.py         # CRUD de usuários
│   │   ├── institution_routes.py   # Configuração da instituição
│   │   └── dashboard_routes.py     # Métricas do dashboard
│   ├── models.py                   # Modelos Pydantic
│   ├── auth.py                     # Lógica de autenticação JWT
│   ├── database.py                 # Conexão com MongoDB
│   ├── server.py                   # Aplicação FastAPI principal
│   ├── seed.py                     # Script de seed básico
│   ├── seed_full.py                # Script de seed completo
│   ├── requirements.txt            # Dependências Python
│   └── .env                        # Variáveis de ambiente
│
├── frontend/
│   ├── public/                     # Arquivos estáticos
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Componentes Shadcn/UI
│   │   │   └── Layout.js           # Layout principal
│   │   ├── contexts/
│   │   │   └── AuthContext.js      # Context de autenticação
│   │   ├── pages/
│   │   │   ├── LoginPage.js        # Página de login
│   │   │   ├── DashboardPage.js    # Dashboard
│   │   │   ├── StudentsPage.js     # Gestão de alunos
│   │   │   ├── PhotoGridPage.js    # Grade de fotos
│   │   │   ├── CoursesPage.js      # Gestão de cursos
│   │   │   ├── TurmasPage.js       # Gestão de turmas
│   │   │   ├── UsersPage.js        # Gestão de usuários
│   │   │   └── InstitutionPage.js  # Configuração instituição
│   │   ├── utils/
│   │   │   └── api.js              # Cliente Axios configurado
│   │   ├── App.js                  # Componente principal
│   │   ├── index.js                # Entry point
│   │   └── index.css               # Estilos globais
│   ├── package.json                # Dependências Node.js
│   ├── tailwind.config.js          # Configuração Tailwind
│   └── .env                        # Variáveis de ambiente
│
├── tests/                          # Testes automatizados
├── README.md                       # Este arquivo
└── LICENSE                         # Licença MIT
```

---

## 🔌 API Endpoints

### Autenticação
```http
POST   /api/auth/login       # Login do usuário
POST   /api/auth/register    # Registro de novo usuário
GET    /api/auth/me          # Dados do usuário autenticado
```

### Cursos
```http
GET    /api/courses          # Listar todos os cursos
POST   /api/courses          # Criar novo curso
GET    /api/courses/{id}     # Buscar curso por ID
PUT    /api/courses/{id}     # Atualizar curso
DELETE /api/courses/{id}     # Excluir curso
```

### Turmas
```http
GET    /api/turmas           # Listar todas as turmas
POST   /api/turmas           # Criar nova turma
GET    /api/turmas/{id}      # Buscar turma por ID
PUT    /api/turmas/{id}      # Atualizar turma
DELETE /api/turmas/{id}      # Excluir turma
```

### Alunos
```http
GET    /api/students         # Listar todos os alunos
POST   /api/students         # Criar novo aluno
GET    /api/students/{id}    # Buscar aluno por ID
PUT    /api/students/{id}    # Atualizar aluno
DELETE /api/students/{id}    # Excluir aluno
```

### Dashboard
```http
GET    /api/dashboard/metrics  # Obter métricas do sistema
```

### Usuários (Admin)
```http
GET    /api/users            # Listar usuários
POST   /api/users            # Criar usuário
GET    /api/users/{id}       # Buscar usuário
DELETE /api/users/{id}       # Excluir usuário
```

### Instituição
```http
GET    /api/institution      # Obter dados da instituição
PUT    /api/institution      # Atualizar dados da instituição
```

---

## 🔑 Credenciais de Teste

### Usuário Administrador
- **Email:** `admin`
- **Senha:** `#admin123%`
- **Perfil:** Administrador (acesso total)

### Usuário Professor
- **Email:** `professor`
- **Senha:** `#professor123%`
- **Perfil:** Professor (acesso limitado)

---

## 🎨 Screenshots

### Login
Interface moderna e limpa para autenticação de usuários.

### Dashboard
Visão geral com métricas em tempo real, gráficos interativos e alunos recentes.

### Gestão de Alunos
Listagem completa com fotos, filtros por turma e status, e formulário de cadastro intuitivo.

### Grade de Fotos
Visualização em cards com fotos dos alunos agrupadas por turma.

### CRUD de Cursos e Turmas
Interface amigável para gerenciamento completo de cursos e turmas.

---

## 🧪 Testes

```bash
# Backend - testes unitários
cd backend
pytest

# Frontend - testes de componentes
cd frontend
yarn test

# Testes E2E
yarn test:e2e
```

---

## 🚢 Deploy

### Backend (FastAPI)

**Heroku:**
```bash
git subtree push --prefix backend heroku main
```

**Docker:**
```bash
cd backend
docker build -t sge-backend .
docker run -p 8001:8001 sge-backend
```

### Frontend (React)

**Vercel:**
```bash
cd frontend
vercel --prod
```

**Netlify:**
```bash
cd frontend
yarn build
netlify deploy --prod --dir=build
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### 📝 Padrões de Código

- **Backend:** Siga a PEP 8 para Python
- **Frontend:** Use ESLint e Prettier configurados no projeto
- **Commits:** Mensagens em português, claras e descritivas

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Isso significa que você pode:

✅ Usar comercialmente  
✅ Modificar o código  
✅ Distribuir  
✅ Uso privado  

⚠️ **Limitações:**
- Sem garantias
- A licença e os direitos autorais devem ser incluídos

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2024 Sistema de Gestão Escolar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Suporte

Para dúvidas, sugestões ou problemas:

- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/sge-sistema-gestao-escolar/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/sge-sistema-gestao-escolar/discussions)
- 📧 **Email:** suporte@sge.com

---

## 🗺️ Roadmap

### Versão 2.0 (Planejado)
- [ ] Sistema de notas e avaliações
- [ ] Controle de frequência
- [ ] Geração de boletins em PDF
- [ ] Sistema de mensagens interno
- [ ] Calendário acadêmico
- [ ] Portal do aluno
- [ ] Portal dos pais
- [ ] Integração com sistemas de pagamento
- [ ] Relatórios avançados
- [ ] App mobile (React Native)

---

## 👏 Agradecimentos

- [FastAPI](https://fastapi.tiangolo.com/) pela excelente documentação
- [React](https://react.dev/) pela comunidade ativa
- [Shadcn/UI](https://ui.shadcn.com/) pelos componentes lindos
- [DiceBear](https://dicebear.com/) pela API de avatares
- Todos os contribuidores do projeto

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

Desenvolvido com ❤️ por [Seu Nome](https://github.com/seu-usuario)

[⬆ Voltar ao topo](#-sge---sistema-de-gestão-escolar)

</div>
