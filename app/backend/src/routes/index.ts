import {Router} from 'express';

const index = Router();

/* GET home page. */
index.get('/', function(req, res, next) {
  res.render('index');
});

export default index;
