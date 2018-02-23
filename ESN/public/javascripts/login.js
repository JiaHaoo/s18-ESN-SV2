$(document).ready(function() {
    $('#signin-btn').click(function() {
    	var un = $('#username-input').val();
        if (!checkAvailability(un)) {
            // alert that username doesn't comply with rules
        }
        return;
    	var ps = md5($('#password-input').val());

        login(un, ps);
    }); 

    $('#register-btn').click(function() {
		var un = $('#username-input').val();
        if (!checkAvailability(un)) {
            // alert that username doesn't comply with rules
        }
    	var ps = md5($('#password-input').val());

    	$.ajax({
    		type: 'PUT',
    		url: '/v1/users/'+un,
    		data: {password: ps},
    		success: function(res) {
    			login(un, ps, true);
    		}
    	});
    });

    $("#close-alert").click(function(){
        $("#wrong-passwd-alert").hide();
    });
});


function login(username, password, newFlag) {
	$.ajax({
		type: 'POST',
		url: '/v1/users',
		data: {username: username, password: password},
		success: function(res) {
			window.location.href = res['redirect'] + '?newMember=' + (newFlag ? 'true' : 'false');
		}
	}).fail(function($xhr) {
		var data = $xhr.responseJSON;
    	if (data['name'] === 'IncorrectPasswordError') {
            $('#password-input').val('');
            $('#wrong-passwd-alert').show();
    	} else if(data['name'] === 'IncorrectUsernameError') {
    		$('#register-modal').modal({show: true});
    	}
	})
}

function checkAvailability(str) {
    if(str.length < 3)
        return false;
    if(!str.match(/^[0-9a-zA-Z_]+[0-9a-zA-Z_-]*[0-9a-zA-Z_]+$/))
        return false;
    var reservedList = ['about', 'access', 'account', 'accounts', 'add', 'address', 'adm', 'admin', 'administration', 
    'adult', 'advertising', 'affiliate', 'affiliates', 'ajax', 'analytics', 'android', 'anon', 'anonymous', 'api', 
    'app', 'apps', 'archive', 'atom', 'auth', 'authentication', 'avatar', 'backup', 'banner', 'banners', 'bin', 
    'billing', 'blog', 'blogs', 'board', 'bot', 'bots', 'business', 'chat', 'cache', 'cadastro', 'calendar', 'campaign', 
    'careers', 'cgi', 'client', 'cliente', 'code', 'comercial', 'compare', 'config', 'connect', 'contact', 'contest', 
    'create', 'code', 'compras', 'css', 'dashboard', 'data', 'db', 'design', 'delete', 'demo', 'design', 'designer', 
    'dev', 'devel', 'dir', 'directory', 'doc', 'docs', 'domain', 'download', 'downloads', 'edit', 'editor', 'email', 
    'ecommerce', 'forum', 'forums', 'faq', 'favorite', 'feed', 'feedback', 'flog', 'follow', 'file', 'files', 'free', 
    'ftp', 'gadget', 'gadgets', 'games', 'guest', 'group', 'groups', 'help', 'home', 'homepage', 'host', 'hosting', 
    'hostname', 'html', 'http', 'httpd', 'https', 'hpg', 'info', 'information', 'image', 'img', 'images', 'imap', 
    'index', 'invite', 'intranet', 'indice', 'ipad', 'iphone', 'irc', 'java', 'javascript', 'job', 'jobs', 'js', 
    'knowledgebase', 'log', 'login', 'logs', 'logout', 'list', 'lists', 'mail', 'mail1', 'mail2', 'mail3', 'mail4', 
    'mail5', 'mailer', 'mailing', 'mx', 'manager', 'marketing', 'master', 'me', 'media', 'message', 'microblog', 'microblogs', 
    'mine', 'mp3', 'msg', 'msn', 'mysql', 'messenger', 'mob', 'mobile', 'movie', 'movies', 'music', 'musicas', 'my', 'name', 
    'named', 'net', 'network', 'new', 'news', 'newsletter', 'nick', 'nickname', 'notes', 'noticias', 'ns', 'ns1', 'ns2', 'ns3', 
    'ns4', 'old', 'online', 'operator', 'order', 'orders', 'page', 'pager', 'pages', 'panel', 'password', 'perl', 'pic', 'pics', 
    'photo', 'photos', 'photoalbum', 'php', 'plugin', 'plugins', 'pop', 'pop3', 'post', 'postmaster', 'postfix', 'posts', 'profile', 
    'project', 'projects', 'promo', 'pub', 'public', 'python', 'random', 'register', 'registration', 'root', 'ruby', 'rss', 'sale', 
    'sales', 'sample', 'samples', 'script', 'scripts', 'secure', 'send', 'service', 'shop', 'sql', 'signup', 'signin', 'search', 
    'security', 'settings', 'setting', 'setup', 'site', 'sites', 'sitemap', 'smtp', 'soporte', 'ssh', 'stage', 'staging', 'start', 
    'subscribe', 'subdomain', 'suporte', 'support', 'stat', 'static', 'stats', 'status', 'store', 'stores', 'system', 'tablet', 
    'tablets', 'tech', 'telnet', 'test', 'test1', 'test2', 'test3', 'teste', 'tests', 'theme', 'themes', 'tmp', 'todo', 'task', 
    'tasks', 'tools', 'tv', 'talk', 'update', 'upload', 'url', 'user', 'username', 'usuario', 'usage', 'vendas', 'video', 'videos', 
    'visitor', 'win', 'ww', 'www', 'www1', 'www2', 'www3', 'www4', 'www5', 'www6', 'www7', 'wwww', 'wws', 'wwws', 'web', 'webmail', 
    'website', 'websites', 'webmaster', 'workshop', 'xxx', 'xpg', 'you', 'yourname', 'yourusername', 'yoursite', 'yourdomain'];
    for(var ele of reservedList) {
        if (ele === str)
            return false;
    }
    return true;
}
