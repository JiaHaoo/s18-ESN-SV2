/**
 * checks username is avaliable or not.
 * rules:
 *     - length >= 3
 *     - should only have chars in [0-9a-zA-Z_-], first and last is not '-'
 *     - should not equal to any reserved name (in the list) 
 * @param username string
 * @return boolean
 */
function UsernameIsGood(username) {

    if (username.length < 3)
        return false;
    if (!username.match(/^[0-9a-zA-Z_]+[0-9a-zA-Z_-]*[0-9a-zA-Z_]+$/))
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
    return !reservedList.includes(username);
}

function AnnouncementTitleIsGood(title) {
    return title && title.length > 0 && title.length < 81;
}

/**
 * check whether str is a string representation of a non-negative integer
 * @param {*} str 
 */
function isNonNegative(str) {
    return str.match(/^-{0,1}\d+$/);
}

/**
 * if valStr is null, return defaultValue;
 * if valStr is not a string representation of a non-negative integer, throw an error
 * otherwise, return the integer represented by valStr
 * @param {*} valStr 
 * @param {*} defaultValue 
 */
function expectNonNegative(valStr, defaultValue) {
    if (!valStr) {
        return defaultValue;
    } else if (!isNonNegative(valStr)) {
        throw new Error('it is not a non-negative number');
    } else {
        return parseInt(valStr);
    }
}

function guideTitleIsOK(title) {
    return title && title.length <= 40;
}

module.exports = {
    UsernameIsGood: UsernameIsGood,
    AnnouncementTitleIsGood: AnnouncementTitleIsGood,
    isNonNegative: isNonNegative,
    expectNonNegative: expectNonNegative,
    guideTitleIsOK: guideTitleIsOK
}