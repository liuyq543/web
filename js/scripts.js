var res;
var bt;
var arr;
var store = {};
window.addEventListener("load", function (e) {
	var id = document.querySelectorAll("input")[0];
	var idname = document.querySelectorAll("input")[1]
	//获取缓存门店编码
	id.value = localStorage.getItem("storeid");
	idname.value = localStorage.getItem("storename");
	var dt = new Date()

	document.getElementById("arrive").value = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2)
	if (typeof (Storage) !== "undefined") {

		// 是的! 支持 localStorage  sessionStorage 对象!
		// 一些代码.....
	} else {
	}
	var xhr = new XMLHttpRequest();
	xhr.open("get", "./info.json", true);
	xhr.send();
	xhr.onreadystatechange = function () {
		if (xhr.status == 200 && xhr.readyState == 4) {
			var store = document.getElementById("store");
			var data = JSON.parse(xhr.responseText);
			res = Object.keys(data);
			res.forEach(function (index, i) {
				localStorage.setItem(index, data[index]);
				var item = document.createElement("option");
				item.value = index;
				store.appendChild(item);
			});
		}
	};
});
document.querySelectorAll("input")[0].addEventListener("input", function (e) {
	var id = document.querySelectorAll("input")[1];
	id.value = localStorage.getItem(e.target.value);
	//存入门店ID到浏览器
	localStorage.setItem("storeid", e.target.value);
	localStorage.setItem("storename", id.value);
});
var search = document.getElementById("tj")
search.addEventListener("click", () => {
	document.getElementById("content").innerHTML = ""
	document.querySelector(".center").style.display = "none"
	var store = document.querySelectorAll("input")[0];
	var plucode = document.querySelectorAll("input")[3];
	var date = document.querySelectorAll("input")[4];
	/*fetch(`https://172.30.226.231:8081/xiangma?storeId=${store.value}&plandate=${date.value}&plucode=${plucode.value}`,{
		"method":"get"
	}).then(res=>{return res.json()}).then(data=>{console.log(data)})*/

	var xhr = new XMLHttpRequest();
	xhr.open("get", `http://172.30.226.231:8081/xiangma?storeId=${store.value}&plandate=${date.value}&plucode=`, false);

	xhr.onreadystatechange = function () {
		//箱码匹配规则
		var reg = new RegExp(document.querySelector(".xm").value+"$")
		var reg1=new RegExp(plucode.value)
		if (xhr.status == 200 && xhr.readyState == 4) {
			var res = JSON.parse(xhr.responseText);
			//查询结果无数据
			if (res[0].AllCount == "0") {
				document.querySelector(".res").innerHTML = res[0].ResultDesc
				return
			}
			var list = {};
			res.slice(1).forEach((index, i) => {
				
				//箱码第一次出现
				if (list[index["XM"]] == undefined&&reg.test(index["XM"])) {
					list[index["XM"]] = { "箱码": index["XM"], "要货单号": index["YHDH"], "明细": index["PH"] + " " + index["PM"] + " " + index["HS"] + "盒", "门店名称": index["MDMC"], "门店编码": index["MDID"], "到货日期": index["FJRQ"] }
				} else if(list[index["XM"]] != undefined&&reg.test(index["XM"])) {
					list[index["XM"]]["明细"] += "<br>" + index["PH"] + " " + index["PM"] + " " + index["HS"] + "盒"
				}
			})

			//写入每条记录到table
			var obj = Object.keys(list)
			
			var str = ""
			var num=0
			obj.forEach((index, i) => {
				if(reg1.test(list[index]["明细"])){
					num++
					str += `<div class="con">
					<div class="head">
					<img src="./zhy.jpg" alt="图片丢失了" class="logo">
					<div class="store_name">${list[index]["门店名称"]}</div>
					</div>
					<div class="body">
					<p>门店编码:${list[index]["门店编码"]}</p>
					<p>箱码：${index}</p>
					<p>到货日期：${list[index]["到货日期"]}</p>
					<p>${list[index]["明细"]}</p>
					</div>
					<div class="foot"></div>
					</div>`
				}
			})
			document.querySelector(".res").innerHTML = `查询成功，共${num}条记录`
			document.getElementById("content").innerHTML = str


		}
	};
	xhr.send();
})
//重新查询
document.getElementById("research").addEventListener("click", function () {
	document.querySelector("#content").innerHTML = ""
	document.querySelector(".res").innerHTML = ""
	document.querySelector(".center").style.display = "block"
	window.location.href = "http://172.30.226.231:8081/"
})
