## Real-Time Employee Task Management Tool

Monorepo with Vite React client and Express + Socket.IO backend.

### Requirements implemented
- Owner login via phone + 6-digit code (stubs for SMS)
- Employee CRUD (in-memory repo; swappable via repository factory)
- Real-time chat via Socket.IO
- Vite proxy for API and sockets

### Tech
- Client: React 18 (JSX), Vite, socket.io-client, axios
- Server: Express, Socket.IO, repository factory (in-memory default)

### Local setup
1) Node 18+
2) Install deps
```
cd server && npm i
cd ../client && npm i
```
3) Run dev
```
cd server && npm run dev
# new terminal
cd client && npm run dev
```
Open http://localhost:5173

### Production build
```
cd client && npm run build
# serve dist via any static server or integrate into Express
```

### Backend env
Create `server/.env` if needed; defaults: PORT=4000

### Repository factory
`server/src/repos/repositoryFactory.js` exposes an in-memory implementation. To switch to Firebase, create a `FirebaseRepository` implementing the same methods and return it from `createRepository()`.

### Vite config
`client/vite.config.js` proxies `/api` and `/socket.io` to the backend.

### Notes
- Emails/SMS are stubbed with TODOs; integrate Twilio/Nodemailer as needed.


