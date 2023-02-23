/* eslint-disable no-case-declarations */
/* eslint-disable consistent-return */
/* eslint-disable no-return-await */
const http = require('http');
const Koa = require('koa');
const cors = require('koa-cors');
const koaBody = require('koa-body');
const uuid = require('uuid');

const app = new Koa();

const port = process.env.PORT || 7070;

let tickets = [
  {
    id: '123-456-789',
    name: 'Test ticket with description',
    description: 'This is a test ticket description',
    status: true,
    created: new Date().toLocaleString(),
  },
  {
    id: '987-654-321',
    name: 'Test ticket without description',
    description: '',
    status: false,
    created: new Date().toLocaleString(),
  },
];

app.use(
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);


app.use(
  koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  }),
);

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');  
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set(
        'Access-Control-Allow-Headers',
        ctx.request.get('Access-Control-Request-Headers'),
      );
    }

    ctx.response.status = 204;
  }
});

app.use(async (ctx) => {
  // console.log('request.query.method:', ctx.request.query.method);
  // console.log('request.querystring:', ctx.request.querystring);
  // console.log('request.body:', ctx.request.body);
  ctx.response.body = `server response at port ${port}`;
  const { method } = ctx.request.query;
  switch (method) {
    case 'allTickets':
      ctx.response.body = tickets;
      // console.log('response.body:', ctx.response.body);
      return;
    case 'ticketById':
      // console.log('request.query:', ctx.request.query);
      // console.log('request.query.id:', ctx.request.query.id);
      const ticketById = tickets.find((ticket) => ticket.id === ctx.request.query.id);
      const ticketDescription = ticketById.description;
      // console.log('ticketDescription:', ticketDescription);
      ctx.response.body = ticketDescription;
      // console.log('response.body:', ctx.response.body);
      return;
    case 'createTicket':
      const newTicketId = uuid.v4()
      const formData = ctx.request.body;
      formData.id = newTicketId;
      if (formData.status === 'false') formData.status = false;
      if (formData.status === 'true') formData.status = true;
      // console.log('formData.status:', formData.status, typeof formData.status);
      tickets.push(formData);
      // console.log('tickets:', tickets);
      return;
    case 'changeTicketStatus':
      const ticketId = tickets.find((ticket) => ticket.id === ctx.request.body.id);
      // console.log('request.body.id:', ctx.request.body.id);
      if (!ticketId) return;
      ticketId.status = ctx.request.body.status;
      // console.log('ticketId:', ticketId);
      // console.log('tickets:', tickets);
      return;
    case 'removeTicket':
      // console.log('request.body.id:', ctx.request.body.id);
      tickets = tickets.filter((ticket) => ticket.id !== ctx.request.body.id);
      // console.log('tickets:', tickets);
      return;
    case 'editTicket':
      const
        {
          id,
          name,
          description,
          status,
          created,
        } = ctx.request.body;
      // console.log('body:', id, name, description, status, created);
      const editingTicket = tickets.find((ticket) => ticket.id === id);
      if (!editingTicket) return;
      editingTicket.name = name;
      editingTicket.description = description;
      editingTicket.status = status;
      editingTicket.created = created;
      // console.log('tickets:', tickets);
      return;
    default:
      ctx.response.status = 404;
  }
});

app.listen(port, () => console.log(`Koa server has been started on port ${port} ...`));
