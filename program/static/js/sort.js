import {editor} from './control.js';



// Các hàm chức năng của Sort---------------------------------------------------------------------------------------------------------
    function getColumnCheckedAndDisplay_sort(e){
    	
    	// khi checked được click, một hàng sẽ được thêm, khi bỏ checked sẽ bị xóa
    	if(e.srcElement.checked == true){
    		var num_row_current = e.path[8].querySelectorAll('tbody tr').length;

    		var row_append = `<tr id='${e.srcElement.value}'>
                	  <td>${e.srcElement.value}</td>
                	  <td>
                	  	<select>
                            <option value="ignore">&lt;ignore&gt;</option>
						    <option value="ascending">ascending</option>
						    <option value="descending">descending</option>
						  </select>
                	  </td>
                	  <td>${num_row_current+1}</td>
                	  </tr>`;
            // e.path[8].querySelector('tbody').innerHTML += row_append;

            var element_body_table = e.path[8].querySelector('tbody');

            // chèn thêm hàng vào cuối bảng
            var new_row = element_body_table.insertRow(element_body_table.rows.length);
            new_row.id = e.srcElement.value;
            new_row.innerHTML = row_append;


    	}else{
    		// xóa và sắp xếp lại thứ tự thực hiện sort
    		var element_need_remove = e.path[8].querySelector(`tr[id=${e.srcElement.value}]`);
    		var rows = e.path[8].querySelectorAll('tbody tr');
    		var index_remove = Array.from(rows).indexOf(element_need_remove);
    		for(var i in rows){
    			if(i>index_remove){
    				rows[i].querySelector('td:nth-child(3)').innerHTML = i;
    			}
    		}

    		e.path[8].querySelector(`tr[id=${e.srcElement.value}]`).remove();
    	}
    	

    }


export {getColumnCheckedAndDisplay_sort};