$(function () {
    $('#start-test-button').click(function(){
        $("#test-progress").css("display","block");
    });
    $('#start-test-button').attr('disabled', 'disabled');
    $.get("http://adhdassist.azurewebsites.net/Portal/GetSettings?settingName=focus%20hyperactivity%204", function (data, status) {
        var settings = setSettings(data);
        $('#target-minutes-placeholder').html(settings.totalTime / (1000 * 60));
        $('#start-test-button').removeAttr('disabled').click(function () {
            $('body').addClass('forbid-select');
            $('#test-instructions').hide();
            application.createCountdownTracker('#countdown', settings.totalTime);
            startTest('#workspace-container', '#workspace-results', '#additional-controls', function (results, immediates, newRank) {
                $.post(
                    'http://adhdassist.azurewebsites.net/Report/PersistTestResults',
                    {
                        profileId: '6b1387e4-57ea-42b2-bd52-0af69631bfb6',
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