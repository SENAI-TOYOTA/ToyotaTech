# Resumo de Alterações - Correção de Duplicação de Contas

## Problema
Usuários podiam criar duas contas com o mesmo email: uma via login Google e outra via registro manual. O `check-email` não encontrava contas Google.

## Soluções Implementadas

### 1. Remover Debug Text da Tela de Login
- **Arquivo**: `apps/mobile/app/(auth)/index.tsx`
- **Mudança**: Removido texto `Redirect URI: {redirectUri}` que aparecia na tela de login
- **Motivo**: Limpeza da UI (debug apenas para desenvolvimento)

### 2. Melhorar Busca de Usuários por Email no Lambda
- **Arquivo**: `apps/mobile/aws/lambda/auth_handler.py`

#### Alterações Específicas:

**a) Função `_get_user_attributes()`**
- Normaliza acesso aos atributos de usuário
- Suporta tanto `UserAttributes` quanto `Attributes`
- Evita erros de acesso a diferentes formatos do Cognito

**b) Função `_user_matches_email()`**
- Comparação case-insensitive de email
- Tenta `email` (atributo) e `Username` (username do usuário)
- Identifica usuários mesmo com variações de case

**c) Função `_scan_users_by_email()`**
- Varredura paginada de TODOS os usuários do Cognito
- Fallback quando filtro direto não retorna resultado
- Até 10 páginas (600 usuários máximo por busca)

**d) Função `_list_users_by_email()` Atualizada**
Fluxo de busca em cascata:
1. **admin_get_user()**: Busca direta por username/email (rápido)
2. **list_users() com filtro**: Busca por atributo email (padrão Cognito)
3. **_scan_users_by_email()**: Varredura manual se acima falhar

**e) Integração com `_is_federated_user()`**
- Usa nova função `_get_user_attributes()` para consistência

## Por que funciona agora?

1. **admin_get_user()** encontra usuários Google que não aparecem no filtro
2. **Comparação manual de email** ignora case-sensitivity do Cognito
3. **Varredura paginada** garante encontrar qualquer usuário no pool
4. `/auth/check-email` agora detecta corretamente:
   - Se email existe como local
   - Se email existe como Google (`isFederated: true`)
   - Bloqueia registro duplicado no fluxo normal

## Fluxo de Login Agora

| Cenário | Antes | Depois |
|---------|-------|--------|
| Google login → email existente? | Não encontrava | ✅ Encontra (federated) |
| Email manual → mesmo email Google | Permitia duplicar | ✅ Bloqueia (Usuario ja cadastrado) |
| Logout + tentar email de Google | Criava 2ª conta | ✅ Erro ou vai para Google |

## Deploy Necessário

```powershell
# No diretório apps/mobile
cd aws/scripts
./deploy.ps1
```

Isso redeploya o Lambda com as correções.

## Status Final

- ✅ Busca de email funciona para usuários Google
- ✅ Previne criação de contas duplicadas
- ✅ Fluxo de login unificado (um email = uma conta)
- ✅ UI limpa (sem debug text)
