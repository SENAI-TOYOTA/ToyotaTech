# Server

Backend serverless do ToyotaTech (AWS Lambda + API Gateway + DynamoDB + Cognito).

## Estrutura

```
apps/server/
├── services/
│   ├── auth/        # POST /auth/* + trigger PreSignUp do Cognito
│   ├── profile/     # GET|PUT /profile, GET /me
│   ├── garage/      # GET|POST /garage/*
│   └── tracking/    # GET /garage/status, POST /garage/ingest
├── shared/          # código comum entre as Lambdas
│   ├── response.py  # respostas HTTP padrão, CORS, log de erro
│   ├── cognito.py   # cliente Cognito, extração de token, atributos
│   └── dynamodb.py  # resource DynamoDB, helper get_table
└── legacy/
    └── auth_handler.py  # monolito original (referência até migração completa)
```

Cada pasta em `services/` vira uma Lambda independente. O `shared/` é empacotado junto no build de cada uma.
