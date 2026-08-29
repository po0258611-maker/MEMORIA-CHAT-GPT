# MEMÓRIA COMPARTILHADA — ATLETA AI / TREINO MAX

**Data:** 29/08/2026
**Finalidade:** memória técnica compartilhada entre ChatGPT e outras IAs/agentes que trabalharem no projeto.
**Projeto principal:** Atleta AI / Treino MAX
**Repositório principal:** https://github.com/po0258611-maker/atleta-ai-0.1.git
**Repositório de memória:** https://github.com/po0258611-maker/MEMORIA-CHAT-GPT.git

---

## 1. REGRA GERAL DE CONTINUIDADE

Este documento registra o estado técnico, decisões, etapas, problemas, correções e próximos passos definidos nas conversas atuais.

Qualquer IA que receber este documento deve:

- preservar decisões já tomadas;
- não desfazer correções anteriores sem motivo técnico comprovado;
- não implementar pagamentos enquanto estiverem fora do escopo;
- não apagar dados ou executar migrações destrutivas;
- não declarar testes como aprovados sem executá-los;
- não declarar backup, conformidade LGPD ou produção como prontos sem comprovação;
- trabalhar em etapas numeradas e manter rastreabilidade das alterações;
- priorizar segurança, estabilidade, compatibilidade e reversibilidade.

---

# 2. OBJETIVO DO PRODUTO

O Atleta AI / Treino MAX é um aplicativo comercial de treinamento físico com IA.

Objetivo central:

- gerar e adaptar treinos;
- acompanhar evolução;
- utilizar IA como treinador/assistente;
- manter motor determinístico de ciência do esporte como camada previsível;
- oferecer planos FREE, PRO e APEX;
- controlar recursos e consumo por entitlement/quota;
- preparar arquitetura para operação comercial.

O pagamento real ainda NÃO está pronto e permanece fora do escopo atual.

---

# 3. ARQUITETURA CONHECIDA

Arquitetura validada nas etapas anteriores:

```text
Frontend React/Vite
        ↓
HTTP Request + Firebase ID Token
        ↓
Rate Limiter
        ↓
Firebase Auth
        ↓
Authorization / Entitlement / Quota
        ↓
Backend Node.js / Express
        ↓
Firestore / Supabase
        ↓
AI Service / Gemini
        ↓
Fallback determinístico BioAtlas
```

Tecnologias registradas na auditoria:

- Node.js 22.23.2
- React 19.0.1
- TypeScript 5.8.2
- Vite 6.4.3
- Express 4.21.2
- Esbuild 0.25.0
- @google/genai 2.4.0
- Firebase Auth
- Firebase Firestore
- Supabase PostgreSQL
- Cloud Run / container Linux x64

O frontend é compilado com Vite e o backend é empacotado em CommonJS via Esbuild.

---

# 4. FLUXO AUTORITATIVO DE SEGURANÇA

Fluxo estabelecido:

```text
Cliente
 ↓
Rate Limit por IP
 ↓
Firebase Auth
 ↓
UID confiável do token
 ↓
Authorization / RBAC
 ↓
Entitlement
 ↓
Quota atômica
 ↓
AI Service
 ↓
Gemini ou fallback
```

A identidade do usuário deve vir do Firebase Admin SDK/token validado, nunca de um UID confiado enviado pelo cliente.

---

# 5. AUTENTICAÇÃO E AUTORIZAÇÃO

Firebase Auth é a camada de autenticação.

Backend valida o ID Token.

Regras importantes:

- sem token → 401;
- token inválido → 401;
- token expirado → 401;
- acesso a recurso de outro usuário → 403 ou 404 conforme estratégia;
- usuário não pode elevar o próprio papel;
- roles existentes: ATLETA, TREINADOR e ADMIN;
- propriedade dos recursos deve ser validada pelo UID autenticado.

Proteção contra IDOR foi tratada nas etapas anteriores.

---

# 6. FIRESTORE

Firestore é o banco principal para persistência de dados do aplicativo.

Decisões importantes:

- isolamento por UID;
- operações atômicas para quota;
- cliente não deve ser autoridade para subscription, plan, entitlement, quota ou role;
- estado autoritativo de assinatura deve ser controlado no servidor;
- subcoleções e transações devem preservar isolamento de usuários.

---

# 7. SUPABASE

Supabase PostgreSQL existe como banco relacional secundário.

Deve permanecer isolado e higienizado.

RLS deve impedir acesso cruzado entre usuários.

Não substituir Firestore sem decisão arquitetural explícita.

---

# 8. ASSINATURAS E ENTITLEMENTS

Arquitetura desejada:

```text
Firebase UID
   ↓
Subscription
   ↓
Entitlements
   ↓
Feature Usage
```

Frontend apenas consulta/exibe o estado autorizado.

Nunca confiar em:

- localStorage como autoridade;
- Map local como autoridade comercial;
- assinatura demo;
- estado artificial enviado pelo frontend.

Planos definidos:

### FREE
- 10 mensagens/mês de IA.

### PRO
- 200 mensagens/mês de IA.

### APEX
- conceitualmente ilimitado, mas com guardrail técnico de 10.000 mensagens/mês.

Esses valores foram registrados durante a auditoria e devem ser tratados como configuração comercial até confirmação final.

---

# 9. PAGAMENTOS

**FORA DO ESCOPO ATUAL.**

Não implementar:

- PIX;
- Stripe;
- Mercado Pago;
- checkout real;
- webhooks de gateway real;
- cobrança recorrente.

A arquitetura de pagamento pode existir como abstração, mas a implementação real será feita em etapa futura e separada.

---

# 10. ERRO HTTP 429 / RATE EXCEEDED

Problema tratado nas etapas F3/F3.1.

Origem identificada:

- rate limiter do backend;
- chamadas à API Gemini.

Correções registradas:

- HTTP 429 estruturado;
- cabeçalho Retry-After;
- payload com código RATE_LIMIT_EXCEEDED;
- isolamento por IP;
- quota por usuário;
- backoff exponencial;
- jitter;
- até 3 tentativas para falhas transitórias do Gemini;
- fallback determinístico BioAtlas;
- tratamento do 429 no frontend;
- prevenção de loops/reenvios contínuos;
- botão/estado de carregamento para evitar submissão dupla.

Rate limiter IP registrado:

- janela: 60 segundos;
- limite: 100 requisições/IP/minuto.

Backoff registrado:

- até 3 tentativas;
- base de 500 ms;
- multiplicador exponencial;
- jitter de 0–200 ms.

Observação: o rate limiter baseado em memória local não é global entre múltiplas instâncias Cloud Run. Isso foi classificado como ALTO-01 e mitigado parcialmente pela quota atômica persistida por usuário. Redis/VPC é recomendação futura para escala maior.

---

# 11. GEMINI / IA

SDK: @google/genai.

A chave Gemini deve permanecer exclusivamente no backend.

Nenhuma chave deve possuir prefixo VITE_ ou aparecer no bundle frontend.

IA deve possuir:

- sanitização de prompt;
- proteção contra prompt injection;
- controle de quota;
- rate limiting;
- timeout;
- retry/backoff;
- jitter;
- fallback determinístico;
- logs sem secrets;
- controle de custo e uso.

O motor determinístico BioAtlas deve continuar separado da IA generativa.

A IA pode enriquecer a experiência, mas regras que precisam ser previsíveis devem continuar no motor determinístico.

---

# 12. BUILD E ARTEFATOS

Nas auditorias F3.1/F4 foram registrados como aprovados:

```text
npm run build
npm test
tsc --noEmit
```

Artefatos registrados:

```text
dist/
├── assets/
├── images/
├── index.html
├── manifest.json
├── server.cjs
└── server.cjs.map
```

O backend de produção utiliza dist/server.cjs.

Servidor deve escutar em 0.0.0.0:3000 quando executado no ambiente Cloud Run.

Endpoints registrados:

```text
GET /api/health
GET /api/ready
```

Health = processo vivo.

Ready = dependências e artefatos prontos.

---

# 13. TESTES REGISTRADOS NAS AUDITORIAS

Resultados informados nas etapas anteriores:

- 123/123 testes diagnósticos de rate limit aprovados;
- 26/26 testes da suíte abrangente aprovados;
- typecheck aprovado;
- build aprovado;
- health aprovado;
- readiness aprovado;
- testes de autenticação e autorização aprovados;
- testes de IDOR/RBAC aprovados;
- testes de quota atômica aprovados;
- testes de 429 aprovados;
- testes de backoff/jitter aprovados;
- fallback determinístico aprovado;
- proteção de segredo aprovada.

IMPORTANTE: esses resultados são o histórico informado nas conversas. Em qualquer nova auditoria, os testes devem ser executados novamente antes de afirmar que o estado atual continua igual.

---

# 14. F4 — AUDITORIA PRÉ-PRODUÇÃO

F4 foi registrada como APROVADA.

Problemas destacados:

### CRIT-01 — CORS

Problema:
preflight same-origin podia ser rejeitado quando CORS_ORIGINS não estava explicitamente configurado.

