# Credential handling

The supplied OpenRouter-compatible key has been placed in the local `.env` file with file permissions restricted to the current user. It is not included in the distributable archive. The configured endpoint is `https://openrouter.ai/api/v1/chat/completions`.

Before deployment, replace the placeholder database password, n8n encryption key, webhook secret, worker secret, and GitHub credential. Rotate the model key if it was exposed in an insecure location or shared beyond this task.

Do not provide Gmail passwords to automation. Gmail notifications require an OAuth access token or a properly configured Gmail connector. The GitPilot runtime does not search mailboxes for API keys, passwords, or other credentials.
