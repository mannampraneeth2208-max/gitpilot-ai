# Acceptance testing

Use a disposable GitHub repository and a provider mock that can intentionally timeout. Verify: repository discovery; tree and file indexing; source-backed analysis; issue evidence; plan; approval gate; isolated branch/diff; real test pass and deliberate failure; independent review; PR only after approval; retry after provider timeout; resume via idempotency key; memory retrieval.

For every test capture task ID, workflow execution ID, commit SHA, API response, worker run ID, and database rows. A green model response without these artifacts is not a pass.