Correção registrada:
aceitar automaticamente mesma origem http(s)://host sem abrir origem cruzada não autorizada.

### CRIT-02 — .gitignore

Problema:
artefatos de build não estavam explicitamente ignorados.

Correção:
adicionar dist/, server.cjs e server.cjs.map ao .gitignore.

### ALTO-01 — Rate limiter em memória

Problema:
limite IP não compartilhado entre múltiplas instâncias Cloud Run.

Mitigação:
quota atômica por usuário.

Recomendação futura:
Redis via VPC quando escala justificar.

### MED-01 — Modelo Gemini

Foi registrado que o modelo padrão histórico era gemini-2.5-flash e havia recomendação de atualização. Não aplicar automaticamente uma troca de modelo sem verificar disponibilidade e compatibilidade atuais.

### BAIXO-01 — Bundle

Chunks manuais foram usados para reduzir o impacto de módulos de gráficos e PDF no carregamento inicial.

---

# 15. ARQUITETURA COMERCIAL DO PRODUTO

O produto deve evoluir de protótipo para SaaS comercial.

Proposta de diferenciação:

- treino adaptativo;
- progressão de cargas;
- acompanhamento de performance;
- histórico;
- dashboard;
- biblioteca de exercícios;
- substituição inteligente de exercícios;
- treino por tempo disponível;
- treino por equipamentos disponíveis;
- análise de aderência;
- IA integrada;
- motor científico determinístico.

Funcionalidades futuras não devem ser implementadas antes da estabilização da fundação.

---

# 16. PROGRESSÃO DE TREINO

Fluxo desejado:

```text
Treino
 ↓
Resultado
 ↓
Análise
 ↓
Progressão
 ↓
Novo treino
```

Possíveis entradas:

- carga;
- repetições;
- RIR;
- volume;
- frequência;
- performance;
- aderência;
- desconforto informado.

Exemplo de regra:
se o usuário atingir o topo da faixa de repetições com RIR adequado, pode haver progressão de carga conforme a metodologia implementada.

---

# 17. F9 — PRÓXIMA ETAPA DEFINIDA

A próxima etapa definida na conversa é:

# F9 — HARDENING DE PRODUÇÃO, LGPD, BACKUP, RECUPERAÇÃO E OBSERVABILIDADE

Objetivos:

- hardening de segurança;
- auditoria de secrets;
- Git hygiene;
- dependências;
- headers;
- CORS;
- Auth/RBAC/IDOR;
- Firestore;
- Supabase/RLS;
- backup;
- restore;
- disaster recovery;
- logs estruturados;
- request ID;
- métricas;
- alertas;
- privacidade/LGPD em nível técnico;
- CI/CD;
- timeout;
- graceful shutdown;
- testes de regressão.

Pagamentos permanecem fora da F9.

---

# 18. PROMPT F9 REGISTRADO

A F9 deve:

1. Fazer inventário completo antes de alterar.
2. Auditar secrets no código, ambiente, bundle e histórico Git.
3. Não reescrever histórico automaticamente.
4. Auditar npm audit/dependências.
5. Validar headers de segurança.
6. Revalidar CORS.
7. Revalidar Firebase Auth.
8. Revalidar RBAC e IDOR.
9. Auditar Firestore Rules.
10. Auditar Supabase RLS.
11. Verificar configuração de backup.
12. Não afirmar backup existente sem evidência.
13. Documentar restore e disaster recovery.
14. Padronizar logs sem informações sensíveis.
15. Implementar/corroborar request ID.
16. Mapear dados pessoais para análise técnica LGPD.
17. Não declarar conformidade jurídica absoluta.
18. Verificar dados enviados à IA.
19. Testar prompt injection.
20. Testar concorrência.
21. Auditar CI/CD.
22. Validar health/readiness.
23. Validar graceful shutdown.
24. Validar timeouts.
25. Rodar typecheck, build e testes oficiais.
26. Confirmar ausência de regressão F1–F8.
27. Listar arquivos modificados.
28. Classificar riscos.
29. Só declarar F9 APROVADA se as verificações críticas forem realmente executadas.

Classificação:

```text
CRÍTICO
ALTO
MÉDIO
BAIXO
INFORMATIVO
```

Resultado possível:

```text
F9 — APROVADA
F9 — APROVADA COM RESSALVAS
F9 — REPROVADA
```

---

# 19. REGRAS DE DESENVOLVIMENTO

Todas as IAs/agentes que trabalharem no projeto devem seguir:

### NÃO fazer

