// onload
window.addEventListener("load",()=>{
    var c, cw, ch, mx, my, mf, gl, run=1;
    var startTime;
    var time = 0.0;
    var tempTime = 0.0;
    var fps;
    var uniLocation = new Array();

    // canvas エレメントを取得
    c = document.getElementById('background');
    
    // canvas サイズ
    cw = window.innerWidth; 
    ch = window.innerHeight;
    c.width = cw; c.height = ch;

    // WebGL コンテキストを取得
    gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    var vSource = [`
        attribute vec3 position;
        attribute vec2 at_uv;
        varying vec2 uv;
        void main(void){
            uv=at_uv;
            gl_Position = vec4(position, 1.0);
        }
    `].join("\n");
    var vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vSource);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(vShader));

    var fSource = [`
        precision mediump float;
        uniform float time;
        uniform vec2  mouse;
        uniform float scale;
        uniform vec2  resolution;
        uniform sampler2D data;
        uniform vec2  tsize;

        void main(void){
            vec2 p = gl_FragCoord.xy;

            gl_FragColor = texture2D(data,p/tsize/scale+vec2(-1.0*mouse.x,mouse.y));
        }
    `].join("\n");
    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fSource);
    gl.compileShader(fShader);
    if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(fShader));

    
    // シェーダ周りの初期化
    var program = gl.createProgram();
    gl.attachShader(program,vShader);
    gl.attachShader(program,fShader);
    gl.linkProgram(program);
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){gl.useProgram(program);}else console.log(gl.getProgramInfoLog(program));
    
    uniLocation[0] = gl.getUniformLocation(program, 'time');
    uniLocation[1] = gl.getUniformLocation(program, 'mouse');
    uniLocation[2] = gl.getUniformLocation(program, 'scale');
    uniLocation[3] = gl.getUniformLocation(program, 'resolution');
    uniLocation[4] = gl.getUniformLocation(program, 'tsize');
    uniLocation[5] = gl.getUniformLocation(program, 'data');
    
    // 頂点データ回りの初期化
    var position0 = [
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    var posVbo0 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posVbo0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position0), gl.STATIC_DRAW);
    var posAttribute0 = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttribute0);
    gl.vertexAttribPointer(posAttribute0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var index0 = [
        0, 2, 1,
        1, 2, 3
    ];
    var indexVbo0 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVbo0);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index0), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    //テクスチャオブジェクト作成
    gl.activeTexture(gl.TEXTURE0);
    

    var texture = gl.createTexture();
    var img = new Image();
    var h,w=getPo2(cw,ch);h=w;
    var size=w*h;
    var state = new Array(w);
    for(var x=0;x<w;x++){
        state[x] = new Uint8ClampedArray(h);
        for(var y=0;y<h;y++){
            var c = Math.floor(Math.random()*1.1);
            state[x][y] = c;
        }
    }
    var data = new ImageData(makeImagedata(state,w,h),w,h);
    //img.src="http://ksgk.html.xdomain.jp/alife/img.jpg";
    //img.onload = ()=>{
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        // レンダリング関数呼出
        
    //}
    
    // その他の初期化
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    mx = 0.5; my = 0.5;
    startTime = new Date().getTime();

    var scale=2.0;
    var smx=mx,smy=my,dmx,dmy,tmx=mx,tmy=my;
    // イベントリスナー登録
    document.addEventListener('mousemove',(e)=>{
        mx = e.offsetX / cw;
        my = e.offsetY / ch;
    }, true);
    document.addEventListener('mousedown',()=>{smx=mx;smy=my;mf=1});
    document.addEventListener('mouseup',()=>{mf=0});
    document.addEventListener('mousewheel',(e)=>{scale+=e.deltaY>0?0.1:-0.1;});
        
    //render();はimgおわってから
    render();
    fps=6;
    function render(){
        // フラグチェックなど
        if(!run)return 0;
        
        if(mf){
            dmx=smx-mx;dmy=smy-my;
            smx=mx;smy=my;
            tmx-=dmx/scale;
            tmy-=dmy/scale;
        }
        // 時間管理
        time = (new Date().getTime() - startTime) * 0.001;
        
        // カラーバッファをクリア
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // uniform 関連
        gl.uniform1f(uniLocation[0], 0.5*(Math.sin(time)+1));
        gl.uniform2fv(uniLocation[1], [tmx,tmy]);
        gl.uniform1f(uniLocation[2], scale);
        gl.uniform2fv(uniLocation[3], [cw, ch]);
        gl.uniform2fv(uniLocation[4], [w,h]);
        gl.uniform1i(uniLocation[5], 0);
        
        // 描画
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVbo0);
        gl.bindTexture(gl.TEXTURE_2D, texture); 
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.flush();
       
        //texture更新
        
        state = nextState(state,w,h,cw,ch);
        
        data = new ImageData(makeImagedata(state,w,h),w,h);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        // 再帰
        setTimeout(render,10);
    }

    function makeImagedata(state,width,height){
        let n=getPo2(width,height);
        var t= new Uint8ClampedArray(n*n*4);
        for(var x=0;x<width;x++){
            for(var y=0;y<height;y++){
                t[4*x+4*h*y]  =state[x][y]*0;
                t[4*x+4*h*y+1]=state[x][y]*256;
                t[4*x+4*h*y+2]=state[x][y]*170;
                t[4*x+4*h*y+3]=state[x][y]*255;
                // if(x==0||y==0||x==width-1||y==height-1){
                //     t[4*x+4*h*y]  =state[x][y]*255;
                //     t[4*x+4*h*y+1]=state[x][y]*255;
                //     t[4*x+4*h*y+2]=state[x][y]*255;
                // }
                //if(x%100==0&&y%100==0)console.log(x,y,state[x][y]);
            }
        }
        return t;
    }

    function nextState(state,width,height){
        let n=getPo2(width,height);
        let next = new Array(n);
        for(var x=0;x<width;x++){
            next[x] = new Uint8ClampedArray(n).fill(0);
            for(var y=0;y<height;y++){
                let t=0;
                t+=state[x==0?width-1:x-1][y==0?height-1:y-1];
                t+=state[x==0?width-1:x-1][y];
                t+=state[x==0?width-1:x-1][y==height-1?0:y+1];
                t+=state[x]               [y==0?height-1:y-1];
                t+=state[x]               [y==height-1?0:y+1];
                t+=state[x==width-1?0:x+1][y==0?height-1:y-1];
                t+=state[x==width-1?0:x+1][y];
                t+=state[x==width-1?0:x+1][y==height-1?0:y+1];
                
                // if(x==0||y==0||x==width-1||y==height-1)
                //     next[x][y]=0;
                if(state[x][y]==0&&t==3){
                    next[x][y]=1;
                }else if (state[x][y]==1&&t>1&&t<4){
                    next[x][y]=1;
                }else{
                    next[x][y]=0;
                }

            }
        }
        return next;
    }
    function getPo2(width,height){
        return Math.pow(2,Math.ceil(Math.log2(width>height?width:height)));
    }
});
