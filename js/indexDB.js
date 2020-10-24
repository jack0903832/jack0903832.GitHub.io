
    var db;  
    var arrayKey=[]  
    var openRequest;  
    var lastCursor;  
      
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;  
      
    function init()  
    {  
        //打开数据库  
        openRequest = indexedDB.open("messageIndexDB");  
        //只能在onupgradeneeded创建对象存储空间  
        openRequest.onupgradeneeded = function(e)  
        {  
            console.log("running onupgradeneeded");  
            var thisDb = e.target.result;  
            if(!thisDb.objectStoreNames.contains("messageIndexDB"))  
            {  
                console.log("I need to create the objectstore");  
                /* 
                 *创建对象存储空间，第一个参数必须和打开数据库的第一个参数一致 
                 *设置键名是id,并且可以自增. 
                 *autoIncrement默认是false,keyPath默认null 
                 */  
                var objectStore = thisDb.createObjectStore("messageIndexDB", { keyPath: "id", autoIncrement:true });  
                /* 
                 *创建索引 
                 *第一个参数是索引名,第二个是属性名,第三个设置索引特性 
                 */  
                objectStore.createIndex("name", "name", { unique: false });  
            }  
        }  
      
        openRequest.onsuccess = function(e)  
        {  
            //e.target.result返回一个数据库实例  
            db = e.target.result;  
            db.onerror = function(event)  
            {  
              alert("数据库错误: " + event.target.errorCode);  
              console.dir(event.target);  
            };  
            if(db.objectStoreNames.contains("messageIndexDB"))  
            {  
                console.log("contains messageIndexDB");  
                //读写方式开启事务  
                var transaction = db.transaction(["messageIndexDB"],"readwrite");  
                transaction.oncomplete = function(event)  
                {  
                    //  console.log("All done!");  
                };  
                transaction.onerror = function(event)  
                {  
                    // 错误处理  
                    console.dir(event);  
                };  
                //var content= document.querySelector("#content");  
      
                //得到messageIndexDB的objectStore对象  
                var objectStore = transaction.objectStore("messageIndexDB");  
      
                //游标查询  
                objectStore.openCursor().onsuccess = function(event)  
                {  
                    //event.target.result获取存储空间的下一个对象  
                    var cursor = event.target.result;  
                    var flag=0;  
      
                    //判断是否存在下一个对象,不存在是curson为null  
                    if (cursor)  
                    {  
                        console.log(cursor.key); //获取键  
                        console.dir(cursor.value); //实际对象,一个Object实例  
                        var msgList= document.querySelector("#messageList");  
                        var msgDiv=document.createElement("div");  
                        var msgTxt = document.createTextNode(cursor.value[flag]["name"]+"说："+cursor.value[flag]["content"]);  
                        msgDiv.id=cursor.key;  
                        msgDiv.appendChild(msgTxt);  
                        msgList.appendChild(msgDiv);  
                        arrayKey.push(cursor.key);  
                        flag++;  
                        lastCursor=cursor.key;  
                        cursor.continue();   //将游标下移一项  
                    }  
                    else  
                    {  
                          console.log("Done with cursor");  
                    }  
                };  
                //错误处理  
                 objectStore.openCursor().onerror=function(event){  
                    console.dir(event);  
                };  
            }  
        };  
      
        openRequest.onerror = function (event) {  
            // 对request.error做一些需要的处理！  
            console.log("your web may not support IndexedDB,please check.");  
        };  
      
        //焦点处理  
        document.querySelector("#message").addEventListener("focus",function()  
            {  
                this.value = "";  
            });  
        document.querySelector("#name").addEventListener("focus",function()  
            {  
                this.value = "";  
            });  
      
        //添加数据  
        document.querySelector("#btn1").addEventListener("click", function()  
        {  
            var content=document.querySelector("#message").value;  
            var name=document.querySelector("#name").value;  
            /*var address=document.querySelector("#address").value;*/  
            var messageIndexDB=[{"name":name,"content":content}];  
      
            var transaction = db.transaction(["messageIndexDB"], "readwrite");  
            transaction.oncomplete = function(event)  
            {  
               // console.log("transaction complete");  
            };  
            transaction.onerror = function(event)  
            {  
                console.dir(event);  
            };  
             //得到messageIndexDB的objectStore对象  
            var objectStore = transaction.objectStore("messageIndexDB");  
            objectStore.add(messageIndexDB);  
            objectStore.openCursor().onsuccess = function(event)  
            {  
                cursor = event.target.result;  
                var key;  
                if(lastCursor==null)  
                {  
                    key=cursor.key;  
                    lastCursor=key;  
                }  
                else  
                {  
                    key=++lastCursor;  
                }  
                var msgList= document.querySelector("#messageList");  
                var msgDiv=document.createElement("div");  
                msgDiv.id=key;  
                var msgTxt = document.createTextNode(name+"说："+content);  
                msgDiv.appendChild(msgTxt);  
                msgList.appendChild(msgDiv);  
                arrayKey.push(key);  
                console.log("success add new record!key:"+key);  
                console.dir(messageIndexDB);  
            }  
        });  
        //删除  
        document.querySelector("#delete").addEventListener("click", function()  
        {  
            if(arrayKey.length==0){  
                console.log("no data to delete!");  
            }  
            else  
            {  
                var transaction = db.transaction(["messageIndexDB"], "readwrite");  
                transaction.oncomplete = function(event)  
                {  
                       //    console.log("transaction complete!");  
                };  
      
                transaction.onerror = function(event)  
                {  
                  console.dir(event);  
                };  
                 //得到messageIndexDB的objectStore对象  
                var objectStore = transaction.objectStore("messageIndexDB");  
                var removeKey=arrayKey.shift();  
                //获取key  
                var getRequest=objectStore.get(removeKey);  
                getRequest.onsuccess=function(e)  
                {  
                    var result =getRequest.result;  
                    console.dir(result);  
                }  
                //删除key  
                var request=objectStore.delete(removeKey);  
                request.onsuccess = function(e)  
                {  
                  console.log("success delete record!");  
                };  
                request.onerror = function(e)  
                {  
                  console.log("Error delete record:", e);  
                };  
                //隐藏要删除的元素  
                document.getElementById(removeKey).style.display="none";  
            }  
        });  
    }  
    window.addEventListener("DOMContentLoaded", init, false);  
