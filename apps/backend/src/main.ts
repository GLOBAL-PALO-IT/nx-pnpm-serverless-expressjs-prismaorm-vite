import { app } from './app';
import { logger } from './libs/logger';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, host, () => {
  logger.info(`Server ready at http://${host}:${port}`);
});
