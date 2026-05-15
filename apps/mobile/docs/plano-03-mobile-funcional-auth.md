# Plano 03 - Mobile funcional (além do visual)

## Diagnóstico atual
As telas de autenticação já existem, porém o fluxo está apenas visual (navegação local sem backend real).

## Objetivo
Transformar o fluxo de auth em funcional, conectando com a API AWS e controlando estado de sessão no app.

## Escopo de implementação
1. **Camada de API**
   - Criar cliente HTTP central (`services/api.ts`) com base URL por variável de ambiente.
   - Criar serviços de autenticação (`register`, `login`, `verifyEmail`, `me`).
2. **Estado de autenticação**
   - Criar `AuthContext` com:
     - `user`,
     - `token`,
     - `isAuthenticated`,
     - `signIn`, `signUp`, `signOut`, `loadSession`.
   - Persistir token com storage seguro.
3. **Guarda de rotas**
   - Bloquear acesso às tabs se não autenticado.
   - Redirecionar para auth quando token expirar/inválido.
4. **Funcionalizar telas já existentes**
   - `index.tsx`: coletar e-mail e validar aceite de termos.
   - `register.tsx`: senha real com regras mínimas.
   - `verify-email.tsx`: validar código (real ou mock do ambiente dev).
   - `login.tsx`: autenticar e abrir app logado.
5. **Feedback de UX**
   - Loading em botões de ação.
   - Mensagens de erro por campo e erro global.
   - Desabilitar submit quando formulário inválido.

## Sequência recomendada
1. Subir backend (Plano 01 ou 02).
2. Implementar camada de API e contexto de auth.
3. Conectar telas auth.
4. Implementar proteção de rotas.
5. Ajustar mensagens/estados de loading.

## Critérios de pronto
- Usuário consegue: cadastrar, verificar (quando exigido), logar e permanecer logado.
- Ao reiniciar o app, sessão válida é restaurada.
- Sem token válido, usuário retorna para fluxo de login.

## Riscos e mitigação
- **API instável no lab**: aplicar timeout e mensagens claras de indisponibilidade.
- **Expiração da sessão Vocareum**: fallback para modo dev com mock controlado por flag.
- **Erros de contrato API/mobile**: definir payloads e respostas antes da integração.

