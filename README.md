# Mario_Dev

Repo do site de `mariooliveiradev.online`.

## Branches

- `master`: base estável do projeto
- `deploy`: branch usada para deploy automático e alterações operacionais

## Arquivos

- `index.html`: página pública do site
- `nginx.conf`: configuração do NGINX para servir o site
- `webhook-server.js`: listener de webhook do GitHub para atualizar a VPS

## Deploy

Na VPS, o site é servido em `/var/www/mariooliveiradev.online`.

O serviço de webhook roda em `127.0.0.1:3000` e usa estas variáveis de ambiente:

- `PORT`
- `REPO_DIR`
- `GIT_BRANCH`
- `WEBHOOK_SECRET`

Quando o GitHub enviar um `push` para a branch `deploy`, a VPS faz `git pull --ff-only origin deploy` no diretório do site.

## Webhook

Configure o webhook do GitHub para:

- URL: `https://mariooliveiradev.online/webhook`
- Content type: `application/json`
- Event: `push`
- Secret: o valor definido em `WEBHOOK_SECRET`
