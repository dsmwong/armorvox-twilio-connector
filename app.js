const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const debug = require('debug')('connector:app');

const indexRouter = require('./routes/index');

const recordRouter = require('./routes/ws-record');
const recresultRouter = require('./routes/recresult');

const pingRouter = require('./routes/ping');
const getVoiceprintRouter = require('./routes/getvoiceprint');
const deleteVoiceprintRouter = require('./routes/deletevoiceprint');

const enrolRouter = require('./routes/enrol');
const verifyRouter = require('./routes/verify');
const checkQualityRouter = require('./routes/checkquality');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/record', recordRouter);
app.use('/recresult', recresultRouter);

app.use('/ping', pingRouter);
app.use('/getvoiceprint', getVoiceprintRouter);
app.use('/deletevoiceprint', deleteVoiceprintRouter);

app.use('/enrol', enrolRouter);
app.use('/verify', verifyRouter); 
app.use('/checkquality', checkQualityRouter); 

// Specific route handling for setting up websocket connection
app.handleUpgrade = function(pathname, request, socket, head) {
  if (pathname.replace(/\/$/, '') === '/record') {
    debug('Upgrading socket for path ' + pathname);
    recordRouter.wss.handleUpgrade(request, socket, head, (ws) => {
      debug('Emitting connection for paht ' + pathname)
      recordRouter.wss.emit('connection', ws, request);
    });
  } else {
    debug('unhandlled path: ' + pathname);
    socket.destroy();
  }
}

module.exports = app;
