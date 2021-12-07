import {editor} from './control.js';

// Hàm chức năng conditional split
function getColumnCheckedAndDisplay_ConditionalSplit(e){
    	
  // khi checked được click, một hàng sẽ được thêm, khi bỏ checked sẽ bị xóa
  if(e.srcElement.checked == true){
    var num_row_current = e.path[8].querySelectorAll('tbody tr').length;

    var row_append = `<tr id='${e.srcElement.value}'>
                <td>${num_row_current+1}</td>
                <td>${e.srcElement.value}</td>
                <td>
                  <select>
                    <option value="=="> == </option>
                    <option value=">"> > </option>
                    <option value="<"> < </option>
                    <option value=">="> >= </option>
                    <option value="<="> <= </option>
                  </select>
                </td>
                <td><input id='value_cs' type='text' value="" size="10"></td>
                
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
        rows[i].querySelector('td:nth-child(1)').innerHTML = i;
      }
    }

    e.path[8].querySelector(`tr[id=${e.srcElement.value}]`).remove();
  }
}


export {getColumnCheckedAndDisplay_ConditionalSplit};