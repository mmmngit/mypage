window.addEventListener("load",()=>{
    chord={
        "M":[0,4,7],
        "m":[0,3,7],
        "m-5":[0,3,6],
        "aug":[0,4,8],
        "dim":[0,3,6],
        "sus2":[0,2,7],
        "sus4":[0,5,7],
        "6":[0,4,7,9],
        "m6":[0,3,7,9],
        "M7":[0,4,7,11],
        "mM7":[0,3,7,11],
        "7":[0,4,7,10],
        "m7":[0,3,7,10],
        "m7-5":[0,3,6,10],
        "aug7":[0,4,8,10],
        "dim7":[0,3,6,9],
        "7sus4":[0,5,7,10],
        "add9":[0,2,4,7],
        "9":[0,4,7,10,14],
        "m9":[0,2,3,7,10]
    }

    class glGif{
        visible;
        counter;
        speed;
        images;
        loaded;
    
        voltexPosition;
        voltexColor;
        textureCoord;
        index;
    
        attLocation;
        uniLocation;
    
        position;
        vector;
        rotAxis; 
        rotAngle;
        scale;
        //(program,Array attlocationName,Array unilocationName)で全部こっちで出来る
        //attLocation:[0]
        //uniLocation:[0] mvpMatrix,[1] texture
        constructor(set={},iset={})
        {
            this.visible=1;
            this.counter=0;
            this.loaded=0;

            this.texture=0;
            if(("voltexPosition" in set)&&("voltexColor" in set)&&("index" in set)){
                this.voltexPosition = set.voltexPosition;
                this.posVbo = this.createVbo(this.voltexPosition);
                
                this.voltexColor = set.voltexColor;
                this.colVbo = this.createVbo(this.voltexColor);

                this.index = set.index;
                this.Ibo = this.createIbo(this.Vindex);
            }else{
                console.error("fuck voltex");
            }

            if("textureCoord" in set){
                this.texture = gl.createTexture();
                this.textureCoord = set.textureCoord;
                this.texVbo = this.createVbo(this.textureCoord);
            }else{
                this.textureCoord=0;
            }
            
            if(("attLocation" in set)&&("uniLocation" in set)){
                this.attLocation = set.attLocation;
                this.uniLocation = set.uniLocation;
            }else{
                console.error("fuck location");
            }

            if("gif" in iset){
                this.loadGif(iset.gif,iset.num,iset.callback);
            }else if("img" in iset){
                this.loadImage(iset.img,iset.callback);
            }else{
                this.loaded=1;
            }

            this.position = "position" in set ? set.position : [0,0,0];
            this.vector = "vector" in set ? set.vector : [0,0,0];
            this.rotAxis = "rotAxis" in set ? set.rotAxis : [0,1,0];
            this.rotAngle = "rotAngle" in set ? set.rotAngle : 0;
            this.scale = "scale" in set ? set.scale : [1,1,1];
            
            this.m = new matIV();
            this.mMatrix = this.m.identity(this.m.create());   // モデル変換行列
            this.mvpMatrix = this.m.identity(this.m.create()); // 最終座標変換行列

            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    
        get images(){
            return this.images;
        }
        get isloaded(){
            return this.loaded;
        }
        get position(){
            return position;
        }
        get voltexPosition(){
            return voltexPosition;
        }

        /**
         * @param {any} gl
         */
        set glContext(gl){
            this.gl=gl;
        }
        /**
         * @param {[3]} vec3
         */
        set position(vec3){
            this.position = vec3;
        }
        /**
         * @param {[Array]} arr
         */
        set voltexPosition(arr){
            this.voltexPosition=arr;
        }
        /**
         * @param {Array} arr
         */
        set voltexColor(arr){
            this.voltexColor=arr;
        }
        /**
         * @param {Array} arr
         */
        set textureCoord(arr){
            this.textureCoord=arr;
        }
        /**
         * @param {Array} arr
         */
        set index(arr){
            this.index=arr;
        }
        /**
         * @param {any} attLocation
         */
        set Location(attLocation){
            this.attLocation=attLocation;
        }
        /**
         * @param {any} uniLocation
         */
        set Location(uniLocation){
            this.uniLocation=uniLocation;
        }
        
        loadImage(filePath,callback){
            this.images=new Array(1);
            this.images[0] = new Image();
            this.images[0].src = filePath;
            this.images[0].onload=()=>{
                this.loaded=1;
                callback();
            }
            return;
        }
        loadGif(filePath,num,callback){
            this.images=new Array(num-1);
            for(let i=0;i<num;i++){
                this.images[i] = new Image();
                this.images[i].src = filePath+(i+1)+".gif";
                if(i==num-1){
                    this.images[i].onload=()=>{
                        this.loaded=1;
                        callback();
                    }
                }
            }
            return;
        }
    
        draw(mode=gl.TRIANGLES){
            //描画
            this.updatePosition();
            this.updateColor();
            this.updateTextureCoord();
            this.updateTexture();
            this.updateIndex();
            this.updateUniform(vpMatrix);
            
            if(this.visible&&this.isloaded){
                if(this.texture!=0){
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                }else{
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    gl.disableVertexAttribArray(this.attLocation[2]);
                }
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.Ibo);
                gl.drawElements(mode, this.index.length, gl.UNSIGNED_SHORT, 0);
                if(this.texture!=0)gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        }

        updatePosition(){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posVbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.voltexPosition), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.attLocation[0]);
            gl.vertexAttribPointer(this.attLocation[0], 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
        updateColor(){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colVbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.voltexColor), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.attLocation[1]);
            gl.vertexAttribPointer(this.attLocation[1], 4, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
        updateTextureCoord(){
            if(this.textureCoord==0){
                gl.disableVertexAttribArray(this.attLocation[2]);
            }else{
                gl.bindBuffer(gl.ARRAY_BUFFER, this.texVbo);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoord), gl.STATIC_DRAW);
                gl.enableVertexAttribArray(this.attLocation[2]);
                gl.vertexAttribPointer(this.attLocation[2], 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                //gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }
        updateTexture(){
            if(this.texture!=0){
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.images[this.counter]);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                //gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }
        updateIndex(){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.Ibo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(this.index), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        updateUniform(vpMatrix){
            //モデル変換
            this.m.identity(this.mMatrix);
            this.m.translate(this.mMatrix,this.position,this.mMatrix);
            this.m.rotate(this.mMatrix,this.rotAngle,this.rotAxis,this.mMatrix);
            this.m.scale(this.mMatrix,this.scale,this.mMatrix);
            this.m.multiply(vpMatrix, this.mMatrix, this.mvpMatrix); // m を掛ける
            //uniform関連
            gl.uniformMatrix4fv(this.uniLocation[0], false, this.mvpMatrix);
            gl.uniform1i(this.uniLocation[1],0);
        }
        
        createVbo(data){
            var vbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            return vbo;
        }
        createIbo(data){
            var ibo = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            return ibo;
        }
    
        setAttribute(vbo, attLocation, attStride){
            for(var i in vbo){
                gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
                gl.enableVertexAttribArray(attLocation[i]);
                gl.vertexAttribPointer(attLocation[i], attStride[i], gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            }
        }
    }

    class Note extends glGif{//ノート部
        // constructor(root,scales,length,symbols){
        //     this.root=isString(root)?this.rootParser(root):root;
        //     this.scales=isArray(scales)?1:scales;
        //     this.length=length;
        //     this.symbols=symbols;
        // }
        set setRoot(num){
            if(isString(num)){
                num=Note.getNum(num);
            }
            this.root=num;
        }
        set setSharp(bool){
            this.sharp=bool;
        }
        set setlocation(location){
            this.location=location;
        }
        static getFreq(root){
            if(isArray(root)){
                let t=root.map(x=>x=this.getFreq(x));
                return t;
            }else{
                let n;
                if(isString(root))n=this.getNum(root);else n=root;
                let t=440*Math.pow(2,(n-69)/12);
                return t;
            }
        }
        static getNum(root){
            if(isArray(root)){
                let t=root.map(x=>x=this.getNum(x));
                return t;
            }else{
                let t;
                let n=root.slice(-1);
                if(0>t||7<t)return 60;
                switch(root[0]){
                    case "C":t=0;break;
                    case "D":t=2;break;
                    case "E":t=4;break;
                    case "F":t=5;break;
                    case "G":t=7;break;
                    case "A":t=9;break;
                    case "B":t=11;break;
                }
                if(root[1]=="#"){
                    t++;
                }else if(n[1]==="♭"){
                    t--;
                }else if(+n!==+n){
                    n=0;
                }
                if(!n)n=4;
                t+=+n*12+12;
                return t;
            }
        }
        static getPitchName(num,exceptSharp=0){
            if(isString(num)){
                if(exceptSharp){
                    num=this.exceptSharp(num);
                }
                return num;
            }else if(isArray(num)){
                let t=num.map(x=>this.getPitchName(x));
                return t;
            }else{
                let o=Math.floor(num/12)-1;
                let t=num%12;
                switch(t){
                    case 0: t='C';; break;
                    case 1: t='C#';;break;
                    case 2: t='D';; break;
                    case 3: t='D#';;break;
                    case 4: t='E'; break;
                    case 5: t='F'; break;
                    case 6: t='F#';break;
                    case 7: t='G'; break;
                    case 8: t='G#';break;
                    case 9: t='A'; break;
                    case 10:t='A#';break;
                    case 11:t='B'; break;
                }
                if(exceptSharp){
                    return t[0]+o;
                }
                return t+o;
            }
        }
        static getWhiteNum(posName){
            let t;
            if(!isString(posName)){
                posName=Note.getPitchName(posName);
            }
            switch(posName[0]){
                case "C":t=0;break;
                case "D":t=1;break;
                case "E":t=2;break;
                case "F":t=3;break;
                case "G":t=4;break;
                case "A":t=5;break;
                case "B":t=6;break;
            }
            let o = +posName.slice(-1);
            return t+o*7;
        }

        static exceptSharp(posName){
            if(isString(posName)){
                return posName[0]+posName.slice(-1);
            }else{
                return this.getPitchName(posName,1);
            }
        }
    
        static rand(max,min,fSharp,fChord){
            if(fChord){
                let t=this.rand(max,min,fSharp,0);
                let i=Object.keys(chord)[irand(Object.keys(chord).length,1)-1];
                let a=chord[i];
                return {node:a.map(x=>t.node+x),name:i};
            }else{
                let t=irand(max,min);
                let a=t%12;
                if(!fSharp)while(a<5&&a%2==1||a>5&&a%2==0){t=irand(max,min);a=t%12;};
                return {node:t,name:null};
            }
        }
        static randDirtonicChord(root,octave=1){
            let t=irand(7*octave);
            let n;
            switch(t%7){
                case 0:case 3:case 4:
                    n=this.chordGenerator("M",this.keyAdd(root,t));
                break;
                case 1:case 2:case 5:
                    n=this.chordGenerator("m",this.keyAdd(root,t));
                break;
                case 6:
                    n=this.chordGenerator("m-5",this.keyAdd(root,t));
                break;
            }
            return {node:n};
        }
    
        static chordGenerator(chordName,root){
            if(!root)root=60;
            if(isArray(chordName)){
                return chordName.map(x=>x+root);
            }else if(isString(chordName)){
                return chord[chordName].map(x=>x+root);
            }else{
                return;
            }
        }
        static keyAdd(root,num,key=0){
            if(num==0)return root;
            if(this.isSharp(root+1))return this.keyAdd(root+2,num-1);else return this.keyAdd(root+1,num-1);
        }
        static keySub(root,num,key=0){
            if(num==0)return root;
            if(this.isSharp(root-1))return this.keySub(root-2,num-1);else return this.keySub(root-1,num-1);
        }
        static isSharp(num,key=0){
            if(isString(num)){
                if(num[1]=="#")return 1;else return 0;
            }else{
            let t=num%12;
                switch(t){
                    case 0:case 2:case 4:case 5:case 7:case 9:case 11:
                        return 0;
                    break;
                    case 1:case 3:case 6:case 8:case 10:
                        return 1;
                    break;
                }
            }
        }
        // view(){
    
        // }
    }

    class Score{
        constructor(attLocation,uniLocation){
            this.key=0;
            this.queue;
            this.notePosition={
                "he":{
                    "A1":[0.0,-0.30,0.0],
                    "B1":[0.0,-0.25,0.0],
                    "C2":[0.0,-0.20,0.0],
                    "D2":[0.0,-0.15,0.0],
                    "E2":[0.0,-0.10,0.0],
        
                    "F2":[0.0,-0.05,0.0],
                    "G2":[0.0, 0.00,0.0],
                    "A2":[0.0, 0.05,0.0],
                    "B2":[0.0, 0.10,0.0],
                    "C3":[0.0, 0.15,0.0],
                    "D3":[0.0, 0.20,0.0],
                    "E3":[0.0, 0.25,0.0],
                    "F3":[0.0, 0.30,0.0],
                    "G3":[0.0, 0.35,0.0],
                    "A3":[0.0, 0.40,0.0],
                    "B3":[0.0, 0.45,0.0],
        
                    "C4":[0.0, 0.50,0.0],
                    "D4":[0.0, 0.55,0.0],
                    "E4":[0.0, 0.60,0.0],
                    "F4":[0.0, 0.65,0.0],
                    "G4":[0.0, 0.70,0.0],
                },
                "to":{
                    "F3":[0.0, 0.70,0.0],
                    "G3":[0.0, 0.75,0.0],
                    "A3":[0.0, 0.80,0.0],
                    "B3":[0.0, 0.85,0.0],
                    "C4":[0.0, 0.90,0.0],
        
                    "D4":[0.0, 0.95,0.0],
                    "E4":[0.0, 1.00,0.0],
                    "F4":[0.0, 1.05,0.0],
                    "G4":[0.0, 1.10,0.0],
                    "A4":[0.0, 1.15,0.0],
                    "B4":[0.0, 1.20,0.0],
                    "C5":[0.0, 1.25,0.0],
                    "D5":[0.0, 1.30,0.0],
                    "E5":[0.0, 1.35,0.0],
                    "F5":[0.0, 1.40,0.0],
                    "G5":[0.0, 1.45,0.0],
        
                    "A5":[0.0, 1.50,0.0],
                    "B5":[0.0, 1.55,0.0],
                    "C6":[0.0, 1.60,0.0],
                    "D6":[0.0, 1.65,0.0],
                    "E6":[0.0, 1.70,0.0],
                    "F6":[0.0, 1.75,0.0],
                    "G6":[0.0, 1.80,0.0],
                    "A6":[0.0, 1.85,0.0],
                    "B6":[0.0, 1.90,0.0],
                    "C7":[0.0, 1.95,0.0],
                    //42+black=:62
                }
            };
            this.img={
                "voltexPosition":[-1.0,1.0,0.0,1.0,1.0,0.0,-1.0,-1.0,0.0,1.0,-1.0,0.0],
                "voltexColor":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0],
                "textureCoord":[0.0,0.0,1.0,0.0,0.0,1.0,1.0,1.0],
                "index":[0,1,2,2,1,3],
                "attLocation":attLocation,
                "uniLocation":uniLocation
            };
            let len=2; let d=0.1;
            this.wataten5={
                "voltexPosition":[-len,0.0,0.0, len, 0.0,0.0,-len,0.01,0.0, len, 0.01,0.0,-len,d+0.0,0.0, len,d+0.0,0.0,-len,d+0.01,0.0, len,d+0.01,0.0,-len,2*d+0.0,0.0, len, 2*d+0.0,0.0,-len,2*d+0.01,0.0, len, 2*d+0.01,0.0,-len,3*d+0.0,0.0, len, 3*d+0.0,0.0,-len,3*d+0.01,0.0, len, 3*d+0.01,0.0,-len,4*d+0.0,0.0, len, 4*d+0.0,0.0,-len,4*d+0.01,0.0, len, 4*d+0.01,0.0],
                "voltexColor":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0],
                "index":[0,1,2,2,1,3,4,5,6,6,5,7,8,9,10,10,9,11,12,13,14,14,13,15,16,17,18,18,17,19],
                "attLocation":attLocation,
                "uniLocation":uniLocation
            };
            this.altwataten5={
                "voltexPosition":[-0.09,0.0,0.0, 0.09,0.0,0.0,-0.09,0.01,0.0, 0.09,0.01,0.0],
                "voltexColor":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0],
                "index":[0,1,2,2,1,3],
                "attLocation":attLocation,
                "uniLocation":uniLocation
            };
            this.loaded=0;
            this.noteNum=20;
            this.staffNum=2;
            this.altNum=60;
            this.sharpNum=30;

            this.to=new glGif(this.img,{
                "img":"img/to.png",
                "callback":()=>this.loaded++,
            });
            this.size=0.36;
            this.to.position=[-1.87,1.18,0.0];
            this.to.scale=[this.size,this.size,1];

            this.he=new glGif(this.img,{
                img:"img/he.png",
                "callback":()=>this.loaded++,
            });
            this.hsize=0.34;
            this.he.position=[-1.85,0.25,0.0];
            this.he.scale=[this.hsize,this.hsize,1];

            this.osize=0.065;
            this.note=new Array(this.noteNum);
            for(let i=0;i<this.noteNum;i++){
                this.note[i]=new Note(this.img);
                this.note[i].visible=0;
                this.note[i].scale=[this.osize,this.osize,1];
                this.note[i].loadImage("img/on.png",()=>{
                    this.loaded++;
                });
            }
            this.staff=new Array(this.staffNum);
            for(let i=0;i<this.staffNum;i++){
                this.staff[i]=new glGif(this.wataten5);
            }
            this.alt=new Array(this.altNum);
            for(let i=0;i<this.altNum;i++){
                this.alt[i]=new glGif(this.altwataten5);
                this.alt[i].visible=0;
            }
            this.ssize=0.16;
            this.sharp=new Array(this.sharpNum);
            for(let i=0;i<this.sharpNum;i++){
                this.sharp[i]=new glGif(this.img,{
                    "img":"img/sha.png",
                    "callback":()=>this.loaded++,
                });
                this.sharp[i].position=[-0.15,0.0,0.01];
                this.sharp[i].scale=[this.ssize,this.ssize,1];
                this.sharp[i].visible=0;
                this.sharp[i].loadImage("img/sha.png",()=>{
                    this.loaded++;
                });
            }

            this.alt[0].position=[0.0,0.9,0.0];

            this.staff[0].position=[0.0,1.0,0.0];
            this.staff[1].position=[0.0,0.0,0.0];
        }
        get isloaded(){
            return this.loaded>=this.noteNum+2?1:0;
        }
        getNotePosition(posName,location="to",x=0,z=0){
            let t;
            if(!isString(posName)){
                posName=Note.getPitchName(posName);
            }
            switch(posName[0]){
                case "C":t=0;break;
                case "D":t=1;break;
                case "E":t=2;break;
                case "F":t=3;break;
                case "G":t=4;break;
                case "A":t=5;break;
                case "B":t=6;break;
            }
            let o = +(posName.slice(-1));
            if(location=="to"){
                return [x,1.2+(t+o*7-34)*0.05,z];
            }else if(location=="he"){
                return [x,0.8+(t+o*7-34)*0.05,z];
            }else{
                return [0,0,0];
            }
            
        }
        setChord(chord,base=0,x=0){
            let n=chord.node.length;
            if(n>0)console.log(chord.node,Note.getPitchName(chord.node))
            let i=0;
            for(let t of this.note){
                if(i<n){
                    t.root=chord.node[i];
                    t.visible=1;
                    this.setNotePosition(i,t.root,0,x);
                }else{
                    t.root=-1;
                    t.root=chord.node[i];
                    t.visible=0;
                }
                i++;
            }
            if(base){
                this.note[n].visible=1;
                this.setNotePosition(n,Note.getPitchName(chord.node[n-1])[0]+"2","he",x);
            }
            this.noteCheck();
        }
        setNotePosition(num,posName,location=0,x=0){
            this.note[num].setRoot=posName;
            if(isString(posName)){
                posName=Note.getNum(posName);
            }
            if(location==0)location=posName<60?"he":"to";
            this.note[num].setlocation=location;
            this.note[num].position=this.getNotePosition(posName,location,x);
        }
        setSharp(){
            let i =0;
            for(let x of this.note){
                if(x.sharp&&x.visible){
                    this.sharp[i].visible=1;
                    this.sharp[i].position=[-0.15,x.position[1],0.01];
                }else{
                    this.sharp[i].visible=0;
                }
            }
        }
        setkey(n){
            if(isString(n)){
                this.key=Note.getNum(n)%12;
            }else{
                this.key=n%12;
            }
        }
        noteCheck(){
            for(let y of this.alt){
                y.visible=0;
            }
            let tmax=0,tmin=100;
            let hmax=0,hmin=100;
            for(let x of this.note){
                if(Note.isSharp(x.root,this.key)){
                    x.sharp=1;
                }else{
                    x.sharp=0;
                }
                if(x.location=="to"){
                    if(x.root>=80){
                        let tx=Math.floor((Note.getWhiteNum(x.root)-38)/2);
                        if(tmax<tx)tmax=tx;
                    }else if(x.root<=60){
                        let tn=Math.ceil((29-Note.getWhiteNum(x.root))/2);
                        if(tmin>tn)tmin=tn;
                    }
                }else if(x.location=="he"){
                    if(x.root>=60){
                        let hx=Math.floor((Note.getWhiteNum(x.root)-27)/2);
                        if(hmax<hx)hmax=hx;
                    }else if(x.root<=40){
                        let hn=Math.ceil((16-Note.getWhiteNum(x.root))/2);
                        if(hmin>hn)hmin=hn;
                    }
                }
            }
            let i=0;
            for(let y of this.alt){
                if(i<tmax&&i<20){
                    y.visible=1;
                    y.position=this.getNotePosition(Note.keyAdd(81/*A5*/,i*2));
                }else if(tmin!=100&&(i-20)<tmin&&i<40&&i>=20){
                    y.visible=1;
                    y.position=this.getNotePosition(Note.keySub(60/*A5*/,(i-20)*2));
                }else if(tmin!=100&&(i-20)<tmin&&i<40&&i>=20){
                    y.visible=0;
                }
                
                i++;
            }
            this.setSharp();
        }

        play(){

        }
        
        draw(vpMatrix){
            this.staff[0].draw();
            this.staff[1].draw();

            for(let i of this.alt)
            i.draw();

            this.to.draw();
            this.he.draw();

            for(let i=0;i<this.noteNum;i++){
                this.note[i].draw();
            }
            for(let i=0;i<this.sharpNum;i++){
                this.sharp[i].draw();
            }
        }
    }

    var c, cw, ch, mx, my, mf, gl, run=1;
    var startTime;
    var time = 0.0;
    var tempTime = 0.0;
    var fps;
    var count;
    var uniLocation = new Array();
    var attLocation = new Array();
    
    // canvas エレメントを取得
    c = document.getElementById('score');
    
    // canvas サイズ
    cw = window.innerWidth;
    ch = cw*3/5;
    c.width = cw; c.height = ch;

    // WebGL コンテキストを取得
    gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    var vSource = [`
    attribute vec3 position;
    attribute vec4 color;
    attribute vec2 textureCoord;
    uniform   mat4 mvpMatrix;
    varying   vec4 vColor;
    varying   vec2 vTextureCoord;

    void main(void){
        vColor        = color;
        vTextureCoord = textureCoord;
        gl_Position   = mvpMatrix * vec4(position, 1.0);
    }
    `].join("\n");
    var vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vSource);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(vShader));

    var fSource = [`
    precision mediump float;

    uniform sampler2D texture;
    varying vec4      vColor;
    varying vec2      vTextureCoord;
    
    void main(void){
        vec4 smpColor = texture2D(texture, vTextureCoord);
        gl_FragColor  = vColor * smpColor;
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
    
    uniLocation[0] = gl.getUniformLocation(program, 'mvpMatrix');
    uniLocation[1] = gl.getUniformLocation(program, 'texture');

    attLocation[0] = gl.getAttribLocation(program, 'position');
    attLocation[1] = gl.getAttribLocation(program, 'color');
    attLocation[2] = gl.getAttribLocation(program, 'textureCoord');

    //テクスチャオブジェクト作成
    gl.activeTexture(gl.TEXTURE0);

    //mvpMatrix作成
    var m = new matIV();
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var vpMatrix = m.identity(m.create());

    // ビュー座標変換行列
    m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
    // プロジェクション座標変換行列
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, vpMatrix);

    var score=new Score(attLocation,uniLocation);

    // その他の初期化
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    mx = 0.5; my = 0.5;
    startTime = new Date().getTime();

    //Midi keybord Setup
    let midi;
    //通信成功時
    function success(midiAccess){
        midi = midiAccess;
        setInput(midiAccess);
        console.log("MIDI READY");
    }
    //通信失敗時
    function failure(msg){
        console.log("MIDI FAILED - " + msg);
    }
    //MIDIAccessオブジェクトのinputsを取得してイベント付与
    function setInput(midiAccess){
        var inputs = midiAccess.inputs;
        inputs.forEach(function(key,port){
            console.log("[" + key.state + "] manufacturer:" + key.manufacturer + " / name:" + key.name + " / port:" + port);
            key.onmidimessage = onMidiMessage;
        });
    }
    //MIDIデバイスからメッセージが送られる時に実行
    let keyInputqueue=new Array;
    function onMidiMessage(event){
        //console.log(event);
        var str = '';
        for (var i = 0; i < event.data.length; i++) {
            str += event.data[i] + ':';
        }
        if(event.data[0]==144){
            keyInputqueue.push(event.data[1]);
        }
        if(event.data[0]==128){
            keyInputqueue=keyInputqueue.filter(x=>x!=event.data[1]);
        }
        score.setChord({node:keyInputqueue});
        //console.log(str);
    }
    navigator.requestMIDIAccess({sysex:false}).then(success, failure);
    
    window.addEventListener("click",()=>{
        score.setChord(Note.randDirtonicChord(60,1),1,0.6);
    })
    fps=60;
    count=0;
    loading();
    function loading(){
        if(score.isloaded)render();
        else setTimeout(loading,1000/fps);
    }
    function render(){
        // フラグチェックなど
        if(!run)return 0;
        
        // 時間管理
        time = (new Date().getTime() - startTime) * 0.001;
        // カラーバッファをクリア
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        score.draw(vpMatrix);

        gl.flush();
        // 再帰

        count++;
        setTimeout(render,1000/fps);
    }
});
