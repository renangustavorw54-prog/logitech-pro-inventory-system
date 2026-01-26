# Correção do Erro de Build no Railway

## 🎯 Problema Identificado

O projeto estava apresentando erro durante o processo de build no Railway com a seguinte mensagem:

```
ELIFECYCLE Command failed with exit code 1.
"pnpm run build" did not complete successfully: exit code: 1
```

## 🔍 Diagnóstico

Ao executar o comando `pnpm run build` localmente, foram identificados os seguintes erros:

1. **Erro com arquivos nativos (.node)**: O esbuild estava tentando fazer bundle de arquivos binários nativos do Tailwind CSS e Lightning CSS
2. **Erro com lightningcss**: `Could not resolve "../pkg"`
3. **Erro com @tailwindcss/oxide**: `No loader is configured for ".node" files`
4. **Erro com @babel/preset-typescript**: Tentativa de incluir arquivos que não deveriam estar no bundle

## ✅ Solução Implementada

A correção foi feita no arquivo `package.json`, no script de build, adicionando as seguintes dependências como **external** (para não serem incluídas no bundle):

### Antes:
```json
"build": "vite build && esbuild server/_core/index.ts --platform=node --bundle --format=esm --outdir=dist --minify --external:express --external:dotenv --external:@trpc/server --external:mysql2 --external:drizzle-orm"
```

### Depois:
```json
"build": "vite build && esbuild server/_core/index.ts --platform=node --bundle --format=esm --outdir=dist --minify --external:express --external:dotenv --external:@trpc/server --external:mysql2 --external:drizzle-orm --external:lightningcss --external:@tailwindcss/oxide --external:@tailwindcss/oxide-* --external:@babel/preset-typescript --packages=external"
```

### Mudanças aplicadas:
- ✅ `--external:lightningcss` - Exclui o lightningcss do bundle
- ✅ `--external:@tailwindcss/oxide` - Exclui o Tailwind CSS Oxide do bundle
- ✅ `--external:@tailwindcss/oxide-*` - Exclui todas as variantes do Oxide (linux-x64-musl, linux-x64-gnu, etc)
- ✅ `--external:@babel/preset-typescript` - Exclui o preset do Babel
- ✅ `--packages=external` - Marca todos os pacotes do node_modules como externos por padrão

## 🧪 Teste Local

Após a correção, o build foi testado localmente com sucesso:

```bash
$ pnpm run build
✓ 2404 modules transformed.
../dist/public/index.html                   367.69 kB │ gzip: 105.55 kB
../dist/public/assets/index-CN-RI5dC.css    117.98 kB │ gzip:  18.44 kB
../dist/public/assets/index-DtM_lSAa.js   1,012.10 kB │ gzip: 284.14 kB
✓ built in 5.47s
  dist/index.js  35.7kb
⚡ Done in 8ms
```

## 🚀 Deploy

As alterações foram commitadas e enviadas para o GitHub:

```bash
git add package.json
git commit -m "fix: corrigir erro de build adicionando externals para arquivos nativos (.node)"
git push origin main
```

O Railway detectará automaticamente o push e iniciará um novo build com a correção aplicada.

## 💚 Status Online Mantido

A correção foi feita **sem alterar nenhuma configuração que afete o status online**. O indicador verde de "Online" permanecerá ativo, pois:

- ✅ Não foram alteradas configurações de healthcheck
- ✅ Não foram modificados arquivos de configuração do Railway
- ✅ A correção apenas resolve o problema de build
- ✅ O comando `start` permanece o mesmo

## 📝 Commit

- **Hash**: `659ffe5`
- **Mensagem**: `fix: corrigir erro de build adicionando externals para arquivos nativos (.node)`
- **Branch**: `main`
