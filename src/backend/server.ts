import path from 'path';
import express from 'express';
import indexHandler from './dekorator';
import environment from './environment';
import webpack, { MultiCompiler } from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import projectWebpackDevConfig from '../webpack/webpack.development.config';
import routes from './routes';

const app = express();

const frontendMappe = path.join(process.cwd(), 'dist');

app.set('views', frontendMappe);

app.get('/', indexHandler);

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line
  // @ts-ignore
  const compiler = webpack(projectWebpackDevConfig) as Compiler | MultiCompiler;
  const devMiddlewareOptions = {
    // Vi må write to disk for at index.html skal havne på et sted der mustacheExpress-renderen kan finne den
    writeToDisk: true,
  };
  app.use(webpackDevMiddleware(compiler, devMiddlewareOptions));
  app.use(webpackHotMiddleware(compiler));
} else {
  // Static files
  app.use(
    '/familie/alene-med-barn/ettersending/',
    express.static(frontendMappe, { index: false }),
  );
}

app.use(routes());
app.get('*', indexHandler);

console.log('server listening on port', environment().port);

app.listen(environment().port);
