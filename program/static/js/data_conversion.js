import {editor} from './control.js';

//Các hàm chức năng của Data Conversion

// hàm khi checked được click, một hàng sẽ được thêm, khi bỏ checked sẽ bị xóa cho chức năng Data Conversion
function getColumnCheckedAndDisplay_data_conversion(e){
	
	// khi checked được click, một hàng sẽ được thêm, khi bỏ checked sẽ bị xóa
	if(e.srcElement.checked == true){
		var row_append = `<tr id='${e.srcElement.value}'>
            	  <td>${e.srcElement.value}</td>
            	  <td><input type='text' value=${e.srcElement.value} name='output_alias'></td>
            	  <td>
            	  	<select>
					    <option value="VARCHAR">varchar</option>
					    <option value="CHAR">char</option>
					    <option value="INT">int</option>
					    <option value="BOOLEAN">boolean</option>
					    <option value="DATETIME">datetime</option>
					  </select>
            	  </td>
            	  <td><input type='text' value='255' name='length'></td>
            	  </tr>`;
        e.path[8].querySelector('tbody').innerHTML += row_append;
	}else{
		e.path[8].querySelector(`tr[id=${e.srcElement.value}]`).remove();
	}
	

}


export {getColumnCheckedAndDisplay_data_conversion};