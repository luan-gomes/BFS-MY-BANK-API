import express from 'express';
import { promises as fs, write } from 'fs';

const router = express.Router();
const { readFile, writeFile } = fs;

router.post('/', async (req, res, next) => {
  try {
    let newAccount = req.body;
    const data = JSON.parse(await readFile(global.fileName));

    if (!newAccount.name || newAccount.balance == null) {
      throw new Error('Nome e Balance são obrigatórios!');
    }

    newAccount = {
      id: data.nextId++,
      name: newAccount.name,
      balance: newAccount.balance,
    };
    data.accounts.push(newAccount);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    global.logger.info(
      `${req.method} ${req.baseUrl} - ${JSON.stringify(newAccount)}`
    );
    res.send(newAccount);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    delete data.nextId;
    global.logger.info(`${req.method} ${req.baseUrl}`);
    res.send(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const account = data.accounts.find(
      (account) => account.id === parseInt(req.params.id)
    );
    global.logger.info(
      `${req.method} ${req.baseUrl}/:id  - ID: ${req.params.id} `
    );
    res.send(account);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts = data.accounts.filter(
      (account) => account.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    global.logger.info(`${req.method} ${req.baseUrl} - ID: ${req.params.id}`);
    res.end();
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(
      (currentAccount) => currentAccount.id === account.id
    );

    if (index === -1) {
      throw new Error('Registro não encontrado!');
    }

    if (!account.id || !account.name || account.balance == null) {
      throw new Error('ID, Name e Balance são obrigatórios!');
    }

    data.accounts[index].name = account.name;
    data.accounts[index].balance = account.balance;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    global.logger.info(
      `${req.method} ${req.baseUrl} - ${JSON.stringify(account)}`
    );
    res.send(data.accounts[index]);
  } catch (err) {
    next(err);
  }
});

router.patch('/update-balance', async (req, res, next) => {
  try {
    const account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(
      (currentAccount) => currentAccount.id === account.id
    );

    if (index === -1) {
      throw new Error('Registro não encontrado!');
    }

    if (!account.id || account.balance == null) {
      throw new Error('ID e Balance são obrigatórios!');
    }

    data.accounts[index].balance = account.balance;
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    global.logger.info(
      `${req.method} ${req.baseUrl} - ${JSON.stringify(account)}`
    );
    res.send(data.accounts[index]);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
