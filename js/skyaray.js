var g_data={};
var cryptos={};
var cryptosbest={};
var tablemesg='';

function skyaray()
{
    g_data['baseurl']='https://www.skyaray.com/api/api/publicRealtimeByType?language=zh-CN&type=cryptos&pageNo=1&pageSize=';
    g_data['total']=10;
    g_data['timeout']=5000;
    g_data['vector+']='+';
    g_data['vector-']='-';
    setInterval(getData, 1000);
}

function getData()
{
    var xmlhttp;
	var obj;
	if(window.XMLHttpRequest)
	{
		xmlhttp=new XMLHttpRequest();
	}else
	{
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	/*
	xmlhttp.ontimeout = function () {  
        displayMessage("请求超时,请稍后再试......", ainame);  
        document.getElementById("status").innerHTML = '请求超时';
    };  
	*/
	xmlhttp.onreadystatechange=function()
	{
		if(xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			try{
				obj=JSON.parse(xmlhttp.responseText);
    document.getElementById("testShow").innerHTML=xmlhttp.responseText;
                doing(obj)
			}catch(error)
			{
				console.error('Error-getData:', error);
			}
		}
	}
    
	xmlhttp.timeout = g_data['timeout']; // 设置超时时间为360000
	xmlhttp.open("GET",g_data['baseurl']+g_data['total'],true);
	xmlhttp.send(JSON.stringify(postObj));
}

function doing(obj)
{
    try{
        if(obj['code']!=null&&obj['code']==0)
        {
            g_data['total']=obj['total'];
            if(Array.isArray(obj['data'])&&obj['data'].length > 0)
            {
                obj['data'].forEach(item => {  
                    if(item['name'] in cryptos)
                    {
                        key=item['name']
                        changeRatio=item['changeRatio']-cryptos[key]['changeRatio_old']
                        if( (changeRatio>0 && (cryptos[key]['vector_changeRatio']==g_data['vector+'])) || (changeRatio<0 && (cryptos[key]['vector_changeRatio']==g_data['vector-'])))
                        {
                            cryptos[key]['chk_changeRatio']=cryptos[key]['chk_changeRatio']+1
                        }
                        else if (changeRatio<0 && (cryptos[key]['vector_changeRatio']==g_data['vector+']))
                        {
                            cryptos[key]['chk_changeRatio']=0;
                            cryptos[key]['vector_changeRatio']=g_data['vector-'];
                            cryptos[key]['changeRatio_first']=item;
                        }
                        else if(changeRatio>0 && (cryptos[key]['vector_changeRatio']==g_data['vector-']))
                        {
                            cryptos[key]['chk_changeRatio']=0;
                            cryptos[key]['vector_changeRatio']=g_data['vector+'];
                            cryptos[key]['changeRatio_first']=item;
                            cryptos[key]['changeRatio_old']=item['changeRatio'];
                        }
                        close=parseFloat(item['close'].trim())-cryptos[key]['close_old']
                        if ((close>0 && (cryptos[key]['vector_close']==g_data['vector+'])) || (close<0 && (cryptos[key]['vector_close']==g_data['vector-'])))
                        {
                            cryptos[key]['chk_close']=cryptos[key]['chk_close']+1
                        }
                        else if (close<0 && (cryptos[key]['vector_close']==g_data['vector+']))
                        {
                            cryptos[key]['chk_close']=0
                            cryptos[key]['vector_close']=g_data['vector-']
                            cryptos[key]['close_first']=item
                        }
                        else if (close>0 && (cryptos[key]['vector_close']==g_data['vector-']))
                        {
                            cryptos[key]['chk_close']=0;
                            cryptos[key]['vector_close']=g_data['vector+'];
                            cryptos[key]['close_first']=item;
                            cryptos[key]['close_old']=parseFloat(item['close'].trim());
                        }
                    } else
                    {
                        var cryptosdetail={}
                        cryptosdetail['changeRatio_first']=item
                        cryptosdetail['close_first']=item
                        cryptosdetail['chk_changeRatio']=0
                        cryptosdetail['chk_close']=0
                        cryptosdetail['vector_changeRatio']=g_data['vector+']
                        cryptosdetail['vector_close']=g_data['vector+']
                        cryptosdetail['changeRatio_old']=item['changeRatio']
                        cryptosdetail['close_old']=parseFloat(item['close'].trim())
                        cryptos[item['name']]=cryptosdetail
                    }
                });
            }
            showData();     
        }
    }catch(error)
    {
        console.error('Error-doing:', error);
    }
}

function showData()
{
    try{
        let changeRatio_data='';
        let close_data='';
        let first=0;
        let showmax=5
        let showindex=0
        let sortedEntries = Object.entries(cryptos).sort((a, b) => b[1].chk_changeRatio - a[1].chk_changeRatio);  
        sortedEntries.forEach(([key, value]) => {  
            if(first===0)
            {
                cryptosbest['changeRatio_name']=key
                first=1;
            }
            if(showindex<showmax)
            {
                changeRatio_data+='<tr><td>'+key+'</td><td>'+value['chk_changeRatio']+'</td><td>'+value['vector_changeRatio']+'</td><td>'+value['changeRatio_first']['changeRatio']+'</td><td>'+value['changeRatio_old']+'</td><td>'+timestamp2datetime(value['changeRatio_first']['ts'])+'</td><td>'+timestamp2datetime(Date.now())+'</td></tr>';
            }
        });

        first=0;
        showindex=0;
        sortedEntries = Object.entries(cryptos).sort((a, b) => b[1].chk_close - a[1].chk_close);  
        sortedEntries.forEach(([key, value]) => {  
            if(first===0)
            {
                cryptosbest['close_name']=key
                first=1;
            }
            if(showindex<showmax)
            {
                close_data+='<tr><td>'+key+'</td><td>'+value['chk_close']+'</td><td>'+value['vector_close']+'</td><td>'+value['close_first']['close']+'</td><td>'+value['close_old']+'</td><td>'+timestamp2datetime(value['close_first']['ts'])+'</td><td>'+timestamp2datetime(Date.now())+'</td></tr>';
            }
        });
        tablemesg='';
        tablemesg='<table border="2" style="width:100%;table-layout:fixed;word-wrap:break-word">';
        tablemesg+='<colgroup></colgroup><colgroup></colgroup><colgroup style="width:10%"></colgroup><colgroup style="width:5%"></colgroup><colgroup style="width:5%"></colgroup><colgroup style="width:5%"></colgroup><colgroup style="width:5%"></colgroup><colgroup style="width:50%"></colgroup>';
        tablemesg+='<tr><th align=center colspan=7>skyaray find the tiger</th></tr>';
        tablemesg+='<tr><th align=center colspan=7>changeRatio</th></tr>';
        tablemesg+='<tr><td>name</td><td>chk</td><td>vector(+:開多，-:開空)</td><td>value_first</td><td>value_new</td><td>datetime_first</td><td>datetime_new</td></tr>';
        tablemesg+=changeRatio_data;
        tablemesg+='<tr><th align=center colspan=7>close</th></tr>';
        tablemesg+='<tr><td>name</td><td>chk</td><td>vector(+:開多，-:開空)</td><td>value_first</td><td>value_new</td><td>datetime_first</td><td>datetime_new</td></tr>';
        tablemesg+=close_data;
        tablemesg+='</table>';
        document.getElementById("ressultThreadMesg").innerHTML=tablemesg;
    }catch(error)
    {
        console.error('Error-showData:', error);
    }
}

function timestamp2datetime(timestamp) {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}