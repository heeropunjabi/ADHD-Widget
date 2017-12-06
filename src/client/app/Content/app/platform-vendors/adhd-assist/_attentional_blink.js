(function ($, document, window, undefined) {
    this.setSettings = function (settings) {
        var stringSettingsValue;

        if (typeof settings === 'String') {
            stringSettingsValue = settings;
        }
        else {
            stringSettingsValue = JSON.stringify(settings);
        }

        localStorage.setItem('attentional_blink_settings', stringSettingsValue);

        return JSON.parse(stringSettingsValue);
    };
    var getSettings = function () {
        var settingsEntry = localStorage.getItem('attentional_blink_settings');
        return JSON.parse(settingsEntry);
    };

    this.renderCurrentRank = function (resultsContainer, results, callback) {
        var totalTargets = 0,
            matches = 0,
            immediates = {},
            overallScoreContainer = $('<div style="width:300px;margin:auto;">').appendTo(resultsContainer)[0],
            overallScore;

        for (var i = 0, $length = results.length; i < $length; i++) {
            var targets = results[i]
                .source
                .filter(function (element) {
                    return !element.isNoise;
                })
                .sort(function (a, b) {
                    return (a.postedAt > b.postedAt) ? 1 : ((b.postedAt > a.postedAt) ? -1 : 0);
                });

            for (var j = 0, $$length = targets.length; j < $$length; j++) {
                if (results[i].feedback.indexOf(targets[j].symbol) === j) {
                    matches += 2;
                }
                else if (results[i].feedback.indexOf(targets[j].symbol) !== -1) {
                    matches++;
                }
            }

            totalTargets += targets.length * 2;
        }

        overallScore = application.math.failToZero(function () {
           return application.math.normalize(matches, 100, totalTargets);
        });

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

        if (typeof callback !== 'undefined') {
            callback(results, immediates, overallScore);
        }
    };

    this.startTest = function (targetSelector, feedbackSelector, resultsSelector, callback) {
        var setupSettings = getSettings(),
            PostedEntry = function (symbol, isNoise) {
                this.postedAt = application.system.getTime();
                this.symbol = symbol;
                this.isNoise = isNoise;
            },
            results = [],
            runTestRound = function (settings) {
                var currentIteration = 0,
                    resultRow = [],
                    roundTimeout,
                    currentSymbol,
                    target = $(targetSelector),
                    loop = function () {
                        if (currentIteration === settings.totalIterations - 1) {
                            clearTimeout(roundTimeout);
                            runTestFeedback(settings, resultRow);
                        }
                        else if (settings.showTargets.indexOf(currentIteration) !== -1) {
                            currentSymbol = setupSettings.attentionSymbols[parseInt(application.math.getRandomWithin(0, setupSettings.attentionSymbols.length - 1))];
                            resultRow.push(new PostedEntry(currentSymbol, false));

                            target.html(currentSymbol);

                            currentIteration++;
                            roundTimeout = setTimeout(function () {
                                target.html('&nbsp;');

                                roundTimeout = setTimeout(loop, setupSettings.symbolGap);
                            }, setupSettings.symbolDuration);
                        }
                        else {
                            currentSymbol = setupSettings.noiseArray[parseInt(application.math.getRandomWithin(0, setupSettings.noiseArray.length - 1))];
                            resultRow.push(new PostedEntry(currentSymbol, true));

                            target.html(currentSymbol);

                            currentIteration++;
                            roundTimeout = setTimeout(function () {
                                target.html('&nbsp;');

                                roundTimeout = setTimeout(loop, setupSettings.symbolGap);
                            }, setupSettings.symbolDuration);
                        }
                    };

                loop();
            },
            runTestFeedback = function (settings, resultRow) {
                var target = $(feedbackSelector);

                var feedbackRow = [],
                        inputsToRender = resultRow.filter(function (element) {
                            return !element.isNoise;
                        }).length;

                $('<input type="text" maxlength="' + inputsToRender + '">')
                       .addClass('enter-feedback-for-attentional-span')
                       .addClass('test-response-text-entry')
                       .appendTo(target);


                $('.enter-feedback-for-attentional-span').first().focus();

                $('<button type="button">')
                    .addClass('btn btn-info btn-lg clear')
                    .html('Continue')
                    .appendTo($('<div class="clear">').appendTo(target))
                    .click(function () {

                        feedbackRow = $('.enter-feedback-for-attentional-span').val();
                        $('.enter-feedback-for-attentional-span').remove();

                        results.push({
                            source: resultRow,
                            feedback: feedbackRow
                        });

                        console.log({
                            source: resultRow,
                            feedback: feedbackRow
                        });

                        $(this).remove();

                        currentTestRound++;

                        if (currentTestRound === settings.targetRounds) {
                            $(targetSelector).html('&nbsp;').hide();
                            renderCurrentRank($(resultsSelector), results, callback);
                        } else {
                            runTestRound(settings);
                        }
                    });
            },
            currentTestRound = 0;

        runTestRound(setupSettings);
    };
})(jQuery, document, window, undefined);
