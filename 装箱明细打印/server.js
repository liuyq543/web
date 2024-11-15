//引入http模块
var http=require("http");
//引入fs模块
var fs=require("fs");
//引入url模块
var url=require("url");
var store_info=JSON.parse(fs.readFileSync("./store.json","utf-8"))
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
        fs.readFile(__dirname+"/index.html",(err,data)=>{
            if(err){
                res.end("文件"+__dirname+"/index.html读取失败");
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
                    查询明细(result.query.XM,res) 
                    return
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
//传入箱码和回调函数res
function 查询明细(id,response) {
    var str = "";
    const options = {
        hostname: '172.30.90.173',
        port: 80,
        path: `/scpda/SysInterface/XiangMaXiangQingBB.ashx?page=1&limit=2000&time=${new Date().getTime()}&planDate=&endDate=&classId=&storeId=&pluCode=&xmid=${id}&xmStatus=&leiXing=&Batch=`,
        method: 'GET',
        headers: {
            cookie: "ASP.NET_SessionId=obx15mvbmhh1arjndnggu3zs",
            "content-type": "text/plain; charset=utf-8"
        }
    };
    const req = http.request(options, (res) => {
        res.on('data', (d) => {
            str += d.toString();
        });
        //请求数据接收完毕
        res.on('end', () => {
            if (JSON.parse(str)[0]["AllCount"] == 0) {
                response.end(JSON.stringify({
                    "result":"failed",
                    "message":`没有${id}的明细信息`
                }))
                return false;
            } else {
               str=JSON.stringify(处理数据(JSON.parse(str).slice(1)))
               response.end(JSON.stringify({
                "result":"ok",
                "message":`${str}`
            }))
            }
        });
    });
    req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`);
    });
    //结束请求
    req.end();

}
function 处理数据(arr) {
    var obj = {}
    Object.keys(arr[0]).forEach(index => {
        obj[index] = arr[0][index]
        //添加list关键字，存储装箱明细信息
        obj["list"]=`${arr[0]["PH"]} ${arr[0]["PM"]} ${arr[0]["HS"]}盒`
        try{
            obj["route"]=store_info[arr[0]["MDID"]]["route"]
            obj["main-route"]=store_info[arr[0]["MDID"]]["main-route"]
            obj["boarding-order"]=store_info[arr[0]["MDID"]]["boarding-order"]
        }catch{
            //console.log(`arr[0]["MDID"]${arr[0]["MDMC"]}未维护信息`)
        }
        
    })
    if(arr.length>1){
        arr.slice(1).forEach(index => {
            obj["list"]+=`\n${index["PH"]} ${index["PM"]} ${index["HS"]}盒`
        })
    }
    
    return obj
}

