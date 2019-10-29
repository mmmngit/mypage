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

    class Midiparcer{
        constructor(data){
            this.metaEvent={
                0x00:{name:"Sequence number",
                      function:(t)=>{return getInt(t)}
                    },
                0x01:{name:"Text event",
                      function:(t)=>{return getChar(t)},
                    },
                0x02:{name:"Copyright notice",
                      function:(t)=>{return getChar(t)},
                    },
                0x03:{name:"Sequence or track name",
                      function:(t)=>{return getChar(t)},
                    },
                0x04:{name:"Instrument name",
                      function:(t)=>{return getChar(t)},
                    },
                0x05:{name:"Lyric text",
                      function:(t)=>{return getChar(t)},
                    },
                0x06:{name:"Marker text",
                      function:(t)=>{return getChar(t)},
                    },
                0x07:{name:"Cue point",
                      function:(t)=>{return getChar(t)},
                    },
                0x08:{name:"Program Name",
                      function:(t)=>{return getChar(t)},
                },
                0x09:{name:"Device Name",
                      function:(t)=>{return getChar(t)},
                },
                0x20:{name:"MIDI channel prefix assignment",
                      function:null,
                    },
                0x21:{name:"Port",
                    function:null,
                },
                0x2F:{name:"End of track",
                      function:null,
                    },
                0x51:{name:"Tempo setting",
                      function:(t)=>{return 60000000/getInt(t)},
                    },
                0x54:{name:"SMPTE offset",
                      function:null,
                    },
                0x58:{name:"Time signature",
                      function:null,
                    },
                0x59:{name:"Key signature",
                      function:(t)=>{return this.getKey(t[0],t[1])},
                    },
                0x7F:{name:"Sequencer specific event",
                      function:null,
                    },
            };
            this.MIDIEvent={
                0x80:{name:"Note off",
                      function:(t)=>{return {key:t[0],velocity:t[1]}}
                },
                0x90:{name:"Note on",
                      function:(t)=>{return {key:t[0],velocity:t[1]}}
                },
                0xA0:{name:"Polyphonic aftertouch",
                      function:(t)=>{return {key:t[0],velocity:t[1]}}
                },
                0xB0:{name:"Control mode change",
                      function:(t)=>{return {function:t[0],value:t[1]}}
                },
                0xC0:{name:"Program change",
                      function:(t)=>{return {Program:t[0]}}
                },
                0xD0:{name:"Channel aftertouch",
                      function:(t)=>{return {pressure:t[0]}}
                },
                0xE0:{name:"Pitch wheel range",
                      function:(t)=>{return {LSB:t[0],MSB:t[1]}}
                },
                0xF0:{nume:"SysEx",
                      function:(t)=>{return {data:t}}
                }
            }
            //console.log(data);
            this.header ={
                //チャンクタイプ
                chunktype:getxInt(data.subarray(0,4)),
                //ヘッダサイズ
                size :getInt(data.subarray(4,8)),
                //SMFフォーマット
                format : getInt(data.subarray(8,10)),
                //トラックの数
                tracksize : getInt(data.subarray(10,12)),
                //時間単位
                timeunit : getInt(data.subarray(12,14)),
            }
            //console.log("header",this.header)
            data=data.subarray(14);
            this.track=new Array(this.header.tracksize);
            this.trackNum=1;
            let maxNoteNum=0;
            for(let i=0;i<this.track.length;i++){
                this.track[i]={
                    name:"track"+i,
                    chunktype:getxInt(data.subarray(0,4)),
                    size:getInt(data.subarray(4,8)),
                    data:null,
                }
                this.track[i].data=data.subarray(8,this.track[i].size+8);
                data=data.subarray(this.track[i].size+8);
                
                this.track[i].data=this.trackParcer(this.track[i].data);
                
                let tmp=0
                if("Note on" in this.track[i].data)
                    tmp=this.track[i].data["Note on"].length;

                if(maxNoteNum<tmp){
                    this.trackNum=i;
                    maxNoteNum=tmp;
                }
            }
            this.MIDIData={
                header:this.header,
                track:this.track,
            }
            console.log("MIDIData",this.MIDIData);
        }

        trackParcer(data){
            let track={};
            let delta=0;
            while(data.length>0){

                //getdeltatime
                let d=this.getDeltaTime(data);
                data=d.ar;

                if(data[0]==255){//meta
                    let eventname,size;
                    let t={
                        tick:delta+d.deltatime,
                        duration:d.deltatime,
                        data:null,
                    }
                    if(data[1] in this.metaEvent){
                        eventname=this.metaEvent[data[1]].name;
                        size=data[2];
                        if(this.metaEvent[data[1]].function)
                        t.data=this.metaEvent[data[1]].function(data.subarray(3,3+size));
                        else
                        t.data=data.subarray(3,3+size);
                    }
                    if(!(eventname in track)){
                        track[eventname]=[];
                    }
                    track[eventname].push(t);
                    delta=t.tick;
                    data=data.subarray(3+size);
                    if(eventname==="End of track")return track;
                }else{
                    let eventname,size,tmp=data[0];
                    let t={
                        tick:delta+d.deltatime,
                        duration:d.deltatime,
                        channel:tmp&0x0F,
                        data:null,
                    }
                    tmp=tmp&0xF0;
                    if(tmp in this.MIDIEvent){
                        eventname=this.MIDIEvent[tmp].name;
                        size=(tmp==0xC0||tmp==0xD0)?2:3;
                        if(this.MIDIEvent[tmp].function)
                        t.data=this.MIDIEvent[tmp].function(data.subarray(1,1+size));
                        else
                        t.data=data.subarray(1,1+size);
                    }
                    if(!(eventname in track)){
                        track[eventname]=[];
                    }
                    track[eventname].push(t);
                    delta=t.tick;
                    data=data.subarray(size);
                }
            }
            return track;
        }
        getDeltaTime(ar){
            var value=0;
            var i=0;
            while(ar[i]>=0x80){
                var a = (ar[i]&0x7F);
                value = value<<7|a;
                i++;
            }
            //最後の値を連結
            value = value<<7|ar[i];
            //計算したデルタタイムと配列の残りをリターン
            return {ar:ar.subarray(i+1),deltatime:value}
        }
        getKey(num,mi){
            let t,m;
            if(mi){
                m="minor";
            }else{
                m="major";
            }
            if(num>240)num-=256;
            switch(num){
                case 0: t='C';  break;
                case 1: t='G';  break;
                case 2: t='D';  break;
                case 3: t='A';  break;
                case 4: t='E';  break;
                case 5: t='B';  break;
                case 6: t='F#'; break;
                case 7: t='C#'; break;
                case -1:t='F';  break;
                case -2:t='B♭'; break;
                case -3:t='E♭'; break;
                case -4:t='A♭'; break;
                case -5:t='D♭'; break;
                case -6:t='G♭'; break;
                case -7:t='C♭'; break;
            }
            return {key:t,mi:m};
        }

        getNoteArray(trackNum){
            if(!trackNum)trackNum=this.trackNum;
            console.log("track"+trackNum)
            let obj;
            try{
                obj=this.MIDIData.track[trackNum].data["Note on"];
            }catch{
                console.error("track["+trackNum+"] don't have any Notes");
                return [{keys:[],tick:0,duration:0}];
            }
            let size=obj.length;
            let duration=0,tick=0;
            let Notes=[];
            let t={
                keys:[],
                tick:0,
                duration:0,
            };
            tick=obj[0].tick;
            console.log(obj[0])
            for(let i=0;i<size;i++){
                if(obj[i].tick==tick){
                    t.keys.push(obj[i].data.key);
                }else{
                    t.tick=tick;
                    Notes.push(Object.assign({},t));
                    t.keys=[];
                    t.keys.push(obj[i].data.key);
                    t.duration=obj[i].tick-tick;
                    tick=obj[i].tick;
                }
            }
            console.log(Notes);
            return Notes;
        }
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

            //gl.bindTexture(gl.TEXTURE_2D, null);
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
        set xPos(num){
            this.position = [num,this.position[1],this.position[2]];
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
            //this.updateTexture();
            this.updateIndex();
            this.updateUniform(vpMatrix);
            //テクスチャユニットをつかうこと
            
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
                //gl.bindBuffer(gl.ARRAY_BUFFER, null);
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
            //gl.uniform1i(this.uniLocation[1],0);
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

    class Note{
        constructor(imageSet={},symbolISet={},sharpISet={},notePosFunction){
            this.symbol=new glGif(imageSet,symbolISet);
            this.sharp=new glGif(imageSet,sharpISet);
            this.root=-1;
            this.isSharp=0;
            this.location="auto";
            this.xPos=0;
            this.getNotePosition=notePosFunction;
        }
        setRoot(num){
            if(isString(num)){
                num=Note.getNum(num);
            }
            this.root=num;
        }
        setSharp(bool){
            this.sharp=bool;
        }
        setLocation(location){
            this.location=location;
        }
        set position(position){
            this.symbol.position=position;
            this.sharp.position=[position[0]-0.105,position[1],position[2]];
        }
        set x(num){
            this.xPos=num;
        }
        drawSymbol(){
            this.symbol.draw();
        }
        drawSharp(){
            this.sharp.draw();
        }
        check(key=0){
            if(Note.isSharp(this.root,key)==1){
                this.sharp.visible=1;
            }else{
                this.sharp.visible=0;
            }
            if(this.root<0){
                this.symbol.visible=0;
                return 0;
            }else{
                this.symbol.visible=1;
                if(this.location=="auto")this.location=this.root<60?"he":"to";
                this.setNotePosition(this.root,this.location,this.xPos);
            }
            if(this.symbol.visible==0){
            }
            return 1;
        }

        setNotePosition(posName,location=0,x=0){
            this.xPos=x;
            if(isString(posName)){
                posName=Note.getNum(posName);
            }
            this.position=this.getNotePosition(posName,location,this.xPos);
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
            if(!posName){console.error("posname is null");return;}
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
                return {keys:t,name:null};
            }
        }
        static randDirtonicChord(root,octave=1){
            let t=irand(7*octave-1);
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
            return {keys:n};
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
            if(num<0)return 0;
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

    class Notes{
        constructor(imageSet={},symbolISet={},sharpISet={},altSet={},notePosFunction){
            this.note=new Array(10);
            this.getNotePosition=notePosFunction;
            for(let i=0;i<10;i++){
                this.note[i] = new Note(imageSet,symbolISet,sharpISet,notePosFunction);
                this.note[i].symbol.visible=0;
                this.note[i].sharp.visible=0;
            }
            this.alt=new Array(40);
            for(let i=0;i<40;i++){
                this.alt[i] = new glGif(altSet);
                this.alt[i].visible=0;
            }
            this.visible=0;
            this.xPosition=0;
        }
        set noteScale(scale){
            for(let x of this.note){
                x.symbol.scale=scale;
            }
        }
        set sharpScale(scale){
            for(let x of this.note){
                x.sharp.scale=scale;
            }
        }
        set root(scales){
            let t=scales.length;
            let i=0;
            for(let x of this.note){
                if(i<t){
                    x.setRoot(scales[i]);
                }else{
                    x.setRoot(-1);
                }
                i++;
            }
        }
        set location(locationArray){
            let t=this.note.length;
            let locations = locationArray;
            if(!isArray(locations)){
                locations=new Array(t);
                locations.fill("to");
            }
            let i=0;
            for(let x of this.note){
                if(i<t){
                    x.setLocation(locations[i]);
                }
                i++;
            }
        }
        setRootLocation(scales,location=0){
            let t=scales.length;
            if(!isArray(location)){location=new Array(t);location.fill("to")}
            let i=0;
            for(let x of this.note){
                if(i<t){
                    x.setRoot(scales[i]);
                    x.setLocation(location[i]);
                }else{
                    x.setRoot(-1);
                }
                i++;
            }
        }
        set xPos(num){
            for(let x of this.note){
                x.xPos=num;
            }
            this.xPosition=num;
        }
        get root(){
            return this.note.map(e => e=e.root).filter(e=>e>1);
        }
        check(key=0){
            let tmax=0,tmin=0;
            let hmax=0,hmin=0;
            for(let x of this.note){
                if(x.check(key)){//xが有効ノートなら
                    //console.log(x)
                    if(x.location=="to"){
                        if(x.root>=80){
                            let tx=Math.floor((Note.getWhiteNum(x.root)-38)/2);
                            if(tmax<tx)tmax=tx;
                        }else if(x.root<=60){
                            let tn=Math.ceil((29-Note.getWhiteNum(x.root))/2);
                            if(tmin<tn)tmin=tn;
                            
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
            }
            
            let i=0;
            for(let y of this.alt){
                y.visible=0;
                if(i<tmax&&i<10){
                    y.visible=1;
                    y.position=this.getNotePosition(Note.keyAdd(81/*A5*/,i*2),"to",this.xPosition);
                }else if(tmin!=100&&(i-10)<tmin&&i<20&&i>=10){
                    y.visible=1;
                    y.position=this.getNotePosition(Note.keySub(60/*E4*/,(i-10)*2),"to",this.xPosition);
                }else{
                    y.visible=0;
                }
                i++;
            }
        }
        drawNoteSymbol(){
            if(this.visible)
            for(let x of this.note){
                x.drawSymbol();
            }
        }
        drawNoteSharp(){
            for(let x of this.note)x.drawSharp();
        }
        drawAlt(){
            for(let x of this.alt) x.draw();
        }
    }

    class Score{
        constructor(attLocation,uniLocation){
            this.img={
                "voltexPosition":[-1.0,1.0,0.0,1.0,1.0,0.0,-1.0,-1.0,0.0,1.0,-1.0,0.0],
                "voltexColor":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0],
                "textureCoord":[0.0,0.0,1.0,0.0,0.0,1.0,1.0,1.0],
                "index":[0,1,2,2,1,3],
                "attLocation":attLocation,
                "uniLocation":uniLocation
            };
            let len=3; let d=0.1;
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
            this.key=0;
            this.tick=0;
            this.timeunit=480;
            this.queue=new Array();
            this.queuePos=0;
            this.queueAddF=1;
            this.loaded=0;
            this.noteNum=16;
            this.staffNum=2;
            this.toheX=-2.8;
            this.scoreY=0;
            this.xPos=-1.60;

            this.to=new glGif(this.img,{
                "img":"img/to.png",
                "callback":()=>this.loaded++,
            });
            this.tsize=0.36;
            this.to.position=[this.toheX-0.02,this.scoreY+1.18,0.0];
            this.to.scale=[this.tsize,this.tsize,1];

            this.he=new glGif(this.img,{
                img:"img/he.png",
                "callback":()=>this.loaded++,
            });
            this.hsize=0.34;
            this.he.position=[this.toheX,this.scoreY+0.25,0.0];
            this.he.scale=[this.hsize,this.hsize,1];

            this.osize=0.065;
            this.ssize=0.17;
            this.note=new Array(this.noteNum);
            for(let i=0;i<this.noteNum;i++){
                this.note[i]=new Notes(this.img,{
                    "img":"img/on.png",
                    "callback":()=>{
                        this.loaded++;
                    },
                },{
                    "img":"img/sha.png",
                    "callback":()=>{
                        this.loaded++;
                    },
                },this.altwataten5,this.getNotePosition);
                this.note[i].visible=0;
                
                this.note[i].noteScale=[this.osize,this.osize,1];
                this.note[i].sharpScale=[this.ssize,this.ssize,1];
                for(let obj of this.note[i].note){
                    obj.sharp.visible=0;
                    obj.symbol.texture=this.note[0].note[0].symbol.texture;
                    obj.sharp.texture=this.note[0].note[0].sharp.texture;
                }
            }
            this.note[this.noteNum-1].visible=1;
            this.staff=new Array(this.staffNum);
            for(let i=0;i<this.staffNum;i++){
                this.staff[i]=new glGif(this.wataten5);
            }
            this.staff[0].position=[0.0,this.scoreY+1.0,0.0];
            this.staff[1].position=[0.0,this.scoreY+0.0,0.0];
        }
        get isloaded(){
            return this.loaded>=this.noteNum+2?1:0;
        }
        getNotePosition(posName,location=0,x=0,z=0){
            //     "he":"E2":[0.0,-0.10,0.0],
            //     "to":"C4":[0.0, 0.90,0.0],
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
            if(location==0)location=Note.getNum(posName)<60?"he":"to";
            if(location=="to"){
                return [x,1.2+(t+o*7-34)*0.05,z];
            }else if(location=="he"){
                return [x,0.8+(t+o*7-34)*0.05,z];
            }else{
                return [0,0,0];
            }
        }
        setChord(chord,base=0,x=0){
            //let n=chord.keys.length;
            //if(n>0&&this.queueAddF)console.log(chord.keys,Note.getPitchName(chord.keys))
            //let i=0;
            //暫定
            if(this.queueAddF)this.queue.push(chord);
            //if(this.queue.length>this.noteNum-2)this.queueAddF=0;//this.queue.shift()

            // this.note[0].root=chord.node;
            // this.note[0].check();
            this.play();
            // if(base){
            //     this.note[n].visible=1;
            //     this.setNotePosition(n,Note.getPitchName(chord.node[n-1])[0]+"2","he",x);
            // }
            let chorda={
                keys:[],
                duration:null,//この形にすること
            }
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
        setkey(n){
            if(isString(n)){
                this.key=Note.getNum(n)%12;
            }else{
                this.key=n%12;
            }
        }

        setInput(chord){
            
            if(chord.keys=="skip"){
                if(this.queue.length>0){
                    this.note[this.noteNum-1].root=this.queue[0].keys;
                    this.queue.shift();
                }
            }
            else{
                this.note[this.noteNum-1].root=chord.keys;
                //console.log(chord);
            }
            this.note[this.noteNum-1].xPos=-1.90;
            this.note[this.noteNum-1].location=0;
            this.note[this.noteNum-1].check();

            if(this.queue.length>0){
                console.log(/*this.note[this.noteNum-1],*/this.queue[0])
                //console.log(Note.getPitchName(this.note[this.noteNum-1].root),Note.getPitchName(this.queue[0].keys))            
                
                if(diffArray(this.note[this.noteNum-1].root,this.queue[0].keys)){
                    this.queue.shift();
                    this.queueAddF=1;
                }
            }
        }

        setNotesToQueue(track1,track2){
            this.queue=track1;
        }

        MIDItoScore(MIDIData,track1=1,track2=-1){
            let toNotes=MIDIData.getNoteArray(track1);
            let heNotes=0;
            if(track2!=-1)heNotes=MIDIData.getNoteArray(track2);
            this.setNotesToQueue(toNotes,heNotes);
            //this.timeunit=MIDIData.header.timeunit;
            //console.log(this.timeunit);
            this.play();
        }

        play(){
            for(let i=0;i<this.noteNum-1;i++){
                if(i<this.queue.length){
                    this.note[i].visible=1;
                    this.note[i].root=this.queue[i].keys;
                    this.note[i].location=this.queue[i].locations;

                    this.note[i].xPos=(this.queue[i].tick-this.tick*10)/this.timeunit+this.xPos//i/3.25-this.xPos;
                    //console.log(this.note[i].xPosition);
                    if(this.note[i].xPosition<this.xPos)this.note[i].xPos=this.xPos;
                    this.note[i].check();
                }else{
                    this.note[i].visible=0;
                    this.note[i].root=[-1];
                    this.note[i].check();
                };
            }
        }

        draw(vpMatrix){
            this.staff[0].draw();
            this.staff[1].draw();

            this.to.updateTexture();
            this.to.draw();
            this.he.updateTexture();
            this.he.draw();

            this.note[0].note[0].symbol.updateTexture();
            for(let x of this.note){
                x.drawNoteSymbol();
            }
            
            this.note[0].note[0].sharp.updateTexture();
            for(let x of this.note){
                x.drawNoteSharp();
            }

            for(let x of this.note){
                x.drawAlt();
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
    //gl.activeTexture(gl.TEXTURE1);
    //gl.activeTexture(gl.TEXTURE2);
    
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
    
    var drop=document.getElementById("drop");
    var MIDINameField=document.getElementById("MIDIName");
    drop.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        showDropping();
    });

    drop.addEventListener('dragleave', function(event) {
            hideDropping();
    });
        function hideDropping() {
            drop.classList.remove('dropover');
    }   
    function showDropping() {
        drop.classList.add('dropover');
    }
    let midiObject;
    drop.addEventListener("drop",(e)=>{
        e.preventDefault();
        let file=e.dataTransfer.files[0];
        let reader = new FileReader();
        console.log(file.name);
        MIDINameField.innerText=file.name;
        reader.readAsArrayBuffer(file);
        reader.onload = function() {   
                //読み込んだ結果を型付配列に
                var ar = new Uint8Array(reader.result);
                midiObject=new Midiparcer(ar);
        }
    })

    var MIDIGo=document.getElementById("MIDIGo");
    MIDIGo.addEventListener("click",(e)=>{
        score.MIDItoScore(midiObject,document.getElementById("trackNum1").value,document.getElementById("trackNum2").value);
        score.play();
        document.activeElement.blur();
    });

    // その他の初期化
    let bgred=255,bggreen=255,bgblue=255;
    gl.clearColor(1.0*bgred/255, 1.0*bggreen/255, 1.0*bgblue/255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    mx = 0.5; my = 0.5;
    startTime = new Date().getTime();

    let bgsetting=document.getElementById("bgsetting");
    bgsetting.addEventListener("input",()=>{
        bgred=document.getElementById("bgr").value;
        bggreen=document.getElementById("bgg").value;
        bgblue=document.getElementById("bgb").value;
        gl.clearColor(1.0*bgred/255, 1.0*bggreen/255, 1.0*bgblue/255, 1.0);
        document.body.style.backgroundColor = "rgba("+bgred+","+bggreen+","+bgblue+",1)";
    },false)
    //input function
    let key=new Array(256).fill(0);
    let inputKeyToScale={
        32:"skip",
        90:"C4",
        83:"C#4",
        88:"D4",
        68:"D#4",
        67:"E4",
        86:"F4",
        71:"F#4",
        66:"G4",
        72:"G#4",
        78:"A4",
        74:"A#4",
        77:"B4",
        188:"C5",
        76:"C#5",
        190:"D5",
        187:"D#5",
        191:"E5",
        226:"F5",
    }

    //Midi keybord Setup
    let midiKeybord;
    //通信成功時
    function success(midiAccess){
        midiKeybord = midiAccess;
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
        score.setInput({keys:keyInputqueue});
        score.play();
        //console.log(str);
    }
    navigator.requestMIDIAccess({sysex:false}).then(success, failure);
    
    c.addEventListener("click",()=>{
        score.setChord(Note.randDirtonicChord(48,1),1,0.6);
    })
    window.addEventListener('keydown', (e)=>{
        key[e.keyCode]++;
        if(e.keyCode==32){
            score.setInput({keys:"skip"});
            score.play();
            return false;
        }else if(key[e.keyCode]==1){
            if(e.keyCode in inputKeyToScale)
                keyInputqueue.push(inputKeyToScale[e.keyCode]);
            //score.setChord({node:keyInputqueue});
            score.setInput({keys:keyInputqueue});
            
            score.play();
        }
    }, false);
    window.addEventListener('keyup', (e)=>{
        key[e.keyCode]=0;
        keyInputqueue=keyInputqueue.filter(x=>x!=inputKeyToScale[e.keyCode]);
        //score.setChord({node:keyInputqueue});
        score.setInput({keys:keyInputqueue})
        score.play();
    }, false);

    fps=1000;
    count=0;
    console.log("unit size="+gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
    score.tick=0;
    loading();
    function loading(){
        if(score.isloaded)render();
        else setTimeout(loading,1000/fps);
    }
    function render(){
        // フラグチェックなど
        if(!run)return 0;
        //gl.clearColor(1.0*bgred/255, 1.0*bggreen/255, 1.0*bgblue/255, 1.0);
        
        // 時間管理
        time = (new Date().getTime() - startTime) * 0.001;
        // カラーバッファをクリア
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        score.draw(vpMatrix);
        if(score.queue.length<15)score.setChord(Note.randDirtonicChord(60-12,3));
        gl.flush();
        // 再帰

        score.tick++;
        score.play();
        count++;
        setTimeout(render,1000/fps);
    }
});

/* 縦線をついかすること
 * なめらかにうごかすこと
 *
 *
 * 
 * 
 * 
 * 
*/