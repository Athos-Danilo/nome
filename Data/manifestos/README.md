# Manifesto do catálogo da primeira entrega

O arquivo [catalogo-primeira-entrega.json](catalogo-primeira-entrega.json) identifica os vinte lotes e as 500 respostas aprovadas, auditados na fase 47. Ele não é um lote para importação. Os únicos arquivos de carga continuam em `Data/palavras/`.

O manifesto registra caminho relativo, identificador de lote, temática principal de planejamento, quantidade e SHA-256 do JSON de cada arquivo. Para cada resposta, registra identificador, posição no arquivo, texto, temáticas, dificuldade e SHA-256 do conteúdo completo, incluindo as cinco dicas. Não copia novamente as dicas.

Os hashes usam JSON UTF-8 com `ensure_ascii=False`, chaves ordenadas e separadores `(',', ':')`, sem espaços adicionais. Isso ignora diferenças de indentação, ordem das chaves e fim de linha Windows/Linux; não ignora mudanças em textos, listas ou valores. O hash global usa a lista dos conteúdos de resposta ordenada por `id`. Não é o hash dos bytes brutos do arquivo.

A temática principal vem do nome do lote, sem a numeração final. Ela precisa estar entre as temáticas da resposta. Cada item conta uma vez na quota de produção; associações secundárias não aumentam o total global. Não foi acrescentado um campo de planejamento ao contrato persistido de palavras.

`commit_origem_dos_lotes` identifica o estado do repositório usado na geração. O manifesto registra conteúdo aprovado; não concede aprovação humana a edições futuras. Se houver mudança autorizada em um lote, repetir revisão e conferência, gerar outro manifesto coerente e atualizar os registros da auditoria, preservando as revisões históricas usadas pelas partidas.

Em `Backend`, executar:

```powershell
.venv/Scripts/python.exe -m pytest testes/teste_manifesto_catalogo.py
.venv/Scripts/python.exe -m comandos.catalogo validar ../Data/palavras
.venv/Scripts/python.exe -m comandos.catalogo conferir ../Data/palavras
```

Os dois primeiros comandos não acessam bancos. O último compara com o MongoDB configurado no ambiente, sem gravar documentos ou índices; não apontar testes destrutivos para dados reais. Conferência final e diferenças históricas entre local e Atlas estão em [auditoria da fase 47](../../Doc/Revisoes/catalogo-final.md) e [resultado por ambiente](../../Doc/Revisoes/catalogo-final-conferencia.json).
