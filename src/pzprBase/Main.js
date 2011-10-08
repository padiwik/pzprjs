// Main.js v3.4.0

//---------------------------------------------------------------------------
// ★Ownerクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// Ownerクラス
pzprv3.createCoreClass('Owner',
{
	initialize : function(){
		this.resizetimer  = null;	// resizeタイマー

		this.pid     = '';			// パズルのID("creek"など)
		this.canvas  = null;
		this.classes = {};

		this.editmode = (pzprv3.EDITOR && !pzprv3.DEBUG);	// 問題配置モード
		this.playmode = !this.editmode;						// 回答モード

		this.debug = null;
	},

	//---------------------------------------------------------------------------
	// owner.reload_func()  個別パズルのファイルを読み込み、初期化する関数
	//---------------------------------------------------------------------------
	reload_func : function(pzl){
		pzprv3.includeCustomFile(pzl.id);

		// 中身を読み取れるまでwait
		var self = this;
		setTimeout(function(){
			if(!pzprv3.ready(pzl.id)){ setTimeout(arguments.callee,10); return;}

			// デバッグ用
			if(!self.debug){
				self.debug = new pzprv3.core.Debug();
				self.debug.owner = self;
			}

			// 初期化ルーチンへジャンプ
			self.initObjects.call(self, pzl);
		},10);
	},

	//---------------------------------------------------------------------------
	// owner.initObjects()    各オブジェクトの生成などの処理
	// owner.initDebug()      デバッグ用オブジェクトを設定する
	// owner.clearObjects()   イベントやメニューの設定を設定前に戻す
	//---------------------------------------------------------------------------
	initObjects : function(pzl){
		this.pid     = pzl.id;
		this.canvas  = ee('divques').unselectable().el;
		this.classes = pzprv3.getPuzzleClass(pzl.id);	// クラスを取得

		// クラス初期化
		bd  = this.newInstance('Board');		// 盤面オブジェクト
		ans = this.newInstance('AnsCheck');		// 正解判定オブジェクト
		pc  = this.newInstance('Graphic');		// 描画系オブジェクト

		this.cursor = this.newInstance('TargetCursor');	// 入力用カーソルオブジェクト
		this.mouse  = this.newInstance('MouseEvent');	// マウス入力オブジェクト
		this.key    = this.newInstance('KeyEvent');		// キーボード入力オブジェクト

		this.undo  = this.newInstance('OperationManager');	// 操作情報管理オブジェクト
		this.ut    = this.newInstance('UndoTimer');		// Undo用Timerオブジェクト
		this.timer = this.newInstance('Timer');			// 一般タイマー用オブジェクト

		enc = this.newInstance('Encode');		// URL入出力用オブジェクト
		fio = this.newInstance('FileIO');		// ファイル入出力用オブジェクト

		menu = this.newInstance('Menu');		// メニューを扱うオブジェクト
		pp = this.newInstance('Properties');	// メニュー関係の設定値を保持するオブジェクト

		// メニュー関係初期化
		menu.menuinit();

		// イベントをくっつける
		this.mouse.setEvents();
		this.key.setEvents();
		this.setEvents();

		// URL・ファイルデータの読み込み
		this.decodeBoardData(pzl);

		// タイマーリセット(最後)
		this.timer.reset();
	},

	clearObjects : function(){
		ee.removeAllEvents();

		menu.menureset();
		ee('numobj_parent').el.innerHTML = '';
		ee.clean();
	},

	//---------------------------------------------------------------------------
	// owner.newInstance()    新しいオブジェクトを生成する
	//---------------------------------------------------------------------------
	newInstance : function(classname, args){
		var self = this;
		function F(){
			this.owner = self;
			return self.classes[classname].apply(this, args);
		}
		F.prototype = this.classes[classname].prototype;
		return new F();
	},

	//---------------------------------------------------------------------------
	// owner.importBoardData() 新しくパズルのファイルを開く時の処理
	// owner.decodeBoardData() URLや複製されたデータを読み出す
	//---------------------------------------------------------------------------
	importBoardData : function(pzl){
		// 今のパズルと別idの時
		if(this.pid != pzl.id){
			this.clearObjects();
			this.reload_func(pzl);
		}
		else{
			this.decodeBoardData(pzl);
		}
	},
	decodeBoardData : function(pzl){
		if(pzprv3.DEBUG && !pzl.qdata){
			pzl.qdata = this.debug.urls[pzl.id];
		}

		pc.suspendAll();
		// ファイルを開く・複製されたデータを開く
		if(!!pzl.fstr){
			fio.filedecode(pzl.fstr);
		}
		// URLからパズルのデータを読み出す
		else if(!!pzl.qdata){
			enc.pzlinput(pzl);
		}
		// 何もないとき
		else{
			bd.initBoardSize(bd.qcols,bd.qrows);
			pc.resize_canvas();
		}
		pc.unsuspend();

		// デバッグのスクリプトチェック時は、ここで発火させる
		if(pzprv3.DEBUG && this.debug.phase===0){ this.debug.sccheck();}
	},

	//---------------------------------------------------------------------------
	// owner.setEvents()       マウス入力、キー入力以外のイベントの設定を行う
	//---------------------------------------------------------------------------
	setEvents : function(){
		// File API＋Drag&Drop APIの設定
		if(!!menu.reader){
			var DDhandler = function(e){
				menu.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			};
			ee.addEvent(window, 'dragover', function(e){ e.preventDefault();}, true);
			ee.addEvent(window, 'drop', DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		ee.addEvent(document, 'blur', ee.ebinder(this, this.onblur_func));

		// onresizeイベントを割り当てる
		ee.addEvent(window, (!ee.os.iPhoneOS ? 'resize' : 'orientationchange'),
										ee.ebinder(this, this.onresize_func));
	},

	//---------------------------------------------------------------------------
	// owner.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// owner.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		this.resizetimer = setTimeout(ee.binder(pc, pc.resize_canvas),250);
	},
	onblur_func : function(){
		this.key.keyreset();
		this.mouse.mousereset();
	}
});

//--------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------
// ★Propertiesクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
pzprv3.createCommonClass('Properties',
{
	initialize : function(){
		this.flags    = [];	// サブメニュー項目の情報(オブジェクトの配列になる)
		this.flaglist = [];	// idnameの配列
	},

	// 定数
	MENU     : 6,
	SPARENT  : 7,
	SPARENT2 : 8,
	SMENU    : 0,
	SELECT   : 1,
	CHECK    : 2,
	LABEL    : 3,
	CHILD    : 4,
	SEPARATE : 5,

	//---------------------------------------------------------------------------
	// pp.reset()      再読み込みを行うときに初期化を行う
	//---------------------------------------------------------------------------
	reset : function(){
		this.flags    = [];
		this.flaglist = [];
	},

	//---------------------------------------------------------------------------
	// pp.addMenu()      メニュー最上位の情報を登録する
	// pp.addSParent()   フロートメニューを開くサブメニュー項目を登録する
	// pp.addSParent2()  フロートメニューを開くサブメニュー項目を登録する
	// pp.addSmenu()     Popupメニューを開くサブメニュー項目を登録する
	// pp.addCaption()   Captionとして使用するサブメニュー項目を登録する
	// pp.addSeparator() セパレータとして使用するサブメニュー項目を登録する
	// pp.addCheck()     選択型サブメニュー項目に表示する文字列を設定する
	// pp.addSelect()    チェック型サブメニュー項目に表示する文字列を設定する
	// pp.addChild()     チェック型サブメニュー項目の子要素を設定する
	// pp.addFlagOnly()  情報のみを登録する
	//---------------------------------------------------------------------------
	addMenu : function(idname, strJP, strEN){
		this.addFlags(idname, '', this.MENU, null, strJP, strEN);
	},
	addSParent : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SPARENT, null, strJP, strEN);
	},
	addSParent2 : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SPARENT2, null, strJP, strEN);
	},

	addSmenu : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SMENU, null, strJP, strEN);
	},

	addCaption : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.LABEL, null, strJP, strEN);
	},
	addSeparator : function(idname, parent){
		this.addFlags(idname, parent, this.SEPARATE, null, '', '');
	},

	addCheck : function(idname, parent, first, strJP, strEN){
		this.addFlags(idname, parent, this.CHECK, first, strJP, strEN);
	},
	addSelect : function(idname, parent, first, child, strJP, strEN){
		this.addFlags(idname, parent, this.SELECT, first, strJP, strEN);
		this.flags[idname].child = child;
	},
	addChild : function(idname, parent, strJP, strEN){
		var list = idname.split("_");
		this.addFlags(idname, list[0], this.CHILD, list[1], strJP, strEN);
	},

	addFlagOnly : function(idname, first){
		this.addFlags(idname, '', '', first, '', '');
	},

	//---------------------------------------------------------------------------
	// pp.addFlags()  上記関数の内部共通処理
	// pp.setLabel()  管理領域に表記するラベル文字列を設定する
	//---------------------------------------------------------------------------
	addFlags : function(idname, parent, type, first, strJP, strEN){
		this.flags[idname] = {
			id     : idname,
			type   : type,
			val    : first,
			parent : parent,
			str : {
				ja : { menu:strJP, label:''},
				en : { menu:strEN, label:''}
			}
		};
		this.flaglist.push(idname);
	},

	setLabel : function(idname, strJP, strEN){
		if(!this.flags[idname]){ return;}
		this.flags[idname].str.ja.label = strJP;
		this.flags[idname].str.en.label = strEN;
	},

	//---------------------------------------------------------------------------
	// pp.getMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を返す
	// pp.getLabel()   管理パネルとチェック型サブメニューに表示する文字列を返す
	// pp.type()       設定値のサブメニュータイプを返す
	// pp.haschild()   サブメニューがあるかどうか調べる
	//
	// pp.getVal()     各フラグのvalの値を返す
	// pp.setVal()     各フラグの設定値を設定する
	// pp.setValOnly() 各フラグの設定値を設定する。設定時に実行される関数は呼ばない
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.flags[idname].str[menu.language].menu; },
	getLabel   : function(idname){ return this.flags[idname].str[menu.language].label;},
	type       : function(idname){ return this.flags[idname].type;},
	haschild   : function(idname){
		var flag = this.flags[idname];
		if(!flag){ return false;}
		var type = flag.type;
		return (type===this.SELECT || type===this.SPARENT || type===this.SPARENT2);
	},

	getVal : function(idname){ return this.flags[idname]?this.flags[idname].val:null;},
	setVal : function(idname, newval, isexecfunc){
		if(!!this.flags[idname] && (this.flags[idname].type===this.CHECK ||
									this.flags[idname].type===this.SELECT))
		{
			this.flags[idname].val = newval;
			menu.setdisplay(idname);
			if(menu.funcs[idname] && isexecfunc!==false){ menu.funcs[idname].call(menu,newval);}
		}
	},
	setValOnly : function(idname, newval){ this.setVal(idname, newval, false);}
});
