function getChapters(onResult, onError) {
    _getChapters(onResult, onError);
}

function _getChapters(onResult, onError) {
    try {
        var section = document.getElementsByTagName('ytm-comments-entry-point-header-renderer')[0];
        var button = section.getElementsByTagName('button')[0];
        
        if (button.getAttribute('aria-expanded') !== "true") {
            button.click();
        }

        var comments = document.getElementsByTagName('ytm-comment-thread-renderer');

        if (comments.length > 0) {
            onResult({
                "chapters":_getChaptersWithComments(comments) || []
            });
        } else {
            setTimeout(function() {
                _getChapters(onResult, onError);
            }, 200);
        }
    } catch(e) {
        console.log(e)
        setTimeout(function() {
            _getChapters(onResult, onError);
        }, 200);
    }
}

function _getChaptersWithComments(comments) {
    for (var i = 0; i < comments.length; ++i) {
        var commentText = comments[i].getElementsByClassName('comment-text')[0].textContent;
        var timestampLines = _getTimestampLines(commentText);
        var chapters = [], lastTime;

        timestampLines.forEach(function(line) {
            var [ time, title ] = _parseTimestampLine(line);

            if (time === lastTime) {
                if (title.length > chapters[chapters.length - 1]["title"].length) {
                    chapters[chapters.length - 1]["title"] = title;
                }
            } else {
                chapters.push({ 
                    "time": time, 
                    "title": title 
                });
            }

            lastTime = time;
        });

        if (chapters.length > 3) {
            return chapters;
        }
    }
}

function _getTimestampLines(text) {
    var lines = [];

    text.split('\n').forEach(function(line) {
        if (line.match(/[0-9]+(\:[0-9]{2}){1,2}/)) {
            lines.push(line.replace('\r', ''));
        }
    })

    return lines;
}

function _parseTimestampLine(line) {
    var patterns = [
        /\[ *([0-9]+(\:[0-9]{2}){1,2}) *\] */,
        /\( *([0-9]+(\:[0-9]{2}){1,2}) *\) */,
        /\|? *([0-9]+(\:[0-9]{2}){1,2}) *\| */,
        /([0-9]+(\:[0-9]{2}){1,2}) *l +/,
        /([0-9]+(\:[0-9]{2}){1,2}) */,
    ]

    for (var i = 0; i < patterns.length; ++i) {
        var match = line.match(patterns[i]);

        if (match) {
            return [ match[1].trim(), line.replace(match[0], "").replace(/[0-9]+(\:[0-9]{2}){1,2}/g, "").trim() ]
        }
    }

    return [ "0:00", "" ]
}

function pauseVideo(onResult, onError) {
    _pauseVideo(onResult, onError)
}

function _pauseVideo(onResult, onError) {
    try {
        var video = document.getElementsByTagName('video')[0]

        if (!video.paused) {
            video.pause();

            setTimeout(function() {
                _pauseVideo(onResult, onError);
            }, 10);
        } else {
            onResult();
        }
    } catch (e) {
        setTimeout(function() {
            _pauseVideo(onResult, onError);
        }, 10);
    }
}
