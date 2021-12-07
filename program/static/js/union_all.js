import {getOutputHeaderDatabase, getOutputHeaderFlatFileSource, getOutputHeaderSort, getOutputHeaderUnionAll, getOutputHeaderDatabaseSource} from './get_output_header.js'
import {editor} from './control.js';


// Các hàm của Union All
	// lấy header của các file cần union và hiển thị
	function getHeaderInputAndDisplay_union_all(e){
		
		var id_box_current = editor.getNodesFromName('union_all')[0];
		var box_connects = editor.getNodeFromId(id_box_current).inputs.input_1.connections;
		var id_box_connects = [];
		for(var box of box_connects){
			id_box_connects.push(parseInt(box.node));
		}

		var name_box_connects = [];
		for(var id of id_box_connects){
			name_box_connects.push(editor.getNodeFromId(id).name);
		}

		var name_header_connects = [];

		// lấy header của các box connect với box Union All
		for(var i in name_box_connects){
			if(name_box_connects[i] == 'flat_file_source'){
				name_header_connects.push(getOutputHeaderFlatFileSource(id_box_connects[i]));
			}
			else if(name_box_connects[i] == 'database_source'){
				name_header_connects.push(getOutputHeaderDatabaseSource(id_box_connects[i]));
			}
		}


		var index_max_len_header = 0; // lưu chỉ số trong mảng của box của chiều dài header lớn nhất
		var max_len_header = 0;
		for(var i in name_header_connects){
			if(name_header_connects[i].length >= name_header_connects[index_max_len_header].length){
				index_max_len_header = i;
				max_len_header = name_header_connects[i].length;
			}
		}


		var createHeaderTable = `<th>Output Column Name</th>`;
		for(var i in name_header_connects){
			createHeaderTable += `<th>Union All Input ${parseInt(i)+1}</th>`;
		}
		e.path[4].querySelector('thead tr').innerHTML = createHeaderTable;

		// tạo các hàng của bảng
		var createRowTable = ``;
		for(var i = 0; i<max_len_header; i++){
			createRowTable += `<tr><td><input value=${name_header_connects[index_max_len_header][i]}></td>`;

			
			for(var head of name_header_connects){
				var select = `<select>
						   <option value="ignore">&lt;ignore&gt;</option>;`;

				for(var value of head){
					select += `<option value="${value}">${value}</option>`;
				}

				select += '</select>';
				
				createRowTable += `<td>${select}</td>`;
			}

			createRowTable += '</tr>';

		}

		e.path[4].querySelector('tbody').innerHTML = createRowTable;
		

	}


export {getHeaderInputAndDisplay_union_all};