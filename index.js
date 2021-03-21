var module = (function() {
    const webjs = require("webjs-helper");

    var _id = "", _dir_path = "", _handlers = [];
    var _video_id = "";
    var _web_loaded = false;

    function _on_web_loaded(data) {
        if (data["url"].startsWith("https://m.youtube.com/watch?")) {
            webjs.import(_dir_path + "/youtube.js");

            _handlers.forEach(function(handler) {
                handler();
            });

            _web_loaded = true, _handlers = [];
        }
    }

    return {
        initialize: function(id, video_id) {
            var web_prefix = id.replace(".", "_");
            var dir_path = this.__ENV__["dir-path"];

            global[web_prefix + "__on_web_loaded"] = function (data) {
                _on_web_loaded(data);
            }

            webjs.initialize(id + ".web", "__$_bridge");
            view.object(id).action("load", { 
                "filename": dir_path + "/web.sbml",
                "dir-path": dir_path,
                "web-id": id, 
                "web-prefix": web_prefix,
                "video-id": video_id
            });

            _id = id, _dir_path = dir_path;
            _video_id = video_id;

            return this;
        },

        get_video_id: function() {
            return _video_id;
        },

        get_chapters: function() {
            return new Promise(function(resolve, reject) {
                var handler = function() {
                    webjs.call("getChapters")
                        .then(function(result) {
                            resolve(result);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                }

                _web_loaded ? handler() : _handlers.push(handler);
            });
        },
    }
})();

__MODULE__ = module;
