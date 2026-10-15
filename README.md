# Satya AI

A responsive AI chat assistant built with a lightweight HTML/CSS/JavaScript frontend and a server-side Vercel Function.

## Features

- Responsive chat interface for desktop and mobile
- Chat history kept in the current browser session
- Server-side AI API calls; the provider key is never sent to the browser
- Input validation and helpful error messages
- Custom assistant personality and beginner-friendly guidance

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. In **Project → Settings → Environment Variables**, add:
   - `OPENAI_API_KEY`: your API key from the AI provider
   - `OPENAI_MODEL` (optional): model name available to your API account; defaults to `gpt-4o-mini`
3. Add the variables to Production and Preview as desired, save, and redeploy.
4. Open the deployed URL and test a message.

Never commit API keys to GitHub or put them in frontend JavaScript. Do not share the key with friends. API use may incur charges; check provider pricing and usage limits.

## Local testing

Requires Node.js. From the repository root:

```bash
npx vercel dev
```

Create a local `.env.local` file with `OPENAI_API_KEY=your_key_here` and optionally `OPENAI_MODEL=gpt-4o-mini`. Do not commit `.env.local`.

## Current limitations

- This starter uses an OpenAI-compatible Chat Completions endpoint.
- Conversation history is held in the browser only and is not synced between devices.
- There is no account system, persistent memory, or per-user rate limiting yet. Add these before treating the service as a public production app.
- AI replies can be incorrect; verify important information.
