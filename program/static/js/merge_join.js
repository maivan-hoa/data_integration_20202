import {editor} from './control.js';
import {getOutputHeaderDatabaseSource, getOutputHeaderFlatFileSource} from './get_output_header.js';


// Hàm lấy header và tạo bảng checkbox trong merge join
    function createCheckMergeJoin(e){

		var id_box_current = editor.getNodesFromName('merge_join')[0];
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

		// lấy header của các box connect với box Merge Join
		for(var i in name_box_connects){
			if(name_box_connects[i] == 'flat_file_source'){
				name_header_connects.push(getOutputHeaderFlatFileSource(id_box_connects[i]));
			}
			else if(name_box_connects[i] == 'database_source'){
				name_header_connects.push(getOutputHeaderDatabaseSource(id_box_connects[i]));
			}
		}
		


		// tạo các hàng trong hai bảng cần merge
		var createRowTable = [];

		for(var i in name_header_connects){
			var rows = ``;
			for(var header of name_header_connects[i]){
				rows += `<tr><td><input type="checkbox" id="${header}" value="Table_${parseInt(i)+1}" onchange="getColumnCheckedAndDisplay_merge_join(event)"></td>
							 <td>${header}</td>
							 <td><input type="text" style="width: 30px;height: 25px;"></td>
							 <td><input type="checkbox"></td>
						 </tr>`;
			}
			createRowTable.push(rows);
		}

        e.path[4].querySelector('table#table_1 tbody').innerHTML = createRowTable[0];
        e.path[4].querySelector('table#table_1').setAttribute('id_of_box_connect', id_box_connects[0]);

        e.path[4].querySelector('table#table_2 tbody').innerHTML = createRowTable[1];
        e.path[4].querySelector('table#table_2').setAttribute('id_of_box_connect', id_box_connects[1]);

	}



	function getColumnCheckedAndDisplay_merge_join(e){
		console.log(e);
		// khi checked được click, một hàng sẽ được thêm, khi bỏ checked sẽ bị xóa
		if(e.srcElement.checked == true){
			var row_append = `<tr>
	            	  <td>${e.srcElement.value}</td>
	            	  <td>${e.srcElement.id}</td>
	            	  <td><input type='text' value=${e.srcElement.id}></td>
	            	  </tr>`;
	        
	        var element_body_table = e.path[7].querySelector('div.table_aggerate tbody');

			// chèn thêm hàng vào cuối bảng
			var new_row = element_body_table.insertRow(element_body_table.rows.length);
			new_row.id = e.srcElement.id;
			new_row.innerHTML = row_append;
		}else{
			e.path[7].querySelector(`div.table_aggerate tbody tr[id="${e.srcElement.id}"]`).remove();
		}
	}


export {createCheckMergeJoin, getColumnCheckedAndDisplay_merge_join};







