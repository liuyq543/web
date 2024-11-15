var log = [];
var s = document.querySelector(".hxm")
s.addEventListener("change", function (e) {
    var t = document.querySelector(".audio")
    if (e.target.value == "") {
        t.src = "./audio/kh.mp3";
        t.pause();
        t.currentTime = 0
        t.play();
        //alert("箱码不能为空");
        return;
    } else if (e.target.value.length != 18&&e.target.value.length != 24) {
        t.src = "./audio/kh.mp3";
        t.pause();
        t.currentTime = 0;
        t.play();
        e.target.value = "";
        //alert("长度不是18位");
        return;
    }
    //打印方案
    var port = document.querySelector(".port")
    var map = {
        "0": "LIST.grf",
        "1": "LIST1.grf",
        "2": "LIST2.grf",
    }
    if (map[port.value] == undefined) {
        alert("没有该打印方案")
        return
    } else {
        port = map[port.value]
    }
    var result;
    var xhr = new XMLHttpRequest();
    var url = "http://172.30.226.231:8080/print?XM=" + e.target.value
    xhr.open("get", url, false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                t.src = "./audio/cg.mp3"
                t.play()
                result = xhr.responseText;
                if (log.length == 10) {
                    log.shift();
                }

                log.push(`${new Date().toLocaleTimeString()}--箱码--${e.target.value}--${JSON.parse(result).result}`);
                //查询到有明细
                if (JSON.parse(result).result == "ok") {
                    //调用打印模块
                    print(JSON.parse(result).message, port)
                }
            } else {
                log.push(`${new Date().toLocaleTimeString()}--箱码--${e.target.value}--${JSON.parse(result).result}`);
            }
        }
    };
    xhr.send();

    document.querySelector(".log").innerText = log.join("\n");

    e.target.value = "";
    e.target.focus();


});

//发送打印
function print(mx, port) {
    var xhr = new XMLHttpRequest();
    xhr.open("post", "http://172.30.226.231:6060/print", false);
    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = xhr.responseText;
                log.push(`${new Date().toLocaleTimeString()}  ${result}`);
                document.querySelector(".log").innerText = log.join("\n");
            } else {
                log.push(`${new Date().toLocaleTimeString()}  ${result}`);
                document.querySelector(".log").innerText = log.join("\n");
            }
        }
    };
    var data = JSON.stringify({
        "tcp": null,
        "printSolution": port,
        "url": `/${port}`,
        "data": [{
            "head": JSON.parse(mx)
        }]
    })
    xhr.send(data);
}
