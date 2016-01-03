var express_1 = require('express');
var index = express_1.Router();
/* GET home page. */
index.get('/', function (req, res, next) {
    res.render('index');
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = index;
