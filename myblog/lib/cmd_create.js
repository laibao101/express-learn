const path = require('path');
const utils = require('./util');
const fse = require('fs-extra');
const moment = require('moment');

module.exports = dir => {
	dir = dir || '.';

	//创建基本目录
	fse.mkdirsSync(path.resolve(dir,'_layout'));
	fse.mkdirsSync(path.resolve(dir,'_posts'));
	fse.mkdirsSync(path.resolve(dir,'assets'));
	fse.mkdirsSync(path.resolve(dir,'posts'));

	//复制模板文件
	const tplDir = path.resolve(__dirname,'../tpl');
	fse.copySync(tplDir,dir);

	//创建第一篇文章
	newPost(dir,'hello, laowang','这是我的第一篇文章');

	console.log('创建成功');
}


//创建一篇文章
function newPost (dir,title,content) {
	const data = [
		'---',
		`title:${title}`,
		`date:${moment().format('YYYY-MM-DD')}`,
		'---',
		'',
		content
	].join('\n');
	const name = moment().format('YYYY-MM')+'/helllo-laowang.md';
	const file = path.resolve(dir,'_posts',name);

	fse.outputFileSync(file,data);
}
