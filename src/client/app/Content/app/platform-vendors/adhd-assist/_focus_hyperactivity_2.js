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

        localStorage.setItem('focus_hyperactivity_2_settings', stringSettingsValue);

        return JSON.parse(stringSettingsValue);
    };
    var getSettings = function () {
        var settingsEntry = localStorage.getItem('focus_hyperactivity_2_settings');
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
            overallScore = 0,
            immediates = {},
            overallScoreContainer = $('<div style="width:300px;margin:auto;">').appendTo(resultsContainer)[0];

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
            globalTestTimeout;

        var run = function () {
            if (entries.length - 1 === currentEntryIndex) {
                clearTimeout(globalTestTimeout);
                target.html('&nbsp;');
                renderCurrentRank(results, attentionRow, callback);
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

        run();

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
