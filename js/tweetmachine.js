// Global variables
var tweetQueue = new Array();
var lastTweetId = 1;

// Initialization
$.ajaxSetup({
    username: '',
    password: '',
});

function buildTweetHTML(tweet) {
    return "<div class='tweet'>"
        + "<div class='avatar'><img src='" + tweet.user.profile_image_url + "' /></div>"
        + "<div class='tweetBody'><span class='username'>"
        + tweet.user.screen_name + "</span><span class='tweetText'>"
        + tweet.text + "</span></div></div>";
}

function getNewTweets(populate) {
    air.trace('Getting new tweets');
    $.getJSON('http://twitter.com/statuses/friends_timeline.json?since_id=' + lastTweetId, function(tweets) {
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
    });
}

function initialPopulate() {
    var initialTweets = tweetQueue.splice(0, 10);
    $.each( initialTweets, function(index, tweet) {
        $('#timeline').prepend(buildTweetHTML(tweet));
    });
    updateQueueLength();
}

function rotateTweets() {
    air.trace('Rotating Tweets');
    var newTweet = tweetQueue.shift();
    if ( typeof newTweet == 'undefined' ) {
        return;
    }

    if ( $('.tweet').size() > 9 ) {
        $('.tweet:last').remove();
    }

    $('#timeline').prepend(buildTweetHTML(newTweet));
    updateQueueLength();
}

function updateQueueLength() {
    air.trace('updateQueueLength:' + tweetQueue.length);
    $('#queueLength').text(tweetQueue.length);
}

getNewTweets(1);

$(document).everyTime(30000, function() { rotateTweets(); }, 0); 

$(document).everyTime(300000, function() { getNewTweets(); }, 0);
