#!/usr/bin/perl
use strict;
use warnings;
use Net::Twitter;

my $nt = Net::Twitter->new(
    traits          => ['API::REST', 'OAuth'],
    consumer_key    => "",
    consumer_secret => "",
    );


print "Authorize this app at ", $nt->get_authorization_url, " and enter the PIN#\n";

my $pin = <STDIN>; # wait for input
chomp $pin;

my($access_token, $access_token_secret, $user_id, $screen_name) = $nt->request_access_token(verifier => $pin);
print "access_token: $access_token\n";
print "access_token_secret: $access_token_secret\n";
