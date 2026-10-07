# CRUD de Usuários com JWT e PWA

Projeto didático simples com:

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Swagger
- HTML
- CSS
- JavaScript
- PWA

## Estrutura

```text
crud_usuario_jwt_pwa/
├── frontend/
│   ├── auth.js
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── style.css
│   ├── usuarios.html
│   └── usuarios.js
├── src/
│   ├── config/
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── adminMiddleware.js
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Executar

1. Instale o MongoDB localmente ou use MongoDB Atlas.
2. Copie `.env.example` para `.env`.
3. Ajuste `MONGO_URI`.
4. Instale as dependências:

```bash
npm install
```

5. Execute:

```bash
npm run dev
```

6. Abra:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/api-docs
```

## Fluxo simples

1. Cadastre um usuário.
2. Para testar autorização, cadastre um usuário com `role` igual a `admin`.
3. Faça login.
4. O token JWT será salvo no `localStorage`.
5. Usuários autenticados podem listar e consultar usuários.
6. Apenas usuários `admin` podem criar, editar e excluir pela rota `/api/users`.

## Endpoints

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

Este projeto é propositalmente simples e voltado para demonstração em aula. Não possui validações, tratamento completo de erros ou regras de segurança para produção.


## Frontend

A aplicação possui duas telas:

- `/` contém login e cadastro público.
- `/usuarios.html` contém o CRUD protegido e redireciona para o login quando não existe token JWT no navegador.
