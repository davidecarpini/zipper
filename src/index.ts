import * as Koa from 'koa';
import Zipper from './Zipper';

const zipper = new Zipper();

const app = new Koa();

app.use(async ctx => {
  ctx.body = 'ciao';
});

app.listen(3000);
