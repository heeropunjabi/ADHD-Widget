(function ($, document, window, undefined) {
    this.application = this.application || {};
    this.application.utilities = this.application.utilities || {};
    this.application.math = this.application.math || {};
    this.application.system = this.application.system || {};

    var applicationConstants = {
        urls: {
            readAboutTestLinkUrl: 'http://google.com',
            postToDiaryLinkUrl: 'http://google.com'
        }
    };

    var globals = {

    };

    application.requestFullScreen = function (element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
    };
    application.requestTestFeedback = function (elementSelector, goBackUrl, score, immediates) {
        var element = $(elementSelector),
            hostingDiv = $('<div style="width:210px; padding:8px; margin:auto">'),
            goBackButton = $('<button type="button" class="btn btn-default btn-circle btn-lg"><i class="glyphicon glyphicon-ok"></i></button>').on('click', function () {
                window.location.href = goBackUrl;
            }),
            aboutResultsButton = $('<button type="button" class="btn btn-default btn-circle btn-lg"><i class="glyphicon glyphicon-question-sign"></i></button>').on('click', function () {
                window.location.href = applicationConstants.urls.readAboutTestLinkUrl;
            }),
            postToDiaryButton = $('<button type="button" class="btn btn-default btn-circle btn-lg"><i class="glyphicon glyphicon-thumbs-up"></i></button>').on('click', function () {
                window.location.href = applicationConstants.urls.postToDiaryLinkUrl;
            });

        goBackButton.appendTo(hostingDiv);
        aboutResultsButton.appendTo(hostingDiv);
        postToDiaryButton.appendTo(hostingDiv);

        hostingDiv.appendTo(element);
    };
    application.shareResults = function (elementSelector, post) {
        if (typeof (jsSocials) === 'undefined')
            return;

        $(elementSelector).jsSocials({
            text: JSON.stringify(post),
            shares: [
                {
                    share: 'email',
                    logo: 'glyphicon glyphicon-envelope'
                },
                {
                    share: 'twitter',
                    logo: 'glyphicon glyphicon-bell'
                },
                {
                    share: 'facebook',
                    logo: 'glyphicon glyphicon-thumbs-up'
                },
                {
                    share: 'whatsapp',
                    logo: 'glyphicon glyphicon-share'
                },
                {
                    share: 'messenger',
                    logo: 'glyphicon glyphicon-phone'
                }]
        });
    };
    application.createCountdownTracker = function (elementSelector, totalMilliseconds) {
        if (typeof (Timer) === 'undefiend')
            return;

        var timer = new Timer(),
            lastUntilSeconds = totalMilliseconds / 1000,
            target = $(elementSelector),
            timeHostingDiv = $('<div class="text-muted pull-right timer">').appendTo(target);

        timer.start({ countdown: true, startValues: { seconds: lastUntilSeconds } });

        timeHostingDiv.html(timer.getTimeValues().toString() + " remaining");

        timer.addEventListener('secondsUpdated', function (e) {
            var currentTime = timer.getTimeValues(),
                currentTotalTime = timer.getTotalTimeValues(),
                percent = ((lastUntilSeconds - currentTotalTime.seconds) * 100) / lastUntilSeconds;

            timeHostingDiv.html(currentTime.toString() + " remaining");
        });
        timer.addEventListener('targetAchieved', function (e) {
            target.remove();
        });
    };

    application.math.getRandomWithin = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    application.math.getWithProbability = function (list, weight) {
        var total_weight = weight.reduce(function (prev, cur, i, arr) {
            return prev + cur;
        }),
            random_num = application.math.getRandomWithin(0, total_weight),
            weight_sum = 0;

        for (var i = 0, $length = list.length; i < $length; i++) {
            weight_sum += weight[i];
            weight_sum = +weight_sum.toFixed(2);

            if (random_num <= weight_sum) {
                return list[i];
            }
        }
    };
    application.math.failToZero = function (run) {
        var result = 0;
        try {
            result = run();
        }
        catch (error) {
            result = 0;
        }
        return result;
    };

    application.math.normalize = function (value, normalizeTo, perfectScore, inverse) {
        perfectScore = perfectScore || value;

        if (inverse) {
            return perfectScore / value * normalizeTo;
        }

        return value * normalizeTo / perfectScore;
    };

    application.system.getTime = function () {
        return new Date().getTime();
    };

    application.utilities.debounce = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments,
                later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                },
                callNow = immediate && !timeout;

            clearTimeout(timeout);

            timeout = setTimeout(later, wait);

            if (callNow) {
                func.apply(context, args);
            }
        };
    };
    application.utilities.poll = function (fn, callback, errback, timeout, interval) {
        var endTime = Number(new Date()) + (timeout || 2000);
        interval = interval || 100;

        (function p() {
            if (fn()) {
                callback();
            }
            else if (Number(new Date()) < endTime) {
                setTimeout(p, interval);
            }
            else {
                errback(new Error('timed out for ' + fn + ': ' + arguments));
            }
        })();
    };
    application.utilities.once = function (fn, context) {
        var result;
        return function () {
            if (fn) {
                result = fn.apply(context || this, arguments);
                fn = null;
            }
            return result;
        };
    };
    application.utilities.captureDoubleKeyPress = function (key, target, callback) {
        var key = key || " ",
            delta = 500,
            target = target || document;

        $(target).keypress(function (e) {
            var newTime = new Date();

            if (typeof globals.lastKeypressCharCode === 'undefined' || typeof globals.lastKeypressCharCode === 'undefined') {
                globals.lastKeypressCharCode = e.charCode;
                globals.lastKeypressTime = newTime;

                return;
            }

            if (newTime - globals.lastKeypressTime <= delta) {
                globals.lastKeypressTime = newTime;
                callback();
            }
        });
    };
})(jQuery, document, window, undefined);

