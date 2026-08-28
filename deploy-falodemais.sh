#!/usr/bin/env bash
# Deploy deste repo pro site falodemais no Neocities.
# Usa uma API key própria (arquivo .neocities, git-ignored), sem mexer
# na config global do CLI que hoje está autenticada no site bibianca.
set -euo pipefail
cd "$(dirname "$0")"

KEY_FILE=".neocities"
TARGET_SITE="falodemais"

if [ ! -f "$KEY_FILE" ]; then
  echo "Erro: arquivo $KEY_FILE não encontrado." >&2
  echo "Crie esse arquivo na raiz do repo contendo só a API key do site $TARGET_SITE (uma linha)." >&2
  exit 1
fi

export NEOCITIES_API_KEY
NEOCITIES_API_KEY="$(tr -d '[:space:]' < "$KEY_FILE")"

strip_ansi() { sed -E 's/\x1b\[[0-9;]*m//g'; }

SITE="$(neocities info 2>&1 | strip_ansi | tr -d '\r' | awk '/^sitename/{print $2}')"

if [ "$SITE" != "$TARGET_SITE" ]; then
  echo "Erro: essa API key aponta pro site '$SITE', não '$TARGET_SITE'." >&2
  echo "Abortando pra não sobrescrever o site errado." >&2
  exit 1
fi

if [ "${1:-}" = "--live" ]; then
  echo "Site confirmado: $SITE. Enviando de verdade..."
  neocities push . -e "$KEY_FILE" -e deploy-falodemais.sh
else
  echo "Site confirmado: $SITE. Fazendo dry-run (nada será enviado)."
  echo "Quando estiver tudo certo, rode: ./deploy-falodemais.sh --live"
  neocities push . -e "$KEY_FILE" -e deploy-falodemais.sh --dry-run
fi
