/*
* Focus-hyperactivity test with encouragement and other minor modifications for Michael Shenfield
*/

(function ($, document, window, undefined) {
    var getTime = function () {
        return new Date().getTime();
    };
    this.setSettings = function (settings) {
        var stringSettingsValue;

        if (typeof settings === 'String') {
            stringSettingsValue = settings;
        }
        else {
            stringSettingsValue = JSON.stringify(settings);
        }

        localStorage.setItem('focus_hyperactivity_4_settings', stringSettingsValue);

        return JSON.parse(stringSettingsValue);
    };
    var getSettings = function () {
        var settingsEntry = localStorage.getItem('focus_hyperactivity_4_settings');
        return JSON.parse(settingsEntry);
    };
    var prepareSequence = function () {
        var settings = getSettings(),
            timePerInterval = settings.totalTime / settings.intervals.length,
            result = [];

        for (var i = 0, $length = settings.intervals.length; i < $length; i++) {
            var allocatedTime = 0;
            while (allocatedTime <= timePerInterval) {
                var lastFor = timePerInterval / settings.itemsPerInterval,//TODO add deviation
                    onlyTargetRecords = settings.intervalParams.filter(function (element) {
                        return element.key === settings.intervals[i];
                    });
                var targetEntries = onlyTargetRecords[0].data,
                    targetValues = targetEntries.map(function (element) {
                        return {
                            "lastFor": lastFor,
                            "value": element.value,
                            "source": element.source,
                        };
                    }),
                    targetProbabilities = targetEntries.map(function (element) {
                        return element.probability;
                    }),
                    entry = application.math.getWithProbability(targetValues, targetProbabilities);

                result.push(entry);
                allocatedTime += lastFor;
            }
        }
        return result;
    };
    this.renderCurrentRank = function (resultsContainer, results, callback) {
        var hits = 0,
            misses = 0,
            gaps = 0,
            errors = 0,
            expected = 0,
            totalHitsTime = 0,
            overallScore = 0,
            immediates = {},
            overallScoreContainer = $('<div style="width:300px;margin:auto;">').appendTo(resultsContainer)[0];

        for (var i = 0, $length = results.length; i < $length; i++) {
            if (results[i].shouldReact && results[i].reacted) {
                hits++;
                expected++;
                totalHitsTime += results[i].reactedAt - results[i].postedAt;
            }
            else if (results[i].shouldReact && !results[i].reacted) {
                misses++;
                expected++;
            }
            else if (!results[i].shouldReact && results[i].reacted) {
                errors++;
            }
            else if (!results[i].shouldReact && !results[i].reacted) {
                gaps++;
            }
        }

        overallScore = expected === 0 ? 100 : (hits / expected) * 100;

        $(resultsContainer).show();

        var circle = new ProgressBar.Circle(overallScoreContainer, {
            color: '#fff',
            strokeWidth: 3,
            trailWidth: 1,
            duration: 1000,
            text: { value: '0' },
            step: function (state, bar) {
                bar.setText((bar.value() * 100).toFixed(0));
            }
        });

        circle.animate(overallScore / 100);

        immediates.speed = application.math.failToZero(function () { return totalHitsTime / hits; });
        immediates.impulsivity = application.math.failToZero(function () { return 1 / errors; });
        immediates.accuracy = application.math.failToZero(function () { return (hits + gaps) / (hits + errors + misses + gaps); });

        if (typeof callback !== 'undefined') {
            callback(results, immediates, overallScore);
        }
    };

    this.startTest = function (targetSelector, resultsSelector, additionalControlsSelector, callback) {
        var setupSettings = getSettings(),
            attention = function (source, value) {
                this.source = source;
                this.postedAt = getTime();
                this.shouldReact = value === setupSettings.mustBe;
                this.reacted = false;
                this.reactedAt = undefined;
                this.fluctuations = [];
            },
            additionalControls = $(additionalControlsSelector),
            audio = $('audio', additionalControls),
            target = $(targetSelector),
            attentionRow = [],
            entries = prepareSequence(),
            currentEntryIndex = 0,
            results = $(resultsSelector),
            globalTestTimeout,
            testInProgress = false;

        var run = function () {
            if (entries.length - 1 === currentEntryIndex) {
                clearTimeout(globalTestTimeout);
                renderCurrentRank(results, attentionRow, callback);
                target.hide();
                testInProgress = false;
            } else {
                var entry = entries[currentEntryIndex];
                attentionRow.push(new attention(entry.source, entry.value));
                target.html('&nbsp;');

                if (entry.source === 'visual') {
                    target.html(entry.value);
                } else if (entry.source === 'audio') {
                    audio[entry.value - 1].play();
                } else {
                    target.html('&nbsp;');
                }
                currentEntryIndex++;
                globalTestTimeout = setTimeout(run, entry.lastFor);
            }
        };

        testInProgress = true;

        run();

        $(document).on('mouseup keypress', function (e) {
            var lastEntry = attentionRow[attentionRow.length - 1];
            if (lastEntry.reacted) {
                lastEntry.fluctuations.push(getTime());
            }
            lastEntry.reacted = true;
            lastEntry.reactedAt = getTime();

            console.log(lastEntry);

            if (testInProgress && lastEntry.reacted === lastEntry.shouldReact) {
                var animations = ['bounce', 'rubberBand', 'headShake', 'swing', 'tada', 'wobble', 'jello',
                    'bounceIn', 'fadeOut', 'slideInDown', 'slideOutUp', 'fadeIn', 'fadeInDown',
                    'fadeInLeft', 'fadeInLeftBig', 'fadeInRight', 'fadeInUp', 'slideInLeft', 'slideInRight',
                    'slideInUp', 'slideOutDown', 'slideOutLeft', 'slideOutRight', 'jackInTheBox', 'lightSpeedIn',
                    'pulse', 'fadeOutUp', 'lightSpeedOut', 'rotateIn', 'rollIn',
                    'zoomIn', 'zoomInDown', 'zoomInLeft', 'zoomInRight', 'zoomInUp', 'zoomOutDown', 'zoomOutLeft', 'zoomOutUp'],
                    encouragements = ['Almost There!', 'Good Job!', 'Keep Going!', 'You\'re Doing Amazing', 'You\'re Doing Great'],
                    star = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="23">' +
                        '<polygon points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78" fill="#ffd055"/>' +
                        '</svg>',
                    animation = animations[application.math.getRandomWithin(0, animations.length - 1).toFixed(0)],
                    encouragement = encouragements[application.math.getRandomWithin(0, encouragements.length - 1).toFixed(0)],
                    delay = 1100;

                var encouragements = ['Almost There!', 'Good Job!', 'Keep Going!', 'You\'re Doing Amazing', 'You\'re Doing Great'];
                var circleHeight = ["150px", "156px", "160px", "166px", "170px"];
                var circleColors = ["#f9b24d", "#3cba54", "#f4c20d", " #db3236", "#4885ed"];


                var randomCircleHeight = circleHeight[application.math.getRandomWithin(0, circleHeight.length - 1).toFixed(0)];
                var randomColor = circleColors[application.math.getRandomWithin(0, circleColors.length - 1).toFixed(0)];

                //'flipInX','flipInY', 'flipOutX', 'flipOutY', 'rotateInDownLeft', 'rotateInDownRight','rotateInUpLeft', 'rotateInUpRight','zoomOutRight'
                //'bounceOutRight', 'bounceOutUp', 'bounceOut', 'bounceOutDown', 'bounceOutLeft','fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig',
                //'fadeOutRight', 'fadeOutRightBig','rollOut','fadeInRightBig', 'hinge','fadeInUpBig','bounceInUp','rotateOutDownLeft', 'rotateOutDownRight',
                //'fadeOutUpBig','flash', 'bounceInLeft', 'bounceInRight',  'zoomOut', 'fadeInDownBig', 'rotateOutUpRight', 'bounceInDown', 
                //'rotateOut', 'rotateOutUpLeft',  'shake',

                $("<div id='circle'>").html(encouragement)
                    .css('color', 'white')
                    .css("background", randomColor)
                    .css("height", randomCircleHeight)
                    .css("width", randomCircleHeight)
                    .css("line-height", randomCircleHeight)
                    .css('position', 'absolute')
                    .css('left', e.clientX)
                    .css('top', e.clientY)
                    .addClass('animated ' + animation)
                    .appendTo($('body')).delay(delay).queue(function () { $(this).remove(); });

                    var correct = "<img src='https://cdn0.iconfinder.com/data/icons/shift-symbol/32/Complete_Symbol-32.png' alt='ADHD Assist' class='logo_standard'>";
                    $("#test-progress").append(correct);

            }
            else{
                var incorrect = "<img src='https://cdn0.iconfinder.com/data/icons/shift-symbol/32/Incorrect_Symbol-32.png' alt='ADHD Assist' class='logo_standard'>";
                $("#test-progress").append(incorrect);
            }
        });
    };
})(jQuery, document, window, undefined);
