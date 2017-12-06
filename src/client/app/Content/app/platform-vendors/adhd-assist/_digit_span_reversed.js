(function ($, document, window, undefined) {
    this.setSettings = function (settings) {
        var stringSettingsValue;

        if (typeof settings === 'String') {
            stringSettingsValue = settings;
        }
        else {
            stringSettingsValue = JSON.stringify(settings);
        }

        localStorage.setItem('digit_span_reversed_settings', stringSettingsValue);

        return JSON.parse(stringSettingsValue);
    };
    var getSettings = function () {
        var settingsEntry = localStorage.getItem('digit_span_reversed_settings');
        return JSON.parse(settingsEntry);
    };

    this.renderCurrentRank = function (resultsContainer, results, callback) {
        var settings = getSettings(),
            immediates = {},
            overallScoreContainer = $('<div style="width:300px;margin:auto;">').appendTo(resultsContainer)[0],
            overallScore;

        overallScore = application.math.failToZero(function () {
            return application.math.normalize(
                results[results.length - 1].source.length,
                100,
                settings.bestScoreAtSymbolsCount);
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

        immediates.workingMemory = overallScore;

        if (typeof callback !== 'undefined') {
            callback(results, immediates, overallScore);
        }
    };

    this.startTest = function (targetSelector, feedbackSelector, resultsSelector, callback) {
        var setupSettings = getSettings(),
            PostedEntry = function (symbol) {
                this.symbol = symbol;
            },
            results = [],
            runTest = function (settings, iteration) {
                var errorsCount = 0,
                    symbolsInRound = settings.startWithCount,
                    roundsShown = 0,
                    roundTimeout,
                    currentSymbol,
                    target = $(targetSelector),
                    showSymbols = function () {
                        var symbolsShown = 0,
                            shownSymbolsString = '',
                            currentSymbols,
                            showSymbol = function () {
                                if (symbolsShown === symbolsInRound) {
                                    clearTimeout(roundTimeout);
                                    roundsShown++;
                                    collectResponse(shownSymbolsString);
                                    return;
                                }
                                currentSymbol = setupSettings.availableSymbols[parseInt(application.math.getRandomWithin(0, setupSettings.availableSymbols.length - 1))];
                                shownSymbolsString += currentSymbol;

                                target.html(currentSymbol);

                                symbolsShown++;

                                roundTimeout = setTimeout(function () {
                                    target.html('&nbsp;');

                                    roundTimeout = setTimeout(showSymbol, setupSettings.symbolDuration);
                                }, setupSettings.symbolDuration);
                            };

                        showSymbol();
                    },
                    collectResponse = function (shownSymbolsString) {
                        var target = $(feedbackSelector),
                            feedback;

                        target.show();

                        $('<input type="text" maxlength="' + symbolsInRound + '">')
                            .addClass('enter-feedback-for-digit-span')
                            .addClass('test-response-text-entry')
                            .appendTo(target);

                        $('.enter-feedback-for-digit-span').first().focus();

                        $('<button type="button">')
                            .addClass('btn btn-info btn-lg clear')
                            .html('Continue')
                            .appendTo($('<div class="clear">').appendTo(target))
                            .click(function () {
                                $('.enter-feedback-for-digit-span').each(function () {
                                    feedback = this.value;
                                    $(this).remove();
                                });

                                results.push({
                                    source: shownSymbolsString,
                                    feedback: feedback
                                });

                                console.log({
                                    source: shownSymbolsString,
                                    feedback: feedback
                                });

                                $(this).remove();

                                for (var i = 0; i < shownSymbolsString.length; i++) {
                                    if (feedback[i] !== shownSymbolsString[shownSymbolsString.length - i - 1]) {
                                        errorsCount++;
                                    }
                                }

                                if (errorsCount >= settings.stopAtErrorsCount) {
                                    $(targetSelector).html('&nbsp;').hide();
                                    renderCurrentRank($(resultsSelector), results, callback);
                                    return;
                                }

                                if (roundsShown === settings.iterationsPerRound) {
                                    roundsShown = 0;
                                    symbolsInRound++;
                                }

                                showSymbols(settings);
                            });
                    };

                showSymbols();
            };

        runTest(setupSettings);
    };
})(jQuery, document, window, undefined);
