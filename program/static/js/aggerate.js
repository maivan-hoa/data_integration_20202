import {editor} from './control.js';


// các hàm chức năng của Aggerate
function getColumnCheckedAndDisplay_aggerate(e){
	
	// khi checked được click, một hàng sẽ được thêm, khi bỏ checked sẽ bị xóa
	if(e.srcElement.checked == true){
		var row_append = `<tr>
            	  <td>${e.srcElement.value}</td>
            	  <td><input type='text' value="${e.srcElement.value}"></td>
            	  <td>
            	  	<select>
					    <option value="groupby">Groupby</option>
					    <option value="sum">Sum</option>
					    <option value="min">Minimum</option>
					    <option value="max">Maximum</option>
					    <option value="average">Average</option>
					    <option value="count">Count</option>
					    <option value="count distinct">Count distinct</option>
					  </select>
            	  </td>
            	  </tr>`;
        // e.path[8].querySelector('tbody').innerHTML += row_append;
        var element_body_table = e.path[8].querySelector('tbody');

		// chèn thêm hàng vào cuối bảng
		var new_row = element_body_table.insertRow(element_body_table.rows.length);
		// phái set id cho hàng mởi ở đây, không hard code được
		new_row.id = e.srcElement.value;
		new_row.innerHTML = row_append;

	}else{
		e.path[8].querySelector(`tr[id="${e.srcElement.value}"]`).remove();
	}
	

}

export {getColumnCheckedAndDisplay_aggerate};