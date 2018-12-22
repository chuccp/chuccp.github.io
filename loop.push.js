var LoopPush = function (url, username, password) {
    this._url_ = url;
    this._start_ = false;
    this._username_ = username;
    this._password_ = password;
}

LoopPush.prototype.loadConfig = function (url, username, password){
    this._url_ = url;
    this._start_ = false;
    this._username_ = username;
    this._password_ = password;
}

LoopPush.prototype.get = function (url, onSuccess, onError) {
    var opt = {
        url: url,
        method: "GET",
        success: onSuccess,
        error: onError
    }
    this.ajax(opt)
}
LoopPush.prototype.post = function (url, data, onSuccess, onError) {
    var opt = {
        url: url,
        method: "POST",
        success: onSuccess,
        data: data,
        error: onError
    }
    this.ajax(opt)
}

LoopPush.prototype.ajax = function (opt) {
    opt = opt || {};
    opt.method = opt.method.toUpperCase() || 'POST';
    opt.url = opt.url || '';
    opt.async = opt.async || true;
    opt.data = opt.data || null;
    opt.success = opt.success || function () {
    };
    opt.error = opt.error || function () {
    };
    var xmlHttp = null;
    if (XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    } else {
        xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    this._xmlHttp_ = xmlHttp;
    var params = [];
    for (var key in opt.data) {
        params.push(key + '=' + encodeURIComponent(opt.data[key]));
    }
    var postData = params.join('&');
    if (opt.method.toUpperCase() === 'POST') {
        xmlHttp.open(opt.method, opt.url, opt.async);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        xmlHttp.send(postData);
    } else if (opt.method.toUpperCase() === 'GET') {
        xmlHttp.open(opt.method, opt.url + '?' + postData, opt.async);
        xmlHttp.send(null);
    }
    xmlHttp.onreadystatechange = function () {
        if ((xmlHttp.readyState == 4) && xmlHttp.status == 200) {
            opt.success.call(xmlHttp, xmlHttp.responseText);//如果不是json数据可以去掉json转换
        }
        if(xmlHttp.status == 0){
            opt.error.call(this)
        }
    };
}


LoopPush.prototype.onMessage = function (id, msg) {

}

LoopPush.prototype.sendMessage = function (id, msg,onResult,onError) {
    if(this._start_){
        var uu = this._url_ + "/sendmsg?TO=" + id + "&FR=" + this._username_ + "&_t=" + (new Date().getTime());
        this.post(uu, {"M": msg}, function (text) {
            onResult(text)
        }, function () {
            onError()
        })
    }else{
        onError()
    }
}

LoopPush.prototype.onExecStatus = function (Status) {

}
LoopPush.prototype.start = function (opt) {
    this._start_ = true;
    opt = opt||{}
    opt.onSuccess = opt.onSuccess || function () {};
    opt.onError = opt.onError || function () {};
    this.run(opt)
}

LoopPush.prototype.run = function(opt){
    var uu = this._url_ + "?id=" + this._username_ + "&_t=" + (new Date().getTime());
    var _this_ = this;
    this.get(uu, function (text) {
        var msgs = JSON.parse(text)
        for (var i = 0; i < msgs.length; i++) {
            var msg = msgs[i]
            var body = msg.BODY;
            var from = msg.FR;
            _this_.onMessage(from, body);
        }
        if (_this_._start_){
            _this_.run(opt);
        }else{
            opt.onError()
        }
    }, function () {
        opt.onError()
    });
}

LoopPush.prototype.stop = function () {
         this._start_ = false
        if(this._xmlHttp_){
            this._xmlHttp_.abort()
        }
}




