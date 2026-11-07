# Isolated execution worker contract

`POST /v1/runs` accepts `{taskId, repository:{owner,name,sha}, branch, operations:[{type,command,args}], resourceLimits:{timeoutSeconds,cpu,memoryMb,network}}`.

The worker must checkout a clean repository in an ephemeral container, enforce allowlists and limits, redact secrets, and return `{runId,status,exitCode,changedFiles,diffRef,artifacts,steps:[{command,exitCode,durationMs,stdout,stderr}],securityEvents}`.

Required statuses: `QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `TIMED_OUT`, `CANCELLED`. n8n should treat a missing or ambiguous result as failure, not success.
