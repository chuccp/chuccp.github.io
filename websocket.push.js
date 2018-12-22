var StringStream = {};

StringStream.stringToBytes = function (str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(c & 0xFF);
        }
    }
    return bytes;


}
var MessageStream = function () {
    this._data_ = new Array()
    this.init()
}
MessageStream.prototype.loadData = function (data) {
    for (var v in data) {
        this._data_.push(data[v])
    }
    this.read()
}
MessageStream.prototype.init = function () {

    this._msg_ = new Message();
    this._end_ = new Array()
    this._headline_ = new Array()
    this._status_ = 0;
}

MessageStream.prototype.read = function () {

    while (this._data_.length > 0) {
        if (this._status_ == 0) {
            this.readHead()
        }
        if (this._status_ == 1) {
            this.readBody()
        }
        if (this._status_ == 2) {
            this.readEnd()
        }
    }
}


MessageStream.prototype.readBody = function () {
    var len = this._msg_.getHeadValue(Message.LENGTH)
    var i = 0;
    while (this._data_.length > 0) {
        if (i == len) {
            this._status_ = 2
            break
        }
        var ch = this._data_.shift();
        this._msg_.body.push(ch)
        i++;
    }


}
MessageStream.prototype.onMessage = function (msg) {

}

MessageStream.prototype.readEnd = function () {
    while (this._data_.length > 0) {
        var ch = this._data_.shift();
        this._end_.push(ch)
        if (this._end_.length == 4) {
            if (StringStream.equals(this._end_, [45, 13, 10, 45])) {
                this.onMessage(this._msg_)
                this.init()
            }
            break;
        }
    }


}

MessageStream.prototype.readHead = function () {
    while (this._data_.length > 0) {
        var ch = this._data_.shift();
        if (ch == 10) {
            if (this._headline_[this._headline_.length - 1] == 13) {
                this._headline_.pop()
            }
            var hl = StringStream.byteToString(this._headline_)
            this._headline_ = new Array()
            if (hl.length == 0) {
                this._status_ = 1;
                break;
            }
            var strs = hl.split(":")
            this._msg_.setHead(strs[0], strs[1])
        } else {
            this._headline_.push(ch)
        }

    }
}
StringStream.byteToString = function (arr) {
    if (typeof arr === 'string') {
        return arr;
    }
    var str = '',
        _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2);
            }
            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            str += String.fromCharCode(_arr[i]);
        }
    }
    return str;
}


StringStream.equals = function (array1, array2) {

    if (!array1 || !array2)
        return false;
    if (array1.length != array2.length)
        return false;
    for (var i = 0, l = array1.length; i < l; i++) {
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            if (!StringStream.equals(array1[i], array2[i]))
                return false;
        }
        else if (array1[i] != array2[i]) {
            return false;
        }
    }
    return true;
}

var Message = function () {
    this.head = {};
    this.body = new Array()
}


Message.LIVE = "L"
Message.STATUS = "S"
Message.CLUSTER = "C"
Message.USERNAME = "U"
Message.MESSAGE = "M"
Message.TYPE = "T"

Message.ACTION = "AN"
Message.LOGIN = "LN"
Message.NO_USER = "NU"
Message.SEND_FAIL = "SF"
Message.TO = "TO"
Message.FROM = "FR"
Message.ALL_MESSAGE = "AM"
Message.TRACK = "TK"
Message.SUCCESS = "SC"
Message.FAIL = "FL"
Message.RESULT = "RT"
Message.LOGIN_SUCCESS = "LNSC"

Message.LENGTH = "LEN"
Message.SYSTEM = "SYS"

Message.MESSAGE_ID = "MID"
Message.SEND_CLUSTER_USER = "SCU"
DELETE_CLUSTER_USER = "DCU"
Message.BODY = "BODY"
Message.TIME = "TIME"
Message.START = "START"
Message.FULL_SUCCESS = "SUCCESS"
Message.FULL_SYSTEM = "SYSTEM"

Message.login = function (username, password,live) {
    var message = new Message();
    message.setHead(Message.TYPE, Message.LOGIN)
    message.setHead(Message.USERNAME, username)
    message.setHead(Message.TIME, live)
    return message
}
Message.sendmsg = function(id,body){
    var message = new Message();
    message.setHead(Message.TYPE, Message.MESSAGE)
    message.setHead(Message.TO, id)
    message.setHead(Message.MESSAGE_ID,Math.random().toString(36).substr(2,6))
    message.setBody(StringStream.stringToBytes(body))
    return message
}
Message.live = function(){
    var message = new Message();
    message.setHead(Message.TYPE, Message.LIVE)
    return message
}

Message.prototype.getHeadValue = function (key) {
    return this.head[key]
}
Message.prototype.setHead = function (key, val) {
    this.head[key] = val
}
Message.prototype.setBody = function (data) {
    this.body = data
}
Message.prototype.getBody = function () {
    return this.body
}

Message.prototype.toBytes = function () {
    var data = new Array()
    var num = this.body == null ? 0 : this.body.length
    this.setHead(Message.LENGTH, num)
    for (var key in this.head) {
        data = data.concat(StringStream.stringToBytes(key + ":" + this.head[key] + "\r\n"))
    }
    data = data.concat(StringStream.stringToBytes("\r\n"))
    if (num > 0) {
        data = data.concat(this.body)
    }
    data = data.concat([45, 13, 10, 45]);
    return data
}

var WebSocketPush = function (url, username, password,liveTime) {
    this._url_ = url;
    this._username_ = username;
    this._password_ = password;
    this._liveTime_ = liveTime||60000
    this._start_ = false;
    this._login_ = false;
}

WebSocketPush.prototype.loadConfig = function (url, username, password,liveTime) {
    this._url_ = url;
    this._start_ = false;
    this._login_ = false;
    this._username_ = username;
    this._password_ = password;
    this._liveTime_ = liveTime||60000
}
WebSocketPush.prototype.sendMessage = function (id,msg) {
    if(this._login_){
        this.sendMsg(Message.sendmsg(id,msg))
    }
}
WebSocketPush.prototype.sendMsg = function (msg) {
    this.write(msg.toBytes())
}

WebSocketPush.prototype.write = function (data) {
    if (this._ws_) {
        this._ws_.send(StringStream.byteToString(data))
    }
}
WebSocketPush.prototype.live =function(){
    if(this._login_&&this._start_){
        this.sendMsg(Message.live())
    }
}

WebSocketPush.prototype.onMessageStatus = function (msgid,msgStatus) {

}

WebSocketPush.prototype.onMessage = function (id, msg) {

}
WebSocketPush.prototype.onError = function(){

}
WebSocketPush.prototype.onOpen = function(){

}
WebSocketPush.prototype.onClose = function(){

}
WebSocketPush.prototype.close = function(){

    if(this._ws_){
        this._ws_.close()
    }
}



WebSocketPush.prototype.start = function () {

    this._msgStream_ = new MessageStream();
    var _this_ = this;
    this._msgStream_ .onMessage = function (msg) {
        if(msg !=null){
            if(msg.getHeadValue(Message.TYPE)==Message.MESSAGE){
                _this_.onMessage(msg.getHeadValue(Message.FROM),StringStream.byteToString(msg.getBody()))
            }
            if(msg.getHeadValue(Message.TYPE)==Message.TRACK){

                if(msg.getHeadValue(Message.RESULT)==Message.SUCCESS){
                    _this_.onMessageStatus(msg.getHeadValue(Message.MESSAGE_ID),"success")
                }
                if(msg.getHeadValue(Message.RESULT)==Message.FAIL){
                    _this_.onMessageStatus(msg.getHeadValue(Message.MESSAGE_ID),"fail")
                }
            }
            if(msg.getHeadValue(Message.TYPE)==Message.LOGIN){
                
                if(msg.getHeadValue(Message.STATUS)==Message.START){
                    var msg =  Message.login(_this_._username_,_this_._password_,_this_._liveTime_)
                    _this_.sendMsg(msg)
                }
                if(msg.getHeadValue(Message.STATUS)==Message.SUCCESS){
                    _this_._login_ = true;
                }
            }
        }
    }
    var _this_ = this;
    var ws = new WebSocket(this._url_);
    this._ws_ = ws;
    var timeLive;
    ws.onopen = function () {
        _this_._start_ = true
        timeLive=window.setInterval(function () {
            _this_.live()
        }, _this_._liveTime_)
        _this_.onOpen()
    };

    ws.onmessage = function (evt) {
        _this_._msgStream_.loadData(StringStream.stringToBytes(evt.data))

    };
    ws.onclose = function (evt) {
        if(timeLive){
            window.clearInterval(timeLive);
        }
        _this_._start_ = false
        _this_._login_=false
        _this_.onClose()
    };
    ws.onerror = function (evt) {
        if(timeLive){
            window.clearInterval(timeLive);
        }
        _this_._start_ = false
        _this_._login_=false
        _this_.onError();
    };
}