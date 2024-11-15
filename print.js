//引入http模块
var http=require("http");
//引入fs模块
var fs=require("fs");
//引入url模块
var url=require("url");
//引入发送到打印模块
var prt=require("./request");
var info={
"port":8080
};
var str;
//创建服务器
http.createServer((req,res)=>{
    
    //获取请求路径，以及把query请求变为对象--true
    var result=url.parse(req.url,true);
    //console.log(result)
    path=result.pathname;
    
    //访问根目录，返回网页
    if(path=="/"){
        fs.readFile(__dirname+"/loadlist.html",(err,data)=>{
            if(err){
                res.end("文件"+__dirname+"/loadlist.html读取失败");
            }else{
                res.end(data);
            }
            return;
        });
    }else{
        fs.readFile(__dirname+"/"+path,(err,data)=>{
            if(err){
                if(path=="/print"){
                    res.setHeader("content-type","text/html;charset=utf-8");
                    //开始打印
                    if(!prt.查询明细(result.query.XM)){
                        res.end("未查询到箱码信息")
                        return;
                    }else{
                        res.statusCode=200;
                        res.end("请求成功，已发送至打印机")
                        return;
                    }
                    
                }
                res.write("文件"+__dirname+"/"+path+"读取失败");
                res.statusCode=404;
                res.end("404，访问失败");
            }else{
                res.end(data);
            }
            return;
        });
    };
    
}).listen(info["port"]);
console.log("服务器启动成功，端口"+info["port"]+"正在监听中...")
