# Backend — Google Apps Script

A planilha já foi criada no Google Drive:

**DUC Atacado — CRM e Score**

Spreadsheet ID:
`1-o30LNWA3To_UdyD_jn4FnIHp49uK-0Txqny7lAtkgw`

## Publicar o backend

1. Abra a planilha.
2. Vá em **Extensões → Apps Script**.
3. Apague o conteúdo padrão de `Code.gs` e cole o conteúdo deste arquivo `Code.gs`.
4. Em **Configurações do projeto**, confirme o fuso `America/Sao_Paulo`.
5. Clique em **Implantar → Nova implantação**.
6. Tipo: **Aplicativo da Web**.
7. Executar como: **Você**.
8. Quem tem acesso: **Qualquer pessoa**.
9. Clique em **Implantar** e autorize.
10. Copie a URL que termina em `/exec`.
11. Cole essa URL em `config.js` no campo `APPS_SCRIPT_URL`.
12. Faça novo deploy no Easypanel.

## Segurança do score

O navegador calcula um score apenas para a experiência visual, mas o Apps Script recalcula tudo antes de gravar. A planilha usa o valor do backend como fonte de verdade.

## Consultoras

Quando houver nomes, WhatsApps e regras de distribuição, preencha o array `CONSULTANTS` em `Code.gs`. O backend retornará a consultora e o telefone corretos após o cadastro.
