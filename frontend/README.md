# AfterCheck Frontend

React and TypeScript dashboard for the AfterCheck prototype.

## Stack

- React
- TypeScript
- TanStack Router and TanStack Query
- Recharts
- Tailwind CSS and shadcn/ui components

## Configuration

Create `.env.local`:

```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8000
```

## Commands

```bash
npm install
npm run dev -- --port 3000
npm test
npm run build
```

All backend communication is routed through `src/lib/api.ts`.

