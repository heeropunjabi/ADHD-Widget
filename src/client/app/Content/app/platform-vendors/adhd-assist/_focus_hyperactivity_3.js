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

        localStorage.setItem('focus_hyperactivity_3_settings', stringSettingsValue);

        return JSON.parse(stringSettingsValue);
    };
    var getSettings = function () {
        var settingsEntry = localStorage.getItem('focus_hyperactivity_3_settings');
        return JSON.parse(settingsEntry);
    };
    this.renderCurrentRank = function (resultsContainer, results, callback) {
        var hits = 0,
            misses = 0,
            gaps = 0,
            errors = 0,
            expected = 0,
            overallScore = 0,
            immediates = {},
            overallScoreContainer = $('<div style="width:300px;margin:auto;">').appendTo(resultsContainer)[0],
            detailsContainer = $('<canvas style="height:500px; width:500px; margin:auto">').appendTo(resultsContainer)[0].getContext('2d');

        for (var i = 0, $length = results.length; i < $length; i++) {
            if (results[i].shouldReact && results[i].reacted) {
                hits++;
                expected++;
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
            attention = function (source, mustBe) {
                this.source = source;
                this.mustBe = mustBe;
                this.postedAt = getTime();
                this.reacted = false;
                this.reactedAt = undefined;
                this.fluctuations = [];
            },
            target = $(targetSelector),
            attentionRow = [],
            results = $(resultsSelector),
            iteration = 0,
            currentValue;

        (function loop(i) {
            var currentInterval = setupSettings.intervalParams[iteration],
                currentDuration = currentInterval.symbolDurationType === 'fixed'
                    ? currentInterval.symbolDuration
                    : application.math.getRandomWithin(currentInterval.symbolDuration.min, currentInterval.symbolDuration.max),
                timeout = setTimeout(function () {

                    currentValue = application.math.getWithProbability(currentInterval.values, currentInterval.probabilities);

                    target.html('&nbsp;').html(currentValue);

                    setTimeout(function () {
                        target.html('&nbsp;');
                    }, setupSettings.symbolDuration);

                    attentionRow.push(new attention(currentValue, currentInterval.mustBe));

                    if (--i) {
                        loop(i);
                    } else {
                        if (iteration === setupSettings.intervalParams.length - 1) {
                            renderCurrentRank(results, attentionRow, callback);
                        }
                        else {
                            iteration++;
                            loop(currentInterval.itemsCount);
                        }
                    }
                }, currentDuration);
        })(setupSettings.intervalParams[iteration].itemsCount);


        $(document).on('mouseup keypress', function () {
            var lastEntry = attentionRow[attentionRow.length - 1];
            if (lastEntry.reacted) {
                lastEntry.fluctuations.push(getTime());
            }
            lastEntry.reacted = true;
            lastEntry.reactedAt = getTime();

            console.log(lastEntry);
        });
    };
})(jQuery, document, window, undefined);
