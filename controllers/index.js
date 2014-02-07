/**
 * Index page of the pencilblue theme
 * 
 * @author Blake Callens <blake@pencilblue.org>
 * @copyright PencilBlue 2013, All rights reserved
 */
function Index(){}

//inheritance
util.inherits(Logout, pb.BaseController);

Index.prototype.render = function() {
	//move setup check to settings
	//add function to security to see if setup
	//modify route definitions
	//modify request handler to inspect security
	//implement functionality below
	//add route definition for controller
};

Index.init = function(request, output)
{
    var result = '';
    var instance = this;
    
    getDBObjectsWithValues({object_type: 'user'}, function(data)
    {
        if(data.length == 0)
        {
            output({redirect: pb.config.siteRoot + '/setup'});
            return;
        }
    
        getSession(request, function(session)
        {
            initLocalization(request, session, function(data)
            {
                getHTMLTemplate('index', '^loc_HOME^', null, function(data)
                {
                    result = result.concat(data);
                                    
                    require('../include/theme/top_menu').getTopMenu(session, function(themeSettings, navigation, accountButtons)
                    {
                        var section = request.pencilblue_section || null;
                        var topic = request.pencilblue_topic || null;
                        var article = request.pencilblue_article || null;
                        var page = request.pencilblue_page || null;
                        
                        require('../include/theme/articles').getArticles(section, topic, article, page, function(articles)
                        {
                            require('../include/theme/media').getCarousel(themeSettings.carousel_media, result, '^carousel^', 'index_carousel', function(newResult)
                            {
                                getContentSettings(function(contentSettings)
                                {
                                    var comments = require('../include/theme/comments');
                                    
                                    comments.getCommentsTemplate(contentSettings, function(commentsTemplate)
                                    {
                                        result = result.split('^comments^').join(commentsTemplate);
                                        
                                        var loggedIn = false;
                                        var commentingUser = {};
                                        if(session.user)
                                        {
                                            loggedIn = true;
                                            commentingUser = comments.getCommentingUser(session.user);
                                        }
                                
                                        result = result.concat(getAngularController(
                                        {
                                            navigation: navigation,
                                            contentSettings: contentSettings,
                                            loggedIn: loggedIn,
                                            commentingUser: commentingUser,
                                            themeSettings: themeSettings,
                                            accountButtons: accountButtons,
                                            articles: articles,
                                            trustHTML: 'function(string){return $sce.trustAsHtml(string);}'
                                        }, ['ngSanitize']));
                                    
                                        getHTMLTemplate('footer', null, null, function(data)
                                        {
                                            result = result.concat(data);
                                            output({cookie: getSessionCookie(session), content: localize(['pencilblue_generic', 'timestamp'], result)});
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

//exports
module.exports = Index;
