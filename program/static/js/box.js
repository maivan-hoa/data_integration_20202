import {editor} from './control.js';

// khai báo các Object lưu thông tin các box kéo thả
	function flatFileSource(name, id, fileName){
		this.name=name;
		this.id = id;
		this.fileName = fileName;
		this.idOutConnect = parseInt(editor.getNodeFromId(id).outputs.output_1.connections[0].node);
	}

	function databaseSource(name, id,  db_username, db_password, db_ip, db_name, table_name, columns){
		this.name = name;
		this.db_username = db_username;
		this.db_password =  db_password;
		this.db_ip = db_ip;
		this.db_name = db_name;
		this.table_name = table_name;
		this.id = id;
		this.columns = columns;
		this.idOutConnect = parseInt(editor.getNodeFromId(id).outputs.output_1.connections[0].node);
	}

	function databaseDestination(name, id,  db_username, db_password, db_ip, db_name, table_name, matching){
		this.name = name;
		this.db_username = db_username;
		this.db_password =  db_password;
		this.db_ip = db_ip;
		this.db_name = db_name;
		this.table_name = table_name;
		this.id = id;
		this.matching = matching;
		this.idInConnect = parseInt(editor.getNodeFromId(id).inputs.input_1.connections[0].node);
	}

	function flatFileDestination(name, id, fileName, delimited, overwrite){
		this.name = name;
		this.id = id;
		this.fileName = fileName;
		this.delimited = delimited;
		this.overwrite = overwrite;
	}

	function aggerate(name, id, agg){
		this.name = name;
		this.id = id;
		this.idInConnect = parseInt(editor.getNodeFromId(id).inputs.input_1.connections[0].node);
		this.idOutConnect = parseInt(editor.getNodeFromId(id).outputs.output_1.connections[0].node);
		this.agg = agg; // mảng các object, input_column: tên cột, operation: operation muốn thực hiện với cột, output_alias: tên cột kq muốn xuất
	}

	function dataConversion(name, id, conversion){
		this.name = name;
		this.id = id;
		this.idInConnect = parseInt(editor.getNodeFromId(id).inputs.input_1.connections[0].node);
		this.idOutConnect = parseInt(editor.getNodeFromId(id).outputs.output_1.connections[0].node);
		this.conversion = conversion; // mảng các object, input_column: tên cột, output_alias: tên cột thay thế, data_type: kiểu dl của cột, length: độ dài kdl
	}

	function sort(name, id, remove_duplicate, sort){
		this.name = name;
		this.id = id;
		this.idInConnect = parseInt(editor.getNodeFromId(id).inputs.input_1.connections[0].node);
		this.idOutConnect = parseInt(editor.getNodeFromId(id).outputs.output_1.connections[0].node);
		this.remove_duplicate = remove_duplicate;
		this.sort = sort; //mảng các object, input_column: tên cột, sort_type: kiểu sắp xếp
	}

	function unionAll(name, id, union){
		this.name = name;
		this.id = id;
		this.union = union;
		// this.idOutConnect = parseInt(editor.getNodeFromId(id).outputs.output_1.connections[0].node);
	}

	function multicast(name, id){
		this.name = name;
		this.id = id;
	}

	function derivedColumn(name, id, columns, derived){
		this.name = name;
		this.id = id;
		this.columns = columns;
		this.derived = derived;
	}

	function mergeJoin(name, id, id_box_table_1, id_box_table_2, join_key_table_1, join_key_table_2, merge){
		this.name = name;
		this.id = id;
		// this.join_type = join_type;
		this.id_box_table_1 = id_box_table_1;
		this.id_box_table_2 = id_box_table_2;
		this.join_key_table_1 = join_key_table_1;
		this.join_key_table_2 = join_key_table_2;
		this.merge = merge;
	}

	function conditionalSplit(name, id, conditional_split_arr){
		this.name = name;
		this.id = id;
		this.idInConnect = parseInt(editor.getNodeFromId(id).inputs.input_1.connections[0].node);
		this.idOutConnect = parseInt(editor.getNodeFromId(id).outputs.output_1.connections[0].node);
		this.conditional_split_arr = conditional_split_arr; //mảng các object, input_column: tên cột, sort_type: kiểu sắp xếp
	}


	export {flatFileSource, databaseSource, databaseDestination, flatFileDestination, aggerate, dataConversion, sort, unionAll, multicast, derivedColumn, mergeJoin, conditionalSplit};