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
    var bottomTweets = tweetQueue.splice(0, 4);
    var centerTweet = tweetQueue.shift();
    var topTweets = tweetQueue.splice(0, 4);


    $.each( bottomTweets, function(index, tweet) {
        $('.timelineBOTTOM').prepend(buildTweetHTML(tweet));
    });

    $('.centerTweet').prepend(buildTweetHTML(centerTweet));

    $.each( topTweets, function(index, tweet) {
        $('.timelineTOP').prepend(buildTweetHTML(tweet));
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

    $('.timelineTOP').prepend(buildTweetHTML(newTweet));
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

getNewTweets(1);

$(document).everyTime(30000, function() { rotateTweets(); }, 0); 

$(document).everyTime(300000, function() { getNewTweets(); }, 0);
