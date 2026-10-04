"""Run once: python seed.py  (then wait ~30-60s for Hindsight to process)."""
import os

from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()
BANK_ID = "devbridge-engineering"
hs = Hindsight(
    base_url=os.getenv("HINDSIGHT_BASE_URL"),
    api_key=os.getenv("HINDSIGHT_API_KEY"),
)

MEMORIES = [
    ("post-mortem",
     "Post-mortem INC-2291 (March): during a flash sale, checkout used exponential "
     "backoff on the Redis lock in processCheckout. Retries piled up, lock TTLs "
     "overlapped, and 312 customers were double-charged by Stripe. Total refund "
     "cost: $41,000."),
    ("decision",
     "Decision by Marcus (Staff Engineer) after INC-2291: set retryCount: 0 and "
     "ttl: 4500 on the checkout lock in checkout_flow.ts line 14. A failed lock "
     "must fail fast and return 409 so the client retries with the same "
     "idempotency key. Never retry inside the lock acquisition."),
    ("decision",
     "ttl 4500ms for the checkout lock was chosen because the p99 of "
     "reserveBatch + Stripe charge is about 3.8 seconds. Lower TTLs caused the "
     "lock to expire mid-payment."),
    ("convention",
     "Team convention: every Stripe charge must carry an idempotency key built "
     "from cartId. Reviewers reject PRs that call stripeClient.charges.create "
     "without one."),
    ("incident",
     "If Redis is unreachable, checkout must fail closed: return 503 and do NOT "
     "fall back to unlocked checkout. Decided in the Redis outage review, "
     "because an unlocked fallback caused duplicate orders in 2023."),
    ("convention",
     "Team convention: always release locks in a finally block, and never swallow "
     "errors from redisLock.release; log them with the cartId."),
    ("review-feedback",
     "Code review feedback repeated for juniors: do not add retry loops around "
     "payment calls. Retries belong at the client/queue layer with idempotency "
     "keys, not inside the transaction."),
]

for ctx, text in MEMORIES:
    hs.retain(bank_id=BANK_ID, content=text, context=ctx)
    print("retained:", text[:60], "...")

print("Done. Wait about a minute before asking questions.")