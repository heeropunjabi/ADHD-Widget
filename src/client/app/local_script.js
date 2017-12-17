$(function () {
    $('#start-test-button').attr('disabled', 'disabled');
    $.get("https://api.myjson.com/bins/jsodr", function (data, status) {
        var settings = setSettings(data);
        $('#target-minutes-placeholder').html(settings.totalTime / (1000 * 60));
        $('#start-test-button').removeAttr('disabled').click(function () {
            $('body').addClass('forbid-select');
            $('#test-instructions').hide();
            application.createCountdownTracker('#countdown', settings.totalTime);
            startTest('#workspace-container', '#workspace-results', '#additional-controls', function (results, immediates, newRank) {
                $.post(
                    'xyz',
                    {
                        profileId: '123',
                        testParameters: JSON.stringify(data),
                        testResults: JSON.stringify(results),
                        immediates: JSON.stringify(immediates),
                        immediateRank: newRank,
                        testIdentifier: 'focus and hyperactivity 4'
                    }).done(function (data) {
                        immediates.score = newRank;
                        application.shareResults('#app-feedback', immediates);
                    })
            });
            $('.actions').hide();
        });
    })
});