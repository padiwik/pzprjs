// Menu.js v3.4.0
(function(){

/* uiオブジェクト生成待ち */
if(!ui){ setTimeout(setTimeout(arguments.callee),15); return;}

var k = pzprv3.consts;
var _doc = document;
function getEL(id){ return _doc.getElementById(id);}

//---------------------------------------------------------------------------
// ★PopupManagerクラス ポップアップメニューを管理します
//---------------------------------------------------------------------------
ui.createClass('PopupManager',
{
	initialize : function(){
		this.offset = new pzprv3.core.Point(0, 0);	// ポップアップウィンドウの左上からの位置

		this.reset();
	},
	
	puzzle    : null,
	popup     : null, /* 表示中のポップアップメニュー */
	popups    : null, /* 管理しているポップアップメニュー */
	movingpop : null, /* 移動中のポップアップメニュー */
	
	//---------------------------------------------------------------------------
	// popupmgr.init()       ポップアップメニューの設定を初期化する
	// popupmgr.reset()      ポップアップメニューの設定をクリアする
	// popupmgr.setEvents()  ポップアップメニュー(タイトルバー)のイベントを設定する
	//---------------------------------------------------------------------------
	init : function(){
		if(!!this.popups){ return;}
		this.popups = {
			newboard  : (new ui.classes.Popup_Newboard()),	/* 盤面の新規作成 */
			urlinput  : (new ui.classes.Popup_URLInput()),	/* URL入力 */
			urloutput : (new ui.classes.Popup_URLOutput()),	/* URL出力 */
			fileopen  : (new ui.classes.Popup_FileOpen()),	/* ファイル入力 */
			database  : (new ui.classes.Popup_DataBase()),	/* データベースを開く */
			adjust    : (new ui.classes.Popup_Adjust()),	/* 盤面の調整 */
			turnflip  : (new ui.classes.Popup_TurnFlip()),	/* 反転・回転 */
			dispsize  : (new ui.classes.Popup_DispSize()),	/* 表示サイズ */
			credit    : (new ui.classes.Popup_Credit()),	/* credit */
			debug     : (new ui.classes.Popup_Debug())		/* poptest */
		};
	},
	
	reset : function(){
		if(!this.popups){ return;}
		for(var name in this.popups){
			var popup = this.popups[name];
			if(!popup.disable_remove){ popup.remove();}
		}
	},
	
	setEvents : function(){
		for(var name in this.popups){ this.popups[name].setEvent();}
		ui.event.addMouseMoveEvent(_doc, this, this.titlebarmove);
		ui.event.addMouseUpEvent  (_doc, this, this.titlebarup);
	},

	//---------------------------------------------------------------------------
	// popupmgr.open()  ポップアップメニューを開く
	//---------------------------------------------------------------------------
	open : function(idname, px, py){
		if(idname==='poptest'){
			this.popups.debug.show(px, py);
			return true;
		}

		var target = null;
		switch(idname){
			case 'newboard':  target = this.popups.newboard; break;
			case 'urlinput':  target = this.popups.urlinput; break;
			case 'urloutput': target = this.popups.urloutput; break;
			case 'fileopen':  target = this.popups.fileopen; break;
			case 'database':  target = this.popups.database; break;
			case 'adjust':    target = this.popups.adjust; break;
			case 'turn':      target = this.popups.turnflip; break;
			case 'credit':    target = this.popups.credit; break;
			case 'dispsize':  target = this.popups.dispsize; break;
		}
		if(target!==null){
			/* 表示しているウィンドウがある場合は閉じる */
			if(this.popup){ this.popup.hide();}
			
			/* ポップアップメニューを表示する */
			target.show(px, py);
			return true;
		}
		return false;
	},

	//---------------------------------------------------------------------------
	// popupmgr.titlebardown()  タイトルバーをクリックしたときの動作を行う(タイトルバーにbind)
	// popupmgr.titlebarup()    タイトルバーでボタンを離したときの動作を行う(documentにbind)
	// popupmgr.titlebarmove()  タイトルバーからマウスを動かしたときポップアップメニューを動かす(documentにbind)
	//---------------------------------------------------------------------------
	titlebardown : function(e){
		var popel = (e.target||e.srcElement).parentNode;
		var pos = pzprv3.getPagePos(e);
		this.movingpop = popel;
		this.offset.px = pos.px - parseInt(popel.style.left);
		this.offset.py = pos.py - parseInt(popel.style.top);
		ui.event.enableMouse = false;
	},
	titlebarup : function(e){
		var popel = this.movingpop;
		if(!!popel){
			this.movingpop = null;
			ui.event.enableMouse = true;
		}
	},
	titlebarmove : function(e){
		var popel = this.movingpop;
		if(!!popel){
			var pos = pzprv3.getPagePos(e);
			popel.style.left = pos.px - this.offset.px + 'px';
			popel.style.top  = pos.py - this.offset.py + 'px';
			pzprv3.preventDefault(e);
		}
	}
});

//---------------------------------------------------------------------------
// ★PopupMenuクラス ポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.createClass('PopupMenu',
{
	initialize : function(){
		this.popparent = getEL("popup_parent");
		this.reset();
	},
	reset : function(){
		this.pop       = null;
		this.titlebar  = null;
		this.form      = null;
	},
	remove : function(){
		if(!!this.pop){
			this.popparent.removeChild(this.pop);
			this.reset();
		}
	},

	puzzle   : null,
	formname : '',
	disable_remove : false,

	makeElement : function(){
		this.pop = _doc.createElement('div');
		this.pop.className = 'popup';
		this.popparent.appendChild(this.pop);
		
		var bar = _doc.createElement('div');
		bar.className = 'titlebar';
		pzprv3.unselectable(bar);
		this.pop.appendChild(bar);
		this.titlebar = bar;
		
		this.form = _doc.createElement('form');
		this.form.name = this.formname;
		this.pop.appendChild(this.form);
	},
	makeForm : function(){
	},

	setEvent :function(){
		if(!!this.titlebar){
			var mgr = ui.menu.popupmgr;
			ui.event.addMouseDownEvent(this.titlebar, mgr, mgr.titlebardown);
		}
	},

	show : function(px,py){
		if(!this.pop){
			this.makeElement();
			this.makeForm();
			this.setEvent();
		}
		this.pop.style.left = px + 'px';
		this.pop.style.top  = py + 'px';
		this.pop.style.display = 'inline';
		ui.menu.popupmgr.popup = this;
	},
	hide : function(){
		this.pop.style.display = "none";
		ui.menu.popupmgr.popup = null;
		
		ui.event.enableKey = true;
		ui.event.enableMouse = true;
	},

	settitle : function(str_jp, str_en){
		this.titlebar.appendChild(_doc.createTextNode(ui.menu.selectStr(str_jp, str_en)));
	},

	addText : function(str_jp, str_en){
		var el = _doc.createElement('span');
		el.appendChild(_doc.createTextNode(ui.menu.selectStr(str_jp, str_en)));
		this.form.appendChild(el);
	},
	addBR : function(){
		this.form.appendChild(_doc.createElement('br'));
	},
	addInput : function(type, attr){
		var el = _doc.createElement('input');
		el.type = type;
		for(var att in attr){ el[att]=attr[att];}
		this.form.appendChild(el);
	},
	addTextArea : function(attr){
		var el = _doc.createElement('textarea');
		for(var att in attr){ el[att]=attr[att];}
		this.form.appendChild(el);
	},
	addElement : function(el){
		this.form.appendChild(el);
	},

	addExecButton : function(str_jp, str_en, func, attr){
		el = _doc.createElement('input');
		el.type = 'button';
		el.value = ui.menu.selectStr(str_jp, str_en);
		if(!!attr){ for(var att in attr){ el[att]=attr[att];}}
		el.onclick = func;
		this.form.appendChild(el);
	},
	addCancelButton : function(){
		var popup = this;
		this.addExecButton("キャンセル", "Cancel", function(){ popup.hide();})
	}
});

//---------------------------------------------------------------------------
// ★Popup_NewBoardクラス 新規盤面作成のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.createClass('Popup_Newboard:PopupMenu',
{
	formname : 'newboard',
	
	//---------------------------------------------------------------------------
	// makeForm()          新規盤面作成のポップアップメニューを作成する
	// makeForm_tawa_lap() たわむれんがの形状入力用部
	//---------------------------------------------------------------------------
	makeForm : function(){
		var puzzle = ui.puzzle, bd = puzzle.board, pid = puzzle.pid;
		this.settitle("盤面の新規作成", "Createing New Board");
		
		this.addText("盤面を新規作成します。", "Create New Board.");
		this.addBR();
		
		/* タテヨコのサイズ指定部分 */
		var col = bd.qcols, row = bd.qrows;
		if(pid==='tawa' && bd.lap===3){ col++;}
		
		if(pid!=='sudoku'){
			var attr = {name:'col', value:''+col, size:'4', maxlength:'3', min:'1', max:'999'};
			if(pid!=='tawa'){
				this.addText("よこ", "Cols");
				this.addInput('number', attr);
			}
			else{
				this.addInput('number', attr);
				this.addText("横幅 (黄色の数)", "Width (Yellows)");
			}
			this.addBR();
			
			attr.name='row'; attr.value=''+row;
			if(pid!=='tawa'){
				this.addText("たて", "Rows");
				this.addInput('number', attr);
			}
			else{
				this.addInput('number', attr);
				this.addText("高さ", "Height");
			}
			this.addBR();
		}
		else{
			var sizelist = [4,9,16,25], idx=1;
			if    (col!==row){ idx=1;}
			else if(col===16){ idx=2;}
			else if(col===25){ idx=3;}
			else if(col=== 4){ idx=0;}
			
			for(var i=0;i<4;i++){
				var size = sizelist[i], text = ""+size+"x"+size;
				this.addInput('radio', {name:'size', value:''+size, checked:((idx===i)?'checked':'')});
				this.addText(text, text);
				this.addBR();
			}
		}
		
		/* たわむレンガの形状指定ルーチン */
		if(pid==='tawa'){
			this.makeForm_tawa_lap();
		}
		
		/* 新規作成 or Cancel */
		var popup = this;
		this.addExecButton("新規作成", "Create", function(){ popup.execute();});
		this.addCancelButton();
	},
	makeForm_tawa_lap : function(form){
		var table = new ui.classes.TableElement();
		table.init({id:'NB_lap', border:'0', cellPadding:'0', cellSpacing:'2'},{marginTop:'4pt', marginBottom:'4pt'});
		table.initRow({},{paddingBottom:'2px'});
		
		/* cw=32, margin=2, width&height=cw+(margin*2)=36 */
		ui.menu.modifyCSS({'#NB_lap div':{display:'block', position:'relative', width:'36px', height:'36px'}});
		ui.menu.modifyCSS({'#NB_lap img':{position:'absolute', margin:'2px'}});
		
		var clicklap = function(e){
			e = (e||window.event);
			var _div = (e.target||e.srcElement).parentNode;
			var idx = _div.id.charAt(2);
			for(var i=0;i<=3;i++){ pzprv3.getEL("nb"+i).style.backgroundColor = '';}
			_div.style.backgroundColor = 'red';
		};
		
		var idx = [0,2,3,1][ui.puzzle.board.lap];
		for(var i=0;i<=3;i++){
			var _img = _doc.createElement('img');
			_img.src = "src/img/tawa_nb.gif";
			_img.style.left = "-"+(i*32)+"px";
			_img.style.clip = "rect(0px,"+((i+1)*32)+"px,"+32+"px,"+(i*32)+"px)";
			_img.onclick = clicklap;
			
			var _div = _doc.createElement('div');
			_div.id = "nb"+i;
			_div.style.backgroundColor = (i==idx?'red':'');
			_div.appendChild(_img);
			
			table.addCell(_div);
		}
		
		this.addElement(table.getElement());
	},
	
	show : function(px,py){
		ui.classes.PopupMenu.prototype.show.call(this,px,py);
		ui.event.enableKey = false;
	},
	//---------------------------------------------------------------------------
	// execute() 新規盤面を作成するボタンを押したときの処理を行う
	//---------------------------------------------------------------------------
	execute : function(){
		var pid = ui.puzzle.pid;
		var col, row, url=[], NB=this.form;
		
		if(pid!=='sudoku'){
			col = (parseInt(NB.col.value))|0;
			row = (parseInt(NB.row.value))|0;
		}
		else{
			if     (NB.size[2].checked){ col=row=16;}
			else if(NB.size[3].checked){ col=row=25;}
			else if(NB.size[0].checked){ col=row= 4;}
			else                       { col=row= 9;}
		}
		if(!!col && !!row){ url = [col, row];}
		
		if(url.length>0 && pid==='tawa'){
			var slap=null;
			for(var i=0;i<=3;i++){
				if(pzprv3.getEL("nb"+i).style.backgroundColor==='red'){ slap=[0,3,1,2][i]; break;}
			}
			if(!isNaN(slap) && !(col==1 && (slap==0||slap==3))){
				if(slap===3){ col--; url=[col,row];}
				url.push(slap);
			}
			else{ url=[];}
		}
		
		this.hide();
		if(url.length>0){
			ui.puzzle.openByURL("?"+pid+"/"+url.join('/'));
			ui.waitReady();
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLInputクラス URL入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.createClass('Popup_URLInput:PopupMenu',
{
	formname : 'urlinput',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("URL入力", "Import from URL");
		
		this.addText("URLから問題を読み込みます。", "Import a question from URL.");
		this.addBR();
		
		this.addTextArea({name:"ta", cols:'48', rows:'8', wrap:'hard'});
		this.addBR();
		
		var popup = this;
		this.addExecButton("読み込む", "Import", function(){ popup.urlinput();});
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// urlinput() URLを入力する
	//------------------------------------------------------------------------------
	urlinput : function(){
		this.hide();
		
		ui.puzzle.openByURL(this.form.ta.value);
		ui.waitReady();
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLOutputクラス URL出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.createClass('Popup_URLOutput:PopupMenu',
{
	formname : 'urloutput',
	
	//------------------------------------------------------------------------------
	// makeForm() URL出力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		var popup = this;
		var outputurl = function(e){ popup.urloutput(e||window.event);};
		var openurl   = function(e){ popup.openurl();};
		
		this.settitle("URL出力", "Export URL");
		
		var pid = ui.puzzle.pid, exists = pzprv3.PZLINFO.info[pid].exists;
			{ this.addExecButton("ぱずぷれv3のURLを出力する", "Output PUZ-PRE v3 URL", outputurl, {name:'pzprv3'}); this.addBR();}
		if(exists.pzprapp)
			{ this.addExecButton("ぱずぷれ(アプレット)のURLを出力する", "Output PUZ-PRE(JavaApplet) URL", outputurl, {name:'pzprapplet'}); this.addBR();}
		if(exists.kanpen)
			{ this.addExecButton("カンペンのURLを出力する", "Output Kanpen URL", outputurl, {name:'kanpen'}); this.addBR();}
		if(pid==="heyawake")
			{ this.addExecButton("へやわけアプレットのURLを出力する", "Output Heyawake-Applet URL", outputurl, {name:'heyaapp'}); this.addBR();}
			{ this.addExecButton("ぱずぷれv3の再編集用URLを出力する", "Output PUZ-PRE v3 Re-Edit URL", outputurl, {name:'pzprv3edit'}); this.addBR();}
		this.addBR();
		
		this.addTextArea({name:"ta", cols:'48', rows:'8', wrap:'hard', value:'', readonly:'readonly'});
		this.addBR();
		
		this.addExecButton("このURLを開く", "Open this URL on another window/tab", openurl);
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// urloutput() URLを出力する
	// openurl()   「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urloutput : function(e){
		var enc = ui.puzzle.enc;
		switch((e.target||e.srcElement).name){
			case "pzprv3":     this.form.ta.value = enc.pzloutput(k.PZPRV3);  break;
			case "pzprapplet": this.form.ta.value = enc.pzloutput(k.PZPRAPP); break;
			case "kanpen":     this.form.ta.value = enc.pzloutput(k.KANPEN);  break;
			case "pzprv3edit": this.form.ta.value = enc.pzloutput(k.PZPRV3E); break;
			case "heyaapp":    this.form.ta.value = enc.pzloutput(k.HEYAAPP); break;
		}
	},
	openurl : function(e){
		if(this.form.ta.value!==''){
			var win = window.open(this.form.ta.value, '', '');
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileOpenクラス ファイル入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.createClass('Popup_FileOpen:PopupMenu',
{
	formname : 'fileform',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("ファイルを開く", "Open file");
		
		this.form.action = 'fileio.cgi';
		this.form.method = 'post';
		this.form.target = "fileiopanel";
		this.form.enctype = 'multipart/form-data';
		this.form.onsubmit = function(e){ pzprv3.preventDefault(e||window.event); return false;};
		
		this.addText("ファイル選択", "Choose file");
		this.addBR();
		
		this.addInput('file', {name:"filebox", id:"filebox"});
		this.addInput('hidden', {name:"pencilbox", value:"0"});
		this.addInput('hidden', {name:"operation", value:"open"});
		this.addBR();
		
		var popup = this;
		this.form.filebox.onchange = function(e){ popup.fileopen(e||window.event);};
		
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// fileopen()  ファイルを開く
	//------------------------------------------------------------------------------
	fileopen : function(e){
		var fileEL = this.form.filebox;
		if(!!ui.menu.reader || ui.menu.enableGetText){
			var fitem = fileEL.files[0];
			if(!fitem){ return;}
			
			if(!!ui.menu.reader){ ui.menu.reader.readAsText(fitem);}
			else                { ui.menu.fileonload(fitem.getAsText(''));}
		}
		else{
			if(!fileEL.value){ return;}
			this.form.action = ui.menu.fileio;
			this.form.submit();
		}
		this.form.reset();
	}
});

//---------------------------------------------------------------------------
// ★Popup_Adjustクラス 盤面の調整のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.createClass('Popup_Adjust:PopupMenu',
{
	formname : 'adjust',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("盤面の調整", "Board Dimension Resizer");
		
		this.addText("盤面の調整を行います。", "Adjust the board.");
		this.addBR();
		
		var popup = this, adjust = function(e){ popup.adjust(e||window.event);};
		
		this.addText("拡大", "Expand");
		this.addExecButton("上", "Top", adjust, {name:'expandup'});
		this.addExecButton("下", "Bottom", adjust, {name:'expanddn'});
		this.addText(" ", " ");
		this.addExecButton("左", "Left", adjust, {name:'expandlt'});
		this.addExecButton("右", "right", adjust, {name:'expandrt'});
		this.addBR();
		
		this.addText("縮小", "Reduce");
		this.addExecButton("上", "Top", adjust, {name:'reduceup'});
		this.addExecButton("下", "Bottom", adjust, {name:'reducedn'});
		this.addText(" ", " ");
		this.addExecButton("左", "Left", adjust, {name:'reducelt'});
		this.addExecButton("右", "right", adjust, {name:'reducert'});
		this.addBR();
		
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// adjust() 盤面の調整を行う
	//------------------------------------------------------------------------------
	adjust : function(e){
		ui.puzzle.board.execadjust((e.target||e.srcElement).name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_TurnFlipクラス 回転・反転のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.createClass('Popup_TurnFlip:PopupMenu',
{
	formname : 'turnflip',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("反転・回転", "Flip/Turn the board");
		
		this.addText("盤面の回転・反転を行います。","Flip/Turn the board.");
		this.addBR();
		
		var popup = this, adjust = function(e){ popup.adjust(e||window.event);};
		
		this.addExecButton("左90°回転", "Turn left by 90 degree", adjust, {name:'turnl'});
		this.addExecButton("右90°回転", "Turn right by 90 degree", adjust, {name:'turnr'});
		this.addBR();
		this.addExecButton("上下反転", "Flip upside down", adjust, {name:'flipy'});
		this.addExecButton("左右反転", "Flip leftside right", adjust, {name:'flipx'});
		this.addBR();
		this.addBR();
		
		if(ui.puzzle.pid==='tawa'){
			this.form.turnl.disabled = true;
			this.form.turnr.disabled = true;
		}
		
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// adjust() 盤面の調整を行う
	//------------------------------------------------------------------------------
	adjust : function(e){
		ui.puzzle.board.execadjust((e.target||e.srcElement).name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_DispSizeクラス 回転・反転のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.createClass('Popup_DispSize:PopupMenu',
{
	formname : 'dispsize',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("表示サイズの変更", "Change size");
		
		this.addText("表示サイズを変更します。", "Change the display size.");
		this.addBR();
		
		this.addText("表示サイズ", "Display size");
		this.addInput('number', {name:'cs', value:'', size:'4', maxlength:'3', min:'8', max:'999'});
		this.addBR();
		
		var popup = this;
		this.addExecButton("変更する", "Change", function(){ popup.changesize();});
		this.addCancelButton();
	},
	
	show : function(px,py){
		ui.classes.PopupMenu.prototype.show.call(this,px,py);
		
		this.form.cs.value = ui.puzzle.painter.cellsize;
		ui.event.enableKey = false;
	},
	
	//------------------------------------------------------------------------------
	// changesize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	changesize : function(e){
		var pc = ui.puzzle.painter;
		var csize = parseInt(this.form.cs.value);
		if(csize>0){
			pc.cellsize = (csize|0);
			ui.event.setcellsize();
		}
		
		this.hide();
		pc.forceRedraw();	// Canvasを更新する
	}
});

//---------------------------------------------------------------------------
// ★Popup_Creditクラス Creditやバージョン情報を表示します
//---------------------------------------------------------------------------
ui.createClass('Popup_Credit:PopupMenu',
{
	formname : 'credit',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("credit", "credit");
		
		this.addText("ぱずぷれv3 "+pzprv3.version, "PUZ-PRE v3 "+pzprv3.version);
		this.addBR();
		this.addBR();
		
		this.addText("ぱずぷれv3は はっぱ/連続発破が作成しています。", "PUZ-PRE v3 id made by happa.");
		this.addBR();
		
		var popup = this;
		this.addExecButton("閉じる", "Close", function(){ popup.hide();});
	}
});

//---------------------------------------------------------------------------
// ★TableElementクラス テーブル作成用のクラスです
//---------------------------------------------------------------------------
ui.createClass('TableElement',
{
	table : null,
	tbody : null,
	trow  : null,

	init : function(attr, style){
		this.table = _doc.createElement('table');
		if(!!attr) { for(var att in attr){ this.table[att]=attr[att];}}
		if(!!style){ for(var name in style){ this.table.style[name]=style[name];}}
		
		this.tbody = _doc.createElement('tbody');
		this.table.appendChild(this.tbody);
	},
	
	initRow : function(attr, style){
		this.trow = _doc.createElement('tr');
		if(!!attr) { for(var att in attr){ this.trow[att]=attr[att];}}
		if(!!style){ for(var name in style){ this.trow.style[name]=style[name];}}
		
		this.tbody.appendChild(this.trow);
	},
	
	addCell : function(el){
		var tcell = _doc.createElement('td');
		tcell.appendChild(el);
		this.trow.appendChild(tcell);
	},
	
	getElement : function(){
		return this.table;
	}
});

})();