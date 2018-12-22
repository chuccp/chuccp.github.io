# im推送系统

简介：
本系统，主要用于即时推送，起源于公司用微信控制电视盒子的项目，内置集群功能，支持TCP长连接，HTTP长连接，websocket等连接方式

####	使用方法：

    1. 下载地址：go get -u gitee.com/cooge/impush
    2. 配置好配置文件configure.ini，并与可执行文件放同一目录，运行即可

####	配置说明


####	http配置
    [HTTP]
    port:9090
    http api接口配置，默认9090
####	TCP配置
    [TCP]
    start:false
    port:4641
    start：是否启动tcp长连接
    false：不启用，true：启用

####	Websocket配置
    [WS]
    start:false
    start：是否启用websocket
####	http轮询推送配置
    [EX]
    start: true
    model:C #N 或 C
    deadline:5 ##http轮训最长间隔时间，单位秒。超时则判定，用户下线
    livetime:5 ##http连接阻塞时间，单位秒，尽可能设置长。N模式下，每隔livetime会断开重连一次；C模式下则是连接超时时间，根据浏览器的支持设定
    start：是否启用
    model：运行模式
    N为普通模式，每隔livetime设定的时间，会断开重连。
    C为chunked模式，几乎相当于tcp长连接模式，推荐使用该模式
####	集群配置
    [CLUSTER]
    start:false
    local.port:6571 
    remote.host:127.0.0.1
    remote.port:6570
    start：是否启用
    local.port：推送系统之间连接的端口设置，当前系统开放的端口
    remote.host：要连接的集群推送系统，如果要在集群系统中添加一台新机器，只需要连接其中任意一台机器即可
    remote.port：配置要连接机器的端口号
####	日志配置
    [LOG]
    open:true
    path:log 
    open：是否打印详细日志
    path：日志保存路径
####	客户端


java版

下载地址：https://gitee.com/cooge/impush/tree/1.0/client/java


				初始化
				IMClient mIMClient = new IMClient("127.0.0.1",4646);
				try {
					mIMClient.setUser("333333", "333333");
					mIMClient.setMessageListener(new MessageListener() {
						
						@Override
						public void onReceiveMessage(Message msg) {
							try {
								log.info("信息接收",msg.getHead(MessageHeadConstant.FROM)+":"+new String(msg.getBody(),"UTF-8")+"\r\n");
							} catch (UnsupportedEncodingException e) {
								e.printStackTrace();
							};
							
						}
						
						@Override
						public void onMessageSatus(String msgId, MessageStatus status) {
						
							log.info("信息回馈",status.name());
						}
						
						@Override
						public void onExecStatus(ExecStatus status) {
							
							log.info("运行状态",status.name());
							
						}
					});
					mIMClient.start();
				} catch (Exception e) {
					e.printStackTrace();
				}
				
	            发送信息			
				String msgId = mIMClient.sendMessage("接收者ID","发送的信息");
				
				
js版

    下载地址：https://gitee.com/cooge/impush/tree/1.0/client/js
	
    loop.html 中有使用例子

websocket版

    下载地址：https://gitee.com/cooge/impush/tree/1.0/client/js
	
    websocket.html中有使用例子

####	服务端API接口


首页：

    http://127.0.0.1:9090/

    查看服务器的基本信息

    
单用户信息发送：

    http://127.0.0.1:9090/sendmsg?id=123&msg=564654654654

    id为要接受信息的用户
    msg：要发送的信息

 在线用户查看

    http://127.0.0.1:9090/onlineuser?start=0&num=10
 
    start 起始页页码
    num 单页数量
 
    go 语言map为无顺的，感觉这接口没啥意义
    
 单个用户信息查看
 
    http://127.0.0.1:9090/queryuser?id=333333
	
    查看用户连接信息