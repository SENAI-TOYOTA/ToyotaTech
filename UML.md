# Diagrama de Classes (Toyota Tech)

> Diagrama de Classes do Projeto Integrador Toyota Tech, contendo atríbutos e métodos das respectivas classes.

***

1. **Cliente:**

```mermaid
        classDiagram
        class Cliente{
            - id_cliente : int
            - tipo_pessoa : string
            + CRUD()
        }
```

2. **Endereco:**

```mermaid
        classDiagram
        class Endereco{
            - id_endereco : int
            - id_cliente : int
            - logradouro : string
            + CRUD ()
        }
```

3. **Telefone:**

```mermaid
        classDiagram
        class Telefone{
            - id_telefone : int
            - id_cliente : int
            - numero : string
            + CRUD ()
        }
```

4. **Email:**

```mermaid
        classDiagram
        class Email{
            - id_email : int
            - id_cliente : int
            - email : string
            + CRUD ()
        }
```

5. **Veículo:**

```mermaid
        classDiagram
        class Veiculo{
            - id_telefone : int
            - modelo : string
            - marca : string
            - ano : int
            + CRUD ()
        }
```

6. **Pedido:**

```mermaid
        classDiagram
        class Pedido{
            - id_pedido : int
            - id_cliente : int
            - id_veiculo : int
            - id_vendedor : int
            - id_financiamento : int
            - data_pedido : date
            + CRUD ()
        }
```

7. **Conta:**

```mermaid
        classDiagram
        class Conta{
            - id_conta : int
            - id_cliente : int
            - tipo_conta : string
            + CRUD ()
        }
```

8. **Pagamento:**

```mermaid
        classDiagram
        class Pagamento{
            - id_pagamento : int
            - id_pedido : int
            - valor : decimal
            - data_pagamento : date
            + CRUD ()
        }
```

9. **Financiamento:**

```mermaid
        classDiagram
        class Financiamento{
            - id_financiamento : int
            - banco : string
            - taxa_juros : decimal
            + CRUD ()
        }
```

10. **Vendedor:**

```mermaid
        classDiagram
        class Vendedor{
            - id_vendedor : int
            - nome : string
            + CRUD ()
        }
```

11. **Concessionaria:**

```mermaid
        classDiagram
        class Concessionaria{
            - id_concessionaria : int
            - nome : string
            + CRUD ()
        }
```