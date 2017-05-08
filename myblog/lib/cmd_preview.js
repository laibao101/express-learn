const express = require('express');
const serverStatic = require('serve-static');
const path = require('path');
const utils = require('./util');
const open = require('open');


module.exports = function(dir) {
	dir = dir || '.';

	//初始化express
	const app = express();
	const router = express.Router();

	app.use('/assets',serverStatic(path.resolve(dir,'assets')));
	app.use(router);

	//渲染文章
	router.get('/posts/*', (req,res,next) => {
		const name = utils.stripExtname(req.params[0]);
		const file = path.resolve(dir,'_posts',name + '.md');
		const html = utils.renderPost(dir,file);

		res.end(html);
	});

	//渲染列表
	router.get('/', (req,res,next) => {
		const html = utils.renderIndex(dir);

		res.end(html)
	});

	const config = utils.loadConfig(dir);
	const port = config.port || 3000;
	const url = `http://localhost:${port}`;

	app.listen(port,() => console.log(`server start at ${url}`));
	open(url);
}
