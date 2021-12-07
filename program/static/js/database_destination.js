import {editor} from './control.js';
import {getOutputHeaderDatabase, getOutputHeaderFlatFileSource, getOutputHeaderSort, getOutputHeaderUnionAll, getOutputHeaderMulticast} from './get_output_header.js';

// Các hàm chức năng của box Database Destination

// Hàm hiển thị Matching trong Database destination
	function matchingInDatabaseDestination(e){
		console.log(e);

		// lấy tên các cột đầu ra của box connect tới destination 
		var id_box_current = editor.getNodesFromName('database_destination')[0];
		var id_box_connect = parseInt(editor.getNodeFromId(id_box_current).inputs.input_1.connections[0].node);
		var name_box_connect =  editor.getNodeFromId(id_box_connect).name;

		var name_header_db_destination = getOutputHeaderDatabase(id_box_current);

		// lấy header của các box connect với box database destination tương ứng
		if(name_box_connect == 'flat_file_source'){
			var name_header_connect = getOutputHeaderFlatFileSource(id_box_connect);
		}
		else if(name_box_connect == 'sort'){
			var name_header_connect = getOutputHeaderSort(id_box_connect);
		}
		else if(name_box_connect == 'union_all'){
			var name_header_connect = getOutputHeaderUnionAll(id_box_connect);
		}
		else if(name_box_connect == 'multicast'){
			var name_header_connect = getOutputHeaderMulticast(id_box_connect);
		}
		
		console.log(name_header_db_destination);
		console.log(name_header_connect);


		// Hiển thị các tên các cột trong nguồn, đích và bảng matching cột
		var element_input_column = e.path[8].querySelector('div[id="input_matching"]').querySelector('tbody');
		var element_output_column = e.path[8].querySelector('div[id="output_matching"]').querySelector('tbody');
		var element_matching = e.path[8].querySelector('div[id="table_matching"]').querySelector('tbody');

		var row_available_input_column = ``;
		for(var head of name_header_connect){
			row_available_input_column += `<tr><td><p>${head}</p></td></tr>`;
		}
		element_input_column.innerHTML = row_available_input_column;

		var row_available_output_column = ``;
		for(var head of name_header_db_destination){
			row_available_output_column += `<tr><td><p>${head}</p></td></tr>`;
		}
		element_output_column.innerHTML = row_available_output_column;
		
		var select = `<select><option value="ignore">&lt;ignore&gt;</option>`;
		for(var head of name_header_connect){
			select += `<option value="${head}">${head}</option>`;
		}
		select += `</select>`;

		var row_matching = ``;
		for(var head of name_header_db_destination){
			row_matching += `<tr><td>`+select+`</td><td><p>${head}</p></td></tr>`;
		}
		element_matching.innerHTML = row_matching;


		
	}


	export {matchingInDatabaseDestination};