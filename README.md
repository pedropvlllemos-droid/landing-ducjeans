# DUC Atacado — GitHub em raiz única

Todos os arquivos deste pacote devem ser enviados **diretamente para a raiz do repositório**, sem criar pastas. O `Dockerfile` já está ajustado para isso.

Arquivos `Code.gs`, `appsscript.json` e os READMEs ficam na raiz do GitHub apenas como suporte; o Docker **não os publica no site**.

# DUC Atacado — publicação no Easypanel

Este pacote está pronto para publicação via Docker/Nginx.

## Estrutura

- `Dockerfile` — imagem Nginx para o Easypanel
- `nginx.conf` — configuração do servidor
- `` — arquivos públicos do site
- `config.js` — URL do backend, Pixel e configurações rápidas
- `backend-google-apps-script/` — backend do formulário
- `docs/` — documentação da planilha e score

## Easypanel

1. Suba esta pasta para um repositório GitHub.
2. No Easypanel, crie um novo **App** apontando para o repositório.
3. Use o `Dockerfile` da raiz; não é necessário definir comando de start.
4. Porta interna: **80**.
5. Configure o domínio desejado na aba de domínios.
6. Faça o deploy.

O site já pode ir ao ar antes do backend. Porém o formulário só concluirá o envio depois que `APPS_SCRIPT_URL` estiver preenchida em `config.js`.

## Depois de publicar o Apps Script

Edite:

`config.js`

E cole a URL `/exec` em:

```js
APPS_SCRIPT_URL: 'COLE_AQUI'
```

Depois faça commit e redeploy.
