import {editor} from './control.js';


// các hàm chức năng của Database Source
function displayPreview_database_source(e, idBox){

		  console.log(e);

		  var preview_element = e.path[8].querySelector('#Preview');
	
		  var element = document.querySelector(`div[class="box dbclickbox"][id="${idBox}"]`);
          var db_username = element.querySelector('#database_username').value;
          var db_password = element.querySelector('#database_password').value;
          var db_ip = element.querySelector('#database_ip').value;
          var db_name = element.querySelector('#database_name').value;
          var table_name = element.querySelector('#table_name').value;

          var infor_DB = {
            db_username: db_username,
            db_password: db_password,
            db_ip: db_ip,
            db_name: db_name,
            table_name: table_name
          }

          console.log(infor_DB);
    
          $.ajax({
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data : JSON.stringify({'data': infor_DB}),
            type : 'POST',
            url : '/get_data_database_source',
            async: false, // thực thi đồng bộ, chờ dữ liệu từ flask rồi mới thực hiện tiếp
          })
          .done(function(data) { // dữ liệu ajax nhận được từ '/get_data_database_source'
             
              var table = `<table id='table' class='table'>
                              <thead>
                                  <tr style="text-align: center;">
                                    <th></th>`

              for (var key in data[0]){
                      table += '<th>' + key + '</th>'
                  }

              table += `</tr>
                      </thead>

                      <tbody>`;

              data.forEach(function(row, index){
                table += `<tr>
                          <td>${index}</td>`
                for(var key in row){
                    table += `<td> ${row[key]}</td>`
                }
                          
                table += `</tr>`
              })

              table +=      `</tbody>
                        </table>`


              preview_element.innerHTML = table;

          });
	

}


function getColumnCheckedAndDisplay_database_source(e){

	// khi checked được click, một hàng sẽ được thêm, khi bỏ checked sẽ bị xóa
	if(e.srcElement.checked == true){

		var row_append = `<tr id='${e.srcElement.value}'>
				  <td><input type='text' value=${e.srcElement.value}></td>
            	  <td>${e.srcElement.value}</td>
            	  
            	  </tr>`;
        

        var element_body_table = e.path[8].querySelector('div.table_aggerate tbody');

		// chèn thêm hàng vào cuối bảng
		var new_row = element_body_table.insertRow(element_body_table.rows.length);
		// phái set id cho hàng mởi ở đây, không hard code được
		new_row.id = e.srcElement.value;
		new_row.innerHTML = row_append;

	}else{
		e.path[8].querySelector(`tr[id=${e.srcElement.value}]`).remove();
	}

}


export {displayPreview_database_source, getColumnCheckedAndDisplay_database_source};