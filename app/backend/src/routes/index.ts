import {Router} from 'express';

const index = Router();

/* GET home page. */
index.get('/', (req, res, next) => {
  res.render('index');
});

export default index;
