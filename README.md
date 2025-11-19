# NextJs v15 + Mantine UI v8

Boilerplate 

## LLMs fo MCP

```bash
uvx --from mcpdoc mcpdoc \
    --urls "MantineUi:https://mantine.dev/llms.txt" "Prisma:https://www.prisma.io/llms-full.txt" "NextJs:https://nextjs.org/docs/llms-full.txt" "Zod:https://zod.dev/llms.txt" \
    --transport sse \
    --port 8082 \
    --host localhost
```