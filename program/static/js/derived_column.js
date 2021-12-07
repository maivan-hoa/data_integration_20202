import {getOutputHeaderDatabase, getOutputHeaderFlatFileSource, getOutputHeaderDatabaseSource} from './get_output_header.js'
import {editor} from './control.js';


// Các hàm chức năng của box Derived Column

	function getHeaderInputAndDisplay_derived_column(e){
		console.log(e);

		// lấy tên các cột đầu ra của box connect tới derived column 
		var id_box_current = editor.getNodesFromName('derived_column')[0];
		var id_box_connect = parseInt(editor.getNodeFromId(id_box_current).inputs.input_1.connections[0].node);
		var name_box_connect =  editor.getNodeFromId(id_box_connect).name;


		// lấy header của các box connect với box database destination tương ứng
		if(name_box_connect == 'flat_file_source'){
			var name_header_connect = getOutputHeaderFlatFileSource(id_box_connect);
		}
		else if(name_box_connect == 'database_source'){
			var name_header_connect = getOutputHeaderDatabaseSource(id_box_connect);
		}


		// Hiển thị các tên các cột trong nguồn
		var element_input_column = e.path[8].querySelector('div[id="input_header_derived"]').querySelector('tbody');
		
		var row_available_input_column = ``;
		for(var head of name_header_connect){
			row_available_input_column += `<tr><td><p>${head}</p></td></tr>`;
		}
		element_input_column.innerHTML = row_available_input_column;

		
	}

	function addExpression_derived_column(e){

		// lấy tên các cột đầu ra của box connect tới derived column 
		var id_box_current = editor.getNodesFromName('derived_column')[0];
		var id_box_connect = parseInt(editor.getNodeFromId(id_box_current).inputs.input_1.connections[0].node);
		var name_box_connect =  editor.getNodeFromId(id_box_connect).name;


		// lấy header của các box connect với box database destination tương ứng
		if(name_box_connect == 'flat_file_source'){
			var name_header_connect = getOutputHeaderFlatFileSource(id_box_connect);
		}
		else if(name_box_connect == 'database_source'){
			var name_header_connect = getOutputHeaderDatabaseSource(id_box_connect);
		}

		// Hiển thị một hàng mới
		var new_row_content = `<tr>
					<td><input name="name_column" type="text"></td>
					<td>
                	  	<select>
                	  		<option value="addnew">&lt;add as new column&gt;</option>`;

		for(var head of name_header_connect){
			new_row_content += `<option value="${head}">Replace "${head}"</option>`;
		}

		new_row_content += `</select></td><td><input name="express_dc" type="text"></td></tr>`;

		var element_body_table = e.path[1].querySelector('table[id="table_derive_column"]').querySelector('tbody');
		console.log(element_body_table);

		// chèn thêm hàng vào cuối bảng
		var new_row = element_body_table.insertRow(element_body_table.rows.length);
		new_row.innerHTML = new_row_content;
		// element_body_table.innerHTML += new_row;

	}


	export {getHeaderInputAndDisplay_derived_column, addExpression_derived_column};