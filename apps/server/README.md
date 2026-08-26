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
├── layers/common/python/common/  # código comum entre as Lambdas (Layer)
│   ├── responses.py      # respostas HTTP padrão, CORS, log de erro
│   ├── cognito.py        # cliente Cognito, extração de token, atributos
│   ├── cognito_users.py  # busca e vínculo de usuários Cognito
│   └── ddb.py            # resource DynamoDB, helper get_table
└── template.yaml         # SAM: 4 Lambdas + HttpApi + 4 DynamoDB + Cognito
```

Cada pasta em `services/` vira uma Lambda independente. O `layers/common` é empacotado como Layer.
