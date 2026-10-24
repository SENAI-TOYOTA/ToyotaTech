# 07 – Camada de Aplicação (Web e Mobile)

## 1. Objetivo

Levantar o estado atual das aplicações *Web e Mobile* desenvolvidas no semestre anterior e mapear lacunas para integração com o novo ecossistema *IoT*, considerando as funcionalidades já implementadas e as necessidades futuras de integração com backend e serviços externos.

---

# 2. Levantamento da Stack

## Web

* Framework: React
* Versão: 19.2.0
* Gerenciamento de estado: Redux Toolkit
* Biblioteca de UI: Tailwind CSS, Lucide React
* Comunicação com backend: API REST
* Autenticação: JWT

---

## Mobile

* Framework: Expo (React Native)
* Versão: 54.0.23
* Comunicação com backend: API REST
* Autenticação: JWT
* Plataforma alvo: Android (principal), iOS (suporte futuro)

---

# 3. Mapeamento das Telas Existentes

| **Tela**                   | **Implementada** | **Integrada ao Backend** | **Observações**                          |
| -------------------------- | ---------------- | ------------------------ | ---------------------------------------- |
| Login Cliente              | Sim              | Não                      | Necessário implementar autenticação      |
| Cadastro Cliente           | Sim              | Não                      | Necessário implementar integração        |
| Verificação de Email       | Não              | Não                      | Necessário desenvolver funcionalidade    |
| Home Cliente               | Sim              | Não                      | Necessário integrar com backend          |
| Gestão de Veículo          | Sim              | Não                      | Necessário integrar com backend          |
| Perfil                     | Sim              | Não                      | Necessário implementar funcionalidades   |
| Financiamento Cliente      | Sim              | Não                      | Necessário implementar lógica de backend |
| Pedido Cliente             | Sim              | Não                      | Necessário implementar lógica de backend |
| Acompanhamento de Produção | Sim              | Não                      | Necessário implementar lógica de backend |
| Login Administrador        | Sim              | Não                      | Necessário implementar autenticação      |
| Home Administrador         | Sim              | Não                      | Necessário implementar integração        |
| Dashboard Administrador    | Sim              | Não                      | Necessário implementar integração        |
| Status de Compra (Adm)     | Sim              | Não                      | Necessário implementar integração        |
| Manutenção                 | Não              | —                        | Tela ainda não desenvolvida              |

---

# 4. Fluxo Atual do Usuário

O usuário acessa a aplicação *Web ou Mobile* e interage com o sistema através de autenticação, consulta de informações do veículo, acompanhamento de pedidos e acesso a serviços relacionados ao seu carro.

## 4.1 Acesso Inicial

Ao abrir a aplicação, o usuário visualiza duas opções:

- *Login*
- *Cadastro*

---

## 4.2 Cadastro

Caso o usuário ainda não possua conta:

1. Usuário informa seu *email*
2. Sistema envia um *código de verificação*
3. Usuário confirma o código recebido
4. Usuário define sua *senha*
5. Conta é criada no sistema
6. Usuário é autenticado utilizando *JWT*
7. Usuário é redirecionado para a *Home*

---

## 4.3 Login

Caso o usuário já possua conta:

1. Usuário insere *email e senha*
2. Sistema valida as credenciais
3. Sistema gera um *token JWT*
4. Usuário é autenticado
5. Usuário é redirecionado para a *Home*

---

## 4.4 Home

Após autenticação, o usuário acessa a *tela principal do aplicativo*.

Nesta tela são exibidos:

- Banner com informações do veículo
- Botão *Verificar Status*
- Área de conteúdos (notícias e novidades da marca)

---

## 4.5 Gestão do Veículo

Ao clicar em *Verificar Status*, o usuário acessa a área de gestão do veículo, que reúne:

- Nota fiscal do veículo
- CRLV-e (documento digital)
- Documentos do veículo
- Manual digital
- Informações de recall

Essa área também pode apresentar o *status de pedidos ou produção do veículo*.

---

## 4.6 Navegação Principal

O aplicativo possui uma navegação principal (tabs no mobile) com quatro áreas principais:

*Financiamento*

- Informações sobre financiamento
- Simulações e status de pagamento

*Veículo*

- Gestão de documentos
- Informações técnicas
- Recall
- Status do veículo

*Notificações*

- Alertas de recall
- Atualizações do sistema
- Notificações sobre pedidos

*Perfil*

- Informações do usuário
- Configurações da conta
- Logout

---

# 5. Limitações Atuais

Atualmente foram identificadas algumas limitações no estado atual das aplicações:

- Atualizações não ocorrem em tempo real
- Algumas telas ainda não possuem integração com o backend
- Falta padronização completa entre as versões Web e Mobile
- Ausência de integração com dados externos ou dispositivos IoT

---

# 6. Lacunas Identificadas

Durante a análise da aplicação foram identificadas as seguintes lacunas:

* Não existe atualização em tempo real do status de produção
* Não existe dashboard de eventos do veículo
* Não existe histórico detalhado de etapas do pedido
* Não existe módulo de recomendação de opcionais
* Não existe integração completa com financiamento
* Não existe módulo de manutenção e revisões

---

# 7. Comunicação com Backend

As aplicações Web e Mobile irão consumir APIs REST fornecidas pelo backend.
A autenticação será realizada utilizando JWT (JSON Web Token), garantindo segurança no acesso aos dados do usuário.

## Endpoints previstos

### Produção do Veículo

**Endpoint**

GET /api/producao/{vin}

**Descrição**

Retorna o status atual de produção do veículo identificado pelo **VIN**.

---

### Recomendações de Opcionais

**Endpoint**

GET /api/recomendacoes/{clienteId}

**Descrição**

Retorna recomendações personalizadas de opcionais ou serviços com base no perfil do cliente.

---

### Autenticação

**Endpoints**

POST /api/auth/login  
POST /api/auth/cadastro  
POST /api/auth/verificacao-email

**Descrição**

Responsáveis por login, cadastro e verificação de conta.

---

## Possível Evolução da Comunicação

Para funcionalidades que exigem **atualização em tempo real**, poderá ser utilizado:

- WebSocket
- Server-Sent Events (SSE)

Isso permitirá atualização automática de informações como:

- Status de produção
- Alertas do veículo
- Notificações importantes ao usuário
