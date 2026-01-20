# Flagee Script Injection

App plugin para injetar CSS e Javascript no Grafana sem precisar de Google Tag Manager.

## Build

```bash
cd /ariusmonitor/server/grafana-plugin
npm install
npm run build
```

O build gera o diretório `dist/` com o plugin pronto para o Grafana.

## Configuracao

- Acesse **Administration > Plugins > Flagee Script Injection**.
- Abra a aba **Config** para definir CSS, Javascript inline e URLs externas.
- Atualize o navegador para aplicar as alteracoes se o Grafana nao recarregar automaticamente.
