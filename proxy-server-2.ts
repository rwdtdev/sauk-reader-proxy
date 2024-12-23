import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import _ from 'lodash';
import fetch from 'node-fetch';

let rfidSet2: {
  epc: string;
  timestamp: number;
  timeIn: number;
  timeOut: number | null;
}[] = [];

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/', async (req, res) => {
  await fetch('http://localhost:3000/api/rest/sauk-reader', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });
  res.status(200).send(JSON.stringify({ message: 'OK' }));
});

app.listen(8090, () => {
  console.log('sauk proxy server listen port 8090');
});