- alterações indiscriminadas;
- refatoração sem necessidade;
- migração de banco destrutiva;
- troca de stack sem aprovação;
- exposição de secrets;
- pagamento real fora da etapa apropriada;
- apagar código só porque parece legado sem verificar dependências;
- declarar sucesso baseado apenas em análise estática.

### FAZER

- preservar compatibilidade;
- testar após alterações;
- documentar mudanças;
- usar commits pequenos quando possível;
- separar segurança de novas funcionalidades;
- manter backend autoritativo;
- preservar fallback;
- verificar build após mudanças estruturais.

---

# 20. REPOSITÓRIOS E PAPÉIS

Repositório principal do aplicativo:

https://github.com/po0258611-maker/atleta-ai-0.1.git

Repositório de memória compartilhada:

https://github.com/po0258611-maker/MEMORIA-CHAT-GPT.git

O repositório de memória deve servir como referência de continuidade entre diferentes IAs/agentes.

Também foram discutidos anteriormente repositórios de governança/comunicação e laboratório. Esses conceitos devem ser preservados quando relevantes, sem confundir o repositório de memória com o repositório de código de produção.

---

# 21. GOOGLE AI STUDIO

O desenvolvimento/edição do projeto foi associado ao Google AI Studio.

Quando alterações forem preparadas no GitHub para serem levadas ao AI Studio:

- sincronizar/abrir o repositório correto;
- verificar branch;
- confirmar que os arquivos alterados chegaram ao ambiente;
- reinstalar dependências se necessário;
- executar build/testes;
- não assumir que uma alteração do GitHub automaticamente está refletida em uma instância já aberta do AI Studio.

README atual do repositório de memória também registra um app AI Studio e instruções de execução local com npm e GEMINI_API_KEY. Esse README é atualmente um scaffold técnico do repositório de memória e não deve ser confundido com a documentação do Atleta AI.

---

# 22. HISTÓRICO DE ETAPAS

```text
F1 — Segurança e estabilidade
F2 — Build / artefatos
F3 — Rate Limit / HTTP 429
F3.1 — Integração / construção / regressão
F4 — Auditoria final pré-produção
F5 — Estabilização
F6 — Performance / UX
F7 — Motor inteligente de treino
F8 — Arquitetura comercial / Entitlements
F9 — HARDENING + LGPD + BACKUP + OBSERVABILIDADE  ← PRÓXIMA
F10 — QA/E2E FINAL + SIMULAÇÃO DE PRODUÇÃO       ← POSTERIOR
```

Os nomes F5–F8 representam a sequência de trabalho registrada na conversa; seus detalhes devem ser recuperados de documentação específica caso exista antes de modificar código relacionado.

---

# 23. F10 FUTURA

Depois da F9, executar:

# F10 — QA/E2E FINAL + SIMULAÇÃO DE PRODUÇÃO

Cobertura planejada:

- cadastro/login;
- onboarding;
- perfil;
- geração de treino;
- progressão;
- histórico;
- IA;
- quota;
- 429;
- falhas de rede;
- Firestore;
- Supabase;
- permissões;
- concorrência;
- fallback;
- health/readiness;
- build de produção;
- experiência do usuário.

Somente depois disso considerar a implementação do pagamento real.

---

# 24. ESTADO ATUAL DE MEMÓRIA

Estado de continuidade em 29/08/2026:

**Projeto:** Atleta AI / Treino MAX

**Objetivo:** SaaS comercial de treino com IA.

**Fundação:** arquitetura full-stack com React/Vite + Node/Express + Firebase Auth + Firestore + Supabase + Gemini.

**Pagamento:** ainda não implementar.

**Última auditoria:** F4 — registrada como aprovada.

**Última decisão:** avançar para F9.

**Próxima etapa:** F9 Hardening/Backup/LGPD/Observabilidade.

**Etapa seguinte:** F10 QA/E2E.

**Princípio principal:** primeiro estabilidade, segurança e governança; depois monetização.

---

# 25. NOTA DE INTEGRIDADE DA MEMÓRIA

Este arquivo é uma memória técnica compartilhada baseada nas informações disponíveis nas conversas até 29/08/2026 e em verificações feitas no repositório de memória.

Ele não substitui uma auditoria atual do código.

Antes de qualquer alteração crítica no Atleta AI:

```text
LER MEMÓRIA
 ↓
INSPECIONAR ESTADO ATUAL DO REPOSITÓRIO
 ↓
IDENTIFICAR DIFERENÇAS
 ↓
ALTERAR
 ↓
TESTAR
 ↓
DOCUMENTAR
```

Se o estado real do código contradizer este documento, o código atual e os testes executados devem prevalecer, e a memória deve ser atualizada.
