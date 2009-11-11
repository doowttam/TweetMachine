// Global variables
var tweetQueue = new Array();

// Initialization
$.ajaxSetup({
    username: '',
    password: '',
    type: 'json'
});

$.getJSON('http://twitter.com/statuses/friends_timeline.json', function(tweets) {
    $.each( tweets, function(i, tweet) {
        $('#tweets').append('<li>' + tweet.text + '</li>');
    } );
});