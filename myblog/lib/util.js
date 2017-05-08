const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const rd = require('rd');
const swig = require('swig');

const md = new MarkdownIt({
	html:true,
	langPrefix:'code-'
});

swig.setDefaults({
	cache:false
});

//去掉文件名中的扩展名
function stripExtname (name) {
	const i = 0 - path.extname(name).length;

	if (i === 0) {
		i = name.length;
	}
	return name.slice(0,i);
}

//将markdown转换为html
function markdownToHTML (content) {
	return md.render(content || '');
}


//解析文章内容
function parseSourceContent (data) {
	const split = '---\n';
	const i = data.indexOf(split);
	const info = {};


	if (i !== -1) {
		const j = data.indexOf(split, i + split.length);

		if (j !== -1) {
			const str = data.slice( i + split.length , j).trim();
			data = data.slice(j + split.length);
			str.split('\n').forEach( line => {
				const k = line.indexOf(':');

				if (k !== -1) {
					const name = line.slice(0, k).trim();
					const value = line.slice(k + 1).trim();
					info[name] = value;
				}
			});
		}
	}

	info.source = data;
	return info;
}




//渲染模板
function renderFile (file,data) {
	return swig.render(fs.readFileSync(file).toString(),{
		filename:file,
		autoescape:false,
		locals:data
	})
}


// 遍历所有文章
function eachSourceFile (sourceDir,callback) {
	rd.eachFileFilterSync(sourceDir,/\.md/, callback);
}

//渲染文章
function renderPost (dir,file) {
	const content = fs.readFileSync(file).toString();
	const post = parseSourceContent(content.toString());
	const config = loadConfig(dir);

	post.content = markdownToHTML(post.source);
	post.layout = post.layout || 'post';

	const html = renderFile(path.resolve(dir,'_layout',post.layout + '.html'),{
		post:post,
		config
	});

	return html;
}

//渲染文章列表
function renderIndex (dir) {
	const list = [];
	const sourceDir = path.resolve(dir,'_posts');
	const config = loadConfig(dir);

	eachSourceFile(sourceDir, (f,s) => {
		const source = fs.readFileSync(f).toString();
		const post = parseSourceContent(source);

		post.timestamp = new Date(post.date);
		post.url = '/posts/' + stripExtname(f.slice(sourceDir.length + 1)) + '.html';
		list.push(post);
	});

	list.sort( (a,b) => b.timestamp - a.timestamp);


	const html = renderFile(path.resolve(dir,'_layout','index.html'),{
		posts:list,
		config
	});

	return html;
}

//读取配置文件
function loadConfig (dir) {
	const content = fs.readFileSync(path.resolve(dir,'config.json').toString());
	const data = JSON.parse(content);

	return data;
}


exports.renderPost = renderPost;
exports.renderIndex = renderIndex;
exports.stripExtname = stripExtname;
exports.eachSourceFile = eachSourceFile;
exports.loadConfig = loadConfig;
