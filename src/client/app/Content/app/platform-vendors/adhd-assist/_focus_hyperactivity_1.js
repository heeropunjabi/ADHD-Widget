(function ($, document, window, undefined) {
    this.setSettings = function (settings) {
        var stringSettingsValue;

        if (typeof settings === 'String') {
            stringSettingsValue = settings;
        }
        else {
            stringSettingsValue = JSON.stringify(settings);
        }

        localStorage.setItem('focus_hyperactivity_1_settings', stringSettingsValue);

        return JSON.parse(stringSettingsValue);
    };
    var getSettings = function () {
        var settingsEntry = localStorage.getItem('focus_hyperactivity_1_settings');
        return JSON.parse(settingsEntry);
    };

    this.renderCurrentRank = function (resultsContainer, results, callback) {
        var hits = 0,
            totalHitsTime = 0,
            misses = 0,
            gaps = 0,
            errors = 0,
            expected = 0,
            corrects = 0,
            firstIterationWithError,
            timeToFirstError,
            firstPostedAt,
            overallScore = 0,
            immediates = {},
            overallScoreContainer = $('<div style="width:300px;margin:auto;">').appendTo(resultsContainer)[0];

        for (var i = 0, $length = results.length; i < $length; i++) {
            firstPostedAt = firstPostedAt || results[i].postedAt;

            if (results[i].shouldReact) {
                if (results[i].reacted) {
                    hits++;
                    expected++;
                    corrects++;
                    totalHitsTime += results[i].reactedAt - results[i].postedAt;
                } else {
                    misses++;
                    expected++;
                    timeToFirstError = timeToFirstError || results[i].reactedAt;

                    if (typeof firstIterationWithError !== 'undefined') {
                        firstIterationWithError = i;
                    }
                }
            }
            else {
                if (results[i].reacted) {
                    errors++;
                    timeToFirstError = timeToFirstError || results[i].reactedAt;

                    if (typeof firstIterationWithError !== 'undefined') {
                        firstIterationWithError = i;
                    }
                } else {
                    gaps++;
                    corrects++;
                }
            }
        }

        overallScore = application.math.failToZero(function () {
            return application.math.normalize(corrects, 100, results.length);
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

        immediates.speed = application.math.failToZero(function () {
            return application.math.normalize(totalHitsTime / hits, 100, 500, true);
        });
        immediates.impulsivity = application.math.failToZero(function () {
            return 1 / errors;
        });
        immediates.attentionTime = timeToFirstError - firstPostedAt;
        immediates.attention = firstIterationWithError;
        immediates.accuracy = application.math.failToZero(function () { return (hits + gaps) / (hits + errors + misses + gaps); });

        if (typeof callback !== 'undefined') {
            callback(results, immediates, overallScore);
        }
    };

    this.startTest = function (targetSelector, resultsSelector, callback) {
        var setupSettings = getSettings(),
            totalRounds = setupSettings.totalRounds,
            currentEntryIndex = 0,
            globalTestTimeout,
            target = $(targetSelector),
            attentionRow = [],
            attention = function (shouldReact) {
                this.postedAt = application.system.getTime();
                this.shouldReact = shouldReact;
                this.reacted = false;
                this.reactedAt = undefined;
                this.fluctuations = [];
            };

        var run = function () {
            if (currentEntryIndex === totalRounds) {
                clearTimeout(globalTestTimeout);
                target.html('&nbsp;').hide();
                renderCurrentRank(resultsSelector, attentionRow, callback);
            } else {
                var currentIterationTimeout = application.math.getRandomWithin(setupSettings.minPause, setupSettings.maxPause),
                    value = application.math.getWithProbability(
                        [setupSettings.targetSymbol, setupSettings.noiseArray[parseInt(application.math.getRandomWithin(0, setupSettings.noiseArray.length - 1))]],
                        [setupSettings.targetSymbolProbability, 1 - setupSettings.targetSymbolProbability]);

                attentionRow.push(new attention(value === setupSettings.targetSymbol));

                target.html('&nbsp;').html(value);

                setTimeout(function () {
                    target.html('&nbsp;');
                }, setupSettings.symbolDuration);

                currentEntryIndex++;
                globalTestTimeout = setTimeout(run, currentIterationTimeout);
            }
        };

        run();

        $(document).on('mouseup keypress', function () {
            var lastEntry = attentionRow[attentionRow.length - 1];
            if (lastEntry.reacted) {
                lastEntry.fluctuations.push(application.system.getTime());
            }
            lastEntry.reacted = true;
            lastEntry.reactedAt = application.system.getTime();

            console.log(lastEntry);
        });
    };
})(jQuery, document, window, undefined);
