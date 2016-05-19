import {Router} from 'express';

const index: any = Router();

/* GET home page. */
index.get('/', (req: any, res: any, next: any): void => {
    res.render('index');
});

export default index;
