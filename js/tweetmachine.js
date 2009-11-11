// Global variables
var tweetQueue = new Array();
var lastTweetId = 1;

// Initialization
$.ajaxSetup({
    username: '',
    password: '',
});

function getNewTweets() {
    air.trace('getting new tweets');
    $.getJSON('http://twitter.com/statuses/friends_timeline.json?since_id=' + lastTweetId, function(tweets) {
        tweets.reverse();
        tweetQueue = tweetQueue.concat(tweets);
        lastTweetId = tweets[tweets.length - 1].id;
    });
}

function centerNewTweet() {
    air.trace('centering tweet');
    var newTweet = tweetQueue.shift();
    if ( typeof newTweet == 'undefined' ) {
        return;
    }
    $('#tweets').prepend('<li>' + newTweet.user.screen_name + ' - ' + newTweet.text + '</li>');
    updateQueueLength();
}

function updateQueueLength() {
    air.trace('updateQueueLength:' + tweetQueue.length);
    $('#queueLength').text(tweetQueue.length);
}

getNewTweets();

$(document).everyTime(30000, function() { centerNewTweet(); }, 0); 

$(document).everyTime(300000, function() { getNewTweets(); }, 0);
