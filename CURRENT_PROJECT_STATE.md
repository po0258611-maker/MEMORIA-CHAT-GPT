# ATLETA AI — Current project state

Updated 2026-09-13.

The project is in the final engineering/commercial phase. The current focus is Mercado Pago subscriptions, webhook integration, entitlement activation, public backend deployment, end-to-end payment tests, and production launch.

Existing work includes the V2 workout engine, Full Body 5x rotation, Safety Validator, Firestore hydration safety, prescription coherence/integrity validation, authentication/RBAC hardening, CI/build/release hardening, and the Stage 14 final audit.

Mercado Pago setup already completed: application created; test seller and buyer accounts exist; monthly plan R$15 with 7 free days exists; annual plan R$120/year exists; test credentials are available. Credential values are intentionally not stored here.

The existing codebase already contains Mercado Pago payment/webhook components and the route POST /webhooks/mercadopago under the subscriptions router. The remaining financial work is to connect the existing plans to recurring subscriptions, validate webhook events, synchronize subscription state with Firestore, and grant Premium only from server-authoritative entitlement state.

Hosting priority is zero initial infrastructure cost. Google Cloud Run is the preferred deployment path because the project already uses Google/Firebase infrastructure and the backend is Node/Express. The project selected in AI Studio currently needs billing configuration before publishing.

Next sequence: public HTTPS backend → plan identifiers → secure configuration → Mercado Pago test webhook → recurring subscription flow → entitlement → reconciliation → end-to-end tests → production.
