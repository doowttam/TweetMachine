// Settings
var searchQuery = '#como';
var searchMode  = false;

// Global variables
var tweetQueue   = [];
var lastTweetId  = 1;
var tweetBuilder = null;

var oauth = getOauth('doowttam');

function getOauth( account ) {
    var oauth_options = {
        consumerKey: keys.consumerKey,
        consumerSecret: keys.consumerSecret,
        accessTokenKey: keys[account].accessTokenKey,
        accessTokenSecret: keys[account].accessTokenSecret
    };
    return OAuth( oauth_options );
}

function buildTimelineTweetHTML(tweet) {
    return "<div class='tweet'>"
        + "<div class='avatar'><img src='" + tweet.user.profile_image_url + "' /></div>"
        + "<div class='tweetBody'><span class='username'>"
        + tweet.user.screen_name + "</span><span class='tweetText'>"
        + tweet.text + "</span></div></div>";
}

function buildSearchTweetHTML(tweet) {
    return "<div class='tweet'>"
        + "<div class='avatar'><img src='" + tweet.profile_image_url + "' /></div>"
        + "<div class='tweetBody'><span class='username'>"
        + tweet.from_user + "</span><span class='tweetText'>"
        + tweet.text + "</span></div></div>";
}

function getTimeline(populate) {
    air.trace('Getting new timeline tweets');
    oauth.get('http://api.twitter.com/1/statuses/home_timeline.json?since_id=' + lastTweetId, function(data) {
        var tweets = $.parseJSON(data.text);
        queueTweets(tweets, populate);
    });
}

function getSearch(populate) {
    air.trace('Getting new search tweets');
    var url = 'http://search.twitter.com/search.json?q=' + encodeURIComponent(searchQuery) + '&rpp=30&lang=en&since_id=' + lastTweetId;
    $.getJSON(url, function(data) {
        var tweets = data.results;
        queueTweets(tweets, populate);
    });
}

function queueTweets(tweets, populate) {
    if (tweets.length > 1) {
        tweets.reverse();
        tweetQueue = tweetQueue.concat(tweets);
        lastTweetId = tweets[tweets.length - 1].id;
    } else if ( tweets.length > 0 ) {
        lastTweetId = tweets[0].id;
    }
    if (populate == 1) {
        initialPopulate();
    }
}

function getNewTweets(populate) {
    air.trace('Getting new tweets');

    if ( searchMode ) {
        tweetBuilder = buildSearchTweetHTML;
        getSearch(populate);
    }
    else {
        tweetBuilder = buildTimelineTweetHTML;
        getTimeline(populate);
    }
}

function initialPopulate() {
    var bottomTweets = tweetQueue.splice(0, 4);
    var centerTweet = tweetQueue.shift();
    var topTweets = tweetQueue.splice(0, 4);


    $.each( bottomTweets, function(index, tweet) {
        $('.timelineBOTTOM').prepend(tweetBuilder(tweet));
    });

    $('.centerTweet').prepend(tweetBuilder(centerTweet));

    $.each( topTweets, function(index, tweet) {
        $('.timelineTOP').prepend(tweetBuilder(tweet));
    });

    $('.tweet').show();
    updateQueueLength();
}

function rotateTweets() {
    air.trace('Rotating Tweets');
    var newTweet = tweetQueue.shift();
    if ( typeof newTweet == 'undefined' ) {
        return;
    }

    $('.timelineTOP').prepend(tweetBuilder(newTweet));
    $('.timelineTOP > .tweet:last-child').clone().css('display', 'none').prependTo('.centerTweet');
    $('.centerTweet > .tweet:last-child').clone().css('display', 'none').prependTo('.timelineBOTTOM');

    $('.timelineTOP > .tweet:first-child').slideDown("normal", function() {
        if ( $('.timelineTOP .tweet').size() > 4 ) {
            $('.timelineTOP > .tweet:last-child').remove();
        }

    });
    
    $('.centerTweet > .tweet:first-child').slideDown("normal", function() {
        if ( $('.centerTweet .tweet').size() > 1 ) {
            $('.centerTweet > .tweet:last-child').remove();
        }
    });

    $('.timelineBOTTOM > .tweet:first-child').slideDown("normal", function() {
        if ( $('.timelineBOTTOM .tweet').size() > 4 ) {
            $('.timelineBOTTOM > .tweet:last-child').remove();
        }
    });

    updateQueueLength();
}

function updateQueueLength() {
    air.trace('updateQueueLength:' + tweetQueue.length);
}

function setBackgroundColor() {
    if ( searchMode ) {
        $('body').css('background-color', '#9156e8');
    }
    else {
        $('body').css('background-color', '#56e1e8');
    }
}

function init() {
    air.trace('init');

    setBackgroundColor();

    getNewTweets(1);

    $(document).everyTime(30000, function() { rotateTweets(); }, 0);

    $(document).everyTime(300000, function() { getNewTweets(); }, 0);
}

function showSwitcher() {
    if ( $('.switcherWrapper').css('display') == 'block' ) {
        return;
    }

    $('.switcherWrapper').css('display', 'block');

    setTimeout(function() {
        hideSwitcher();
    }, 5000 );
}

function hideSwitcher() {
    $('.switcherWrapper').css('display', 'none');
}

function pick(type) {
    air.trace('picking mode: ' + type);

    hideSwitcher();

    tweetQueue  = [];
    lastTweetId = 1;

    if ( type == 'search' ) {
        searchMode = true;
    }
    else {
        searchMode = false;
        oauth = getOauth(type);
    }

    // Clear out tweets
    $('div.tweets').each(function(index, div) {
        $(div).html('');
    });

    getNewTweets(1);

    setBackgroundColor(type);
}
