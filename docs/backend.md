# 05 – Backend

---

# 1. Objetivo

Mapear o estado atual do backend desenvolvido no semestre anterior e estruturar sua documentação técnica no padrão utilizado pelo mercado.

Este documento reflete **a situação real do projeto**, com base na análise dos arquivos fornecidos (Program.cs, .csproj, Controllers e configurações de autenticação e banco de dados).

---

# 2. Levantamento Inicial Obrigatório

## 2.1 Stack Tecnológica

### Stack Identificada

- **Linguagem:** C#
- **Plataforma:** .NET 8
- **Framework:** ASP.NET Core 8 (Web API)
- **ORM:** Entity Framework Core 8
- **Provider do ORM:** Npgsql.EntityFrameworkCore.PostgreSQL 8.0.4
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (Bearer Token, Stateless)
- **Documentação de API:** Swagger / OpenAPI (Swashbuckle 6.5.0)
- **Padrão Arquitetural:** Monolito baseado em Controllers (API REST)
- **Gerenciamento de Dependências:** NuGet
- **Modelo de Execução:** API REST Stateless

---

# 3. Arquitetura Atual do Backend

## 3.1 Estrutura de Camadas

A aplicação está estruturada no seguinte formato:

Controller → ApplicationDbContext (Entity Framework)

### Camadas identificadas

- Controller
- DbContext (persistência via Entity Framework)

### Camadas não identificadas

- Service
- Repository Pattern separado
- Camada de Domínio isolada
- Clean Architecture
- DDD (Domain-Driven Design)

A persistência é realizada diretamente nos Controllers através da injeção do `ApplicationDbContext`.

---

## 3.2 DTO (Data Transfer Object)

Existe apenas um DTO identificado:

- `LoginRequest` (utilizado no AuthController)

Não existem DTOs para as demais entidades (Pedido, Veiculo, Usuario, Financiamento, etc.).  
As entidades do banco são retornadas diretamente nas respostas da API.

---

## 3.3 Camada de Domínio

Não existe camada de domínio separada.  
As entidades estão diretamente vinculadas ao Entity Framework e ao banco de dados.

---

## 3.4 Tratamento Global de Exceções

Não foi identificado:

- Middleware global de exceções
- Filtro global de exceções
- Padronização de resposta de erro

O tratamento ocorre pontualmente dentro de alguns métodos.

---

## 3.5 Padrão de Logs

Não foi identificado:

- Uso estruturado de `ILogger`
- Logging externo (Serilog, Elastic, etc.)
- Estratégia de auditoria

---

## 3.6 Validação

Existe validação básica utilizando:

- `ModelState.IsValid`

Não foi identificado:

- FluentValidation
- Validação de domínio
- Regras de negócio centralizadas

---

# 4. Documentação Formal dos Endpoints

---

## 🔐 Login

### Nome da Funcionalidade

Autenticação de usuário

### Endpoint

```
POST /auth/login
```

### Método HTTP

POST

### Autenticação

Não requer autenticação

### Body

```json
{
  "email": "string",
  "senha": "string"
}
```

### Response 200

```json
{
  "token": "jwt_token"
}
```

### Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 401 | Credenciais inválidas |

**Observação técnica:** Senha validada diretamente no banco, sem criptografia identificada.

---

## 👤 Cadastro de Cliente – Pessoa Física

### Endpoint

```
POST /api/PessoaFisica
```

### Método HTTP

POST

### Autenticação

Não protegida por `[Authorize]`

### Response 201

Retorna objeto PessoaFisica criado.

### Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida |

---

## 🏢 Cadastro de Cliente – Pessoa Jurídica

### Endpoint

```
POST /api/PessoaJuridica
```

### Método HTTP

POST

### Autenticação

Não protegida

---

## 📦 Cadastro de Pedido

### Endpoint

```
POST /api/Pedido
```

### Método HTTP

POST

### Autenticação

Não protegida

### Response 201

Retorna objeto Pedido criado.

---

## 📦 Consulta de Pedido

### Buscar todos

```
GET /api/Pedido
```

### Buscar por ID

```
GET /api/Pedido/{id}
```

### Buscar por Cliente

```
GET /api/Pedido/Cliente/{idCliente}
```

### Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 404 | Pedido não encontrado |

---

## 🚗 Consulta de Veículo

### Buscar todos

```
GET /api/Veiculo
```

### Buscar por ID

```
GET /api/Veiculo/{id}
```

### Buscar por Marca

```
GET /api/Veiculo/Marca/{marca}
```

### Buscar por Modelo

```
GET /api/Veiculo/Modelo/{modelo}
```

### Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 404 | Veículo não encontrado |

---

## 💰 Financiamento

### Cadastro

```
POST /api/Financiamento
```

### Consulta

```
GET /api/Financiamento
GET /api/Financiamento/{id}
```

### Atualização

```
PUT /api/Financiamento/{id}
```

### Exclusão

```
DELETE /api/Financiamento/{id}
```

---

## 📍 Endpoints de Manutenção

CRUD completo identificado para:

- Endereco → `/api/Endereco`
- Telefone → `/api/Telefone`
- Usuario → `/api/Usuario`

### Operações padrão

- GET
- POST
- PUT
- DELETE

---

# 5. Endpoints que DEVEM ser mapeados

| Funcionalidade | Status |
|---|---|
| Cadastro de Cliente | Implementado |
| Cadastro de Pedido | Implementado |
| Consulta de Pedido | Implementado |
| Consulta de Veículo | Implementado |
| Atualização de Status | Não implementado |
| Login | Implementado |
| Registro | Não implementado |
| Endpoint financeiro | Implementado |
| Endpoint de financiamento | Implementado |

---

## ❌ Atualização de Status

Endpoint específico para atualização de status de produção:

Endpoint não encontrado no projeto atual.  
**Necessário implementação.**

---

## ❌ Registro Público de Usuário

Endpoint público de registro:

Endpoint não encontrado no projeto atual.  
**Necessário implementação.**

---

# 6. Situação Geral Atual

O backend encontra-se funcional para:

- Cadastro de clientes (Pessoa Física e Jurídica)
- Cadastro e consulta de pedidos
- Cadastro e consulta de veículos
- Cadastro e consulta de financiamentos
- Cadastro de usuários, endereços e telefones
- Autenticação via JWT

---

## Diagnóstico Técnico Objetivo

- Arquitetura monolítica
- Sem camada Service
- Sem Repository Pattern
- Sem Clean Architecture
- Persistência direta via DbContext nos Controllers
- JWT implementado
- Endpoints não protegidos com `[Authorize]`
- Senhas armazenadas sem criptografia
- Sem modelagem de etapas de produção
- Sem controle de eventos
- Sem logging estruturado
- Sem tratamento global de exceções
- Sem versionamento de API
- Sem padronização de responses

---

## Conclusão técnica

O backend está funcional para operações CRUD das principais entidades, porém apresenta arquitetura simplificada e necessita evolução estrutural para atingir padrão de mercado em termos de segurança, organização, escalabilidade e boas práticas.