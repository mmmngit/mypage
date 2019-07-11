window.addEventListener("load",function(){
    var text = new Array(64);
    var n;
    for(var i=0;document.getElementById("text"+i);i++){
        text[i] = document.getElementById("text"+i);
    }
    n=i;
    for(var j=0;j<n;j++){
        var t = text[j].innerHTML.trim();
        t="<p>"+t.replace(/\n/g, "</p><p>")+"</p>";
        //console.log(t)
        text[j].innerHTML = t;
    }
    
})