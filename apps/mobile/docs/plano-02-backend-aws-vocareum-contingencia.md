# Plano 02 - Contingência para limitações do Vocareum

## Quando usar este plano
Usar se o laboratório bloquear parte da arquitetura ideal (ex.: múltiplas Lambdas, authorizer, serviços auxiliares) ou se houver pouco tempo de sessão.

## Estratégia de simplificação
1. **Uma Lambda única** (`auth-handler`) com roteamento interno por path/método.
2. **Uma tabela DynamoDB única** (`app-dev`) com chave composta:
   - `PK` = `USER#<email>`
   - `SK` = `PROFILE`
3. **API Gateway mínimo** com apenas 3 endpoints:
   - `POST /auth/register`
   - `POST /auth/login`
   - `GET /me`

## Trade-off aceito
- Menos modularidade no backend para ganhar velocidade e viabilidade no lab.
- Segurança avançada adiada (authorizer dedicado, refresh token, bloqueio por IP).

## Execução rápida (ordem recomendada)
1. Subir infraestrutura mínima com um deploy.
2. Implementar `register` e `login`.
3. Implementar `GET /me` validando JWT no código da Lambda.
4. Integrar mobile e validar fluxo ponta a ponta.

## Estratégia para persistência e recuperação no lab
- Guardar templates IaC e scripts de deploy no repositório.
- Manter variáveis em arquivo de exemplo (`.env.example`) sem segredos reais.
- Documentar comando de teardown para limpar recursos ao fim da sessão.

## Critérios de sucesso do plano de contingência
- Login funcional no app mesmo com infraestrutura simplificada.
- Backend recriável rapidamente após reset do Vocareum.
- Sem dependência de serviços potencialmente bloqueados.

