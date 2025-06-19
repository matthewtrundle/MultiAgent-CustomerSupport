import { router } from './trpc';
import { authRouter } from './routers/auth';
import { ticketsRouter } from './routers/tickets';
import { customersRouter } from './routers/customers';

export const appRouter = router({
  auth: authRouter,
  tickets: ticketsRouter,
  customers: customersRouter,
});

export type AppRouter = typeof appRouter;