var t=0;
function a(){
	var a = document.getElementById('a');
	a.insertAdjacentHTML('afterbegin','<button type="submit" onclick="a();">login</button>');
    if(t<15)t++; else if(t==30){t=123;}else{
        for(var i=0;i<t;i++){
            a.insertAdjacentHTML('afterbegin','<button type="submit" onclick="a();">login</button>');
        }
    }
}