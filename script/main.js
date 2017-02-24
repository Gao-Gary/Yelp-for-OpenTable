$(function() {
    if ($('body').hasClass('restaurant domain-com')) {
        // if page is a restaurant listing
        init();                     // render link and text box into page

        getResInfo(function (name, location) {

            getResID(name, location, function (id, rating, link, count) {

                getReviews(id, rating, link, function (result, avgResult, link) {
                        $yelp.text('');
                        renderOverall(avgResult, link, count);
                        var $reviewBox = $(document.createElement('div'));
                        $reviewBox.addClass('reviews-results');
                        $yelpBox.append($reviewBox);
                        $yelpBox.find('.reviews-results').css({
                            "padding": "20px"
                        });
                        $.each(result, renderReviews);
                    }
                    , function (string) {
                        $yelp.text(string);
                    });
            }, function (string) {
                $yelp.text(string);
            })

        })
    }

// callback is function(string, string)
// grabs restaurant information from page as queryString for ID search
function getResInfo(callback) {
    var $resName = $('div.profile-header-meta h1').text();
    var $resLoc = $('div.content-block-map-info div').text();

    callback($resName, $resLoc);
}

// callback is function(string, string, string, string)
// grabs restaurant id from api call and passes to review retriever
function getResID(name, location, callback, errorCallback) {
    $.ajax({
        url: "https://api.yelp.com/v3/businesses/search",
        type: "get",
        data: {
            term: name,
            location: location,
            limit: 1
        },
        headers: {"Authorization": "Bearer YT5DWSAAKlqAAer0-rapgayJp2Zk6XmKQ3i58uOnMJXCpWFo-Rf2-aAvJb0JbZ3Ypr3pC9bE-EiQtHiXLGDSCXxW_j62f7dCbIiKYKkylNVReTsFMkKHaYw-CTyiWHYx"},
        success: function(response){
            if(response.length < 1) {
                errorCallback('Restaurant not found');
                return;
            }

            var $resID = response.businesses[0].id;
            var $resRating = response.businesses[0].rating;
            var $resLink = response.businesses[0].url;
            var $resTotalCount = response.businesses[0].review_count;
            callback($resID, $resRating, $resLink, $resTotalCount);

        },
        error: function() {
            errorCallback('Error retrieving business information.');
        }

    });
}

// callback is function(array, double, string)
// grabs reviews from 2nd api call and passes result and avgRating to renderer
function getReviews(id, rating, link, callback, errorCallback) {

    $.ajax({
        url: "https://api.yelp.com/v3/businesses/" + id + "/reviews",
        type: "get",
        headers: {"Authorization": "Bearer YT5DWSAAKlqAAer0-rapgayJp2Zk6XmKQ3i58uOnMJXCpWFo-Rf2-aAvJb0JbZ3Ypr3pC9bE-EiQtHiXLGDSCXxW_j62f7dCbIiKYKkylNVReTsFMkKHaYw-CTyiWHYx"},
        success: function(response){
            if(response.length < 1) {
                errorCallback('No reviews found');
                return;
            }

            var result = [];               // store reviews in an array
            var avgRating = rating;
            for(var x = 0; x < 3; x++) {
                result.push({
                    text: response.reviews[x].text,
                    score: response.reviews[x].rating,
                    url: response.reviews[x].url,
                    name: response.reviews[x].user.name,
                    time: response.reviews[x].time_created
                });
            }

            callback(result, avgRating, link);

        },
        error: function() {
            errorCallback('Error grabbing reviews');
        }

    })
}

// Overall construction of review section before review insertion
function renderOverall(avgResult, link, count) {
    var $row = $(document.createElement('div'));
    $row.addClass('row');

    var $leftCol1 = $(document.createElement('div'));
    $leftCol1.addClass('column small-3 medium-2');
    var $leftCol2 = $(document.createElement('div'));
    $leftCol2.addClass('review-overall-score');
    var $msg1 = $(document.createElement('h1'));

    var $linkWrapper2 = $(document.createElement('a'));
    $linkWrapper2.attr('href', link);
    $linkWrapper2.append(avgResult);

    $msg1.append($linkWrapper2);
    $leftCol2.append($msg1);
    $leftCol1.append($leftCol2);
    $row.append($leftCol1);

    var $rightCol1 = $(document.createElement('div'));
    $rightCol1.addClass('column small-9 medium-10');
    var $rightCol2 = $(document.createElement('div'));
    $rightCol2.addClass('reviews-overall-info');

    var $rightCol3 = $(document.createElement('div'));
    $rightCol3.addClass('star-rating margin-bottom-small');

    var $newLink = $(document.createElement('a'));
    $newLink.text('Average Yelp Score');
    $newLink.prop('href', link);
    var $linkHolder = $(document.createElement('h4'));
    $linkHolder.append($newLink);

    var $span = $(document.createElement('span'));
    var $newMsg = "Based on " + count + " Yelp reviews";

    var $linkWrapper3 = $(document.createElement('a'));
    $linkWrapper3.attr('href', link);
    $linkWrapper3.append($newMsg);

    $span.append($linkWrapper3);
    $span.addClass('star-rating-text color-light hide-for-xsmall-only');

    var $starW = $(document.createElement('div'));
    $starW.addClass('star-wrapper small');

    var $yelpStars = $(document.createElement('img'));
    var $chooser = toStar(avgResult);
    $yelpStars.attr('src', $chooser);

    var $linkWrapper = $(document.createElement('a'));
    $linkWrapper.attr('href', this.url);
    $linkWrapper.append($yelpStars);

    $starW.append($linkWrapper);
    $rightCol3.append($starW);
    $rightCol3.append($span);

    $rightCol2.append($linkHolder);
    $rightCol2.append($rightCol3);
    $rightCol1.append($rightCol2);
    $row.append($rightCol1);
    $yelp.append($row);

    var $img = $(document.createElement('img'));
    var imgURL = chrome.extension.getURL("images/logo.png");
    $img.attr('src', imgURL);
    var $imgLink = $(document.createElement('a'));
    $imgLink.attr('href', "https://www.yelp.com/");
    $imgLink.append($img);
    $yelpBox.append($imgLink);

    $yelpBox.css({
        "position" : "relative"
    });
    $img.css({
        "position" : "absolute",
        "top" : "0px",
        "right" : "0px"
    });
    $leftCol1.css({
        "padding-left" : "70px"
    });
}

function renderReviews() {
    var msg = this.text;
    var $row = $(document.createElement('div'));
    $row.addClass('row');

    var $container = $(document.createElement('div'));
    $container.addClass('column medium-9');

    var $main = $(document.createElement('div'));
    $main.addClass('review-main');

    var $content = $(document.createElement('div'));
    $content.addClass('review-content');
    $content.prop('lang', 'en-US');

    var $review = $(document.createElement('p'));
    var $link = $(document.createElement('a'));
    $link.prop('href', this.url);
    $link.append("Click here to read more on Yelp...");
    $review.append(msg);
    $review.append($link);
    $content.append($review);

    var $meta = $(document.createElement('div'));
    $meta.addClass('review-meta');

    var $stars = $(document.createElement('div'));
    $stars.addClass('star-rating');

    var $starW = $(document.createElement('div'));
    $starW.addClass('star-wrapper');

    var $yelpStars = $(document.createElement('img'));
    var $chooser = toStar(this.score);
    $yelpStars.attr('src', $chooser);

    var $linkWrapper = $(document.createElement('a'));
    $linkWrapper.attr('href', this.url);
    $linkWrapper.append($yelpStars);

    $starW.append($linkWrapper);
    $stars.append($starW);
    $meta.append($stars);

    var $span1 = $(document.createElement('span'));
    $span1.addClass('color-light');

    var $spanSpan = $(document.createElement('span'));
    $spanSpan.addClass('review-meta-user');
    var $spanDiv = $(document.createElement('div'));
    $spanDiv.addClass('review-diner-info');

    var $spanWrap = $(document.createElement('span'));
    var $spanAuth = $(document.createElement('span'));
    $spanAuth.append(this.name);

    $spanWrap.append($spanAuth);
    $spanDiv.append($spanWrap);
    $span1.append($spanSpan);
    $span1.append($spanDiv);

    var $span2 = $(document.createElement('span'));
    $span2.addClass('color-light review-meta-separator');
    $span2.append('.');

    var $span3 = $(document.createElement('span'));
    $span3.addClass('color-light');
    var date = "Dined on " + this.time;
    $span3.append(date);

    $meta.append($span1);
    $meta.append($span2);
    $meta.append($span3);

    var $text = $(document.createElement('h4'));
    $text.addClass('review-title hide');
    $text.prop('lang','en-US');
    $text.text(this.text);
    $main.append($text);

    $main.append($meta);
    $main.append($content);
    $container.append($main);
    $row.append($container);
    $yelpBox.find('.reviews-results').append($row);
    $yelpBox.find('.reviews-results').append('<br>');
    $starW.css({
        "padding-top" : "3px"
    });
    $span3.css({
        "padding-top" : "11px"
    });
    $span2.css({
        "padding-top" : "6px"
    });
}

// returns extension rooted URL for appropriate stars image
function toStar(rating) {
    var star0 = chrome.extension.getURL("images/small_0.png");
    var star1 = chrome.extension.getURL("images/small_1.png");
    var star1half = chrome.extension.getURL("images/small_1_half.png");
    var star2 = chrome.extension.getURL("images/small_2.png");
    var star2half = chrome.extension.getURL("images/small_2_half.png");
    var star3 = chrome.extension.getURL("images/small_3.png");
    var star3half = chrome.extension.getURL("images/small_3_half.png");
    var star4 = chrome.extension.getURL("images/small_4.png");
    var star4half = chrome.extension.getURL("images/small_4_half.png");
    var star5 = chrome.extension.getURL("images/small_5.png");

    if (rating >= 5) {
        return star5;
    } else if (rating >= 4.5) {
        return star4half;
    } else if (rating >= 4) {
        return star4;
    } else if (rating >= 3.5) {
        return star3half;
    } else if (rating >= 3) {
        return star3;
    } else if (rating >=2.5) {
        return star2half;
    } else if (rating >=2) {
        return star2;
    } else if (rating >= 1.5) {
        return star1half;
    } else if (rating >= 1) {
        return star1;
    } else return star0;
}

// sets up page in preparation for api request
function init() {
    var $yelpLink = $(document.createElement('li'));
    $yelpLink.addClass('yelp-link');
    var $inside = $(document.createElement('a'));
    $inside.addClass('page-nav-link');
    $inside.text('Yelp Reviews');
    $inside.attr('href', '#yelp');
    $yelpLink.append($inside);
    $('nav.page-nav ul').append($yelpLink);  // finished inserting link

    var $yelpBox = $(document.createElement('div'));
    $yelpBox.addClass('content-block main-container');
    $yelpBox.attr('id', 'yelp');

    var $yelpSubBox = $(document.createElement('div'));
    $yelpSubBox.addClass('content-block-header');
    $yelpSubBox.html('<h3> Loading Yelp reviews.... </h3>');
    $yelpBox.append($yelpSubBox);
    var $appendSpot = $('div.column').not('.small-6, .medium-6, .medium-3, .medium-9, .medium-10, .small-3, .medium-2, .medium-12, .large-2, .small-9');
    $appendSpot.children().last().before($yelpBox);
}

var $yelp = $('#yelp div');
var $yelpBox = $('#yelp');
});









