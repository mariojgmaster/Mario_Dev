# Mario_Dev

Repo do site de `mariooliveiradev.online`.

## Branches

- `master`: base estável do projeto
- `deploy`: branch usada para deploy automático e alterações operacionais

## Arquivos

- `index.html`: página pública do site
- `nginx.conf`: configuração do NGINX para servir o site

## Deploy

Na VPS, o site é servido em `/var/www/mariooliveiradev.online`.

Se o repositório for atualizado na branch `deploy`, a VPS deve executar `git pull origin deploy` e recarregar o NGINX quando necessário.
