import {flatFileSource, databaseSource, databaseDestination, flatFileDestination, aggerate, dataConversion, sort, unionAll, multicast, derivedColumn, mergeJoin, conditionalSplit} from './box.js';
import {matchingInDatabaseDestination} from './database_destination.js';
import {createCheckHeader} from './get_output_header.js';
import {getHeaderInputAndDisplay_union_all} from './union_all.js';
import {getColumnCheckedAndDisplay_sort} from './sort.js';
import {getColumnCheckedAndDisplay_data_conversion} from './data_conversion.js';
import {getColumnCheckedAndDisplay_aggerate} from './aggerate.js';
import {displayPreview_database_source, getColumnCheckedAndDisplay_database_source} from './database_source.js';
import {getHeaderInputAndDisplay_derived_column, addExpression_derived_column} from './derived_column.js';
import {createCheckMergeJoin, getColumnCheckedAndDisplay_merge_join} from './merge_join.js';
import {getColumnCheckedAndDisplay_ConditionalSplit} from './conditional_split.js'


// CHÚ Ý: tất cả các hàm js viết trực tiếp vào thẻ html phải được khai báo lại là biến toàn cục (window)
window.matchingInDatabaseDestination = matchingInDatabaseDestination;
window.createCheckHeader = createCheckHeader;
window.getHeaderInputAndDisplay_union_all = getHeaderInputAndDisplay_union_all;
window.getColumnCheckedAndDisplay_sort = getColumnCheckedAndDisplay_sort;
window.getColumnCheckedAndDisplay_data_conversion = getColumnCheckedAndDisplay_data_conversion;
window.getColumnCheckedAndDisplay_aggerate = getColumnCheckedAndDisplay_aggerate;
window.displayPreview_database_source = displayPreview_database_source;
window.getHeaderInputAndDisplay_derived_column = getHeaderInputAndDisplay_derived_column;
window.addExpression_derived_column = addExpression_derived_column;
window.createCheckMergeJoin = createCheckMergeJoin;
window.getColumnCheckedAndDisplay_merge_join = getColumnCheckedAndDisplay_merge_join;
window.getColumnCheckedAndDisplay_database_source = getColumnCheckedAndDisplay_database_source;
window.getColumnCheckedAndDisplay_ConditionalSplit = getColumnCheckedAndDisplay_ConditionalSplit;



// XỬ LÝ KHI NGƯỜI DÙNG CLICK EXECUTE DATAFLOW

$(document).ready(function() {
 	

	$('form').on('submit', function(event) {
		// mảng lưu thông tin các box trong flow, sau đó gửi đến app xử lý
		var data_send = [];

		// lấy ra tất cả các box trong data flow
		var tagBoxs = document.querySelectorAll(".drawflow-node");

		var nameBoxs = [];
		tagBoxs.forEach(function(item){
			nameBoxs.push(item.querySelector(".title-box").innerText);
		});

		// lấy ra tên các box
		nameBoxs = nameBoxs.map(function(name){
			return name.trim().toLowerCase().replaceAll(' ', '_');
		});

		// lấy id của các box
		var idBoxs = [];
		tagBoxs.forEach(function(item){
			idBoxs.push(parseInt(item.querySelector(".box.dbclickbox").id));
		});



		// lấy thông tin trong các box và lưu vào mảng data_send
		for(var index in nameBoxs){

			if(nameBoxs[index] == 'flat_file_source'){
				var fileName = tagBoxs[index].getElementsByTagName('input')[0].value.split('\\').pop();
        
        // var fileName = tagBoxs[index].querySelector('span#val_flat_file_source').innerText;
				var id = idBoxs[index];
				data_send.push(new flatFileSource('flat_file_source', id, fileName));
				continue;
			}

      if(nameBoxs[index] == 'database_source'){
        var id = idBoxs[index];
        var db_username = tagBoxs[index].querySelector('#database_username').value;
        var db_password = tagBoxs[index].querySelector('#database_password').value;
        var db_ip = tagBoxs[index].querySelector('#database_ip').value;
        var db_name = tagBoxs[index].querySelector('#database_name').value;
        var table_name = tagBoxs[index].querySelector('#table_name').value;

        var columns = {};
        var rows = tagBoxs[index].querySelector('div.table_aggerate tbody').querySelectorAll('tr');
        for(var row of rows){
          var external_column = row.querySelector('td:nth-child(1) input').value;
          var output_column = row.querySelector('td:nth-child(2)').innerText;
        
          columns[output_column] = external_column;
        }

  
        console.log(columns);

        data_send.push(new databaseSource('database_source', id, db_username, db_password, db_ip, db_name, table_name, columns));
        continue;
      }

			if(nameBoxs[index] == 'database_destination'){
				var id = idBoxs[index];
				var db_username = tagBoxs[index].querySelector('#database_username').value;
				var db_password = tagBoxs[index].querySelector('#database_password').value;
				var db_ip = tagBoxs[index].querySelector('#database_ip').value;
				var db_name = tagBoxs[index].querySelector('#database_name').value;
				var table_name = tagBoxs[index].querySelector('#table_name').value;

				var matching = {};
				var rows = tagBoxs[index].querySelectorAll('table[id="table_matching"] tbody tr');
				for(var row of rows){
					var input_name = row.querySelector('td:nth-child(1) select').value;
					if(input_name != 'ignore'){
						var output_match = row.querySelector('td:nth-child(2) p').innerText;
						matching[input_name] = output_match;
					}
				}
	
				console.log(matching);

				data_send.push(new databaseDestination('database_destination', id, db_username, db_password, db_ip, db_name, table_name, matching));
				continue;
			}
			
			if(nameBoxs[index] == 'aggerate'){
				var agg = [];
				var rows = tagBoxs[index].querySelector('tbody').querySelectorAll('tr');
				for(var row of rows){
					var input_column = row.querySelector('td:nth-child(1)').innerText;
					var output_alias = row.querySelector('td:nth-child(2) input').value;
					var operation = row.querySelector('td:nth-child(3) select').value;
					agg.push({"input_column": input_column, 'output_alias': output_alias, 'operation': operation});
				}

				var id = idBoxs[index];
				data_send.push(new aggerate('aggerate', id, agg));
				continue;
			}

			if(nameBoxs[index] == 'flat_file_destination'){
				// var fileName = tagBoxs[index].getElementsByTagName('input')[0].value.split('\\').pop();
        var fileName = tagBoxs[index].getElementsByTagName('input')[0].value;
				var id = idBoxs[index];
				var delimited = tagBoxs[index].querySelector('select[id="delimited"]').value;
				var overwrite = tagBoxs[index].querySelector('input[type="checkbox"]').checked;
				data_send.push(new flatFileDestination('flat_file_destination', id, fileName, delimited, overwrite));
				continue;
			}

			if(nameBoxs[index] == 'data_conversion'){
				var conversion = [];
				var rows = tagBoxs[index].querySelector('tbody').querySelectorAll('tr');
				for(var row of rows){
					var input_column = row.querySelector('td:nth-child(1)').innerText;
					var output_alias = row.querySelector('td:nth-child(2) input').value;
					var data_type = row.querySelector('td:nth-child(3) select').value;
					var length = row.querySelector('td:nth-child(4) input').value;
					conversion.push({"input_column": input_column, 'output_alias': output_alias, 'data_type': data_type, 'length': length});
				}


				var id = idBoxs[index];

				data_send.push(new dataConversion('data_conversion', id, conversion));
				continue;
			}

			if(nameBoxs[index] == 'sort'){
				var sort_arr = []; // lưu tên các cột và kiểu sắp xếp
				var rows = tagBoxs[index].querySelector('tbody').querySelectorAll('tr');
				for(var row of rows){
					var input_column = row.querySelector('td:nth-child(1)').innerText;
					var sort_type = row.querySelector('td:nth-child(2) select').value;
					sort_arr.push({"input_column": input_column, 'sort_type': sort_type});
				}

				var remove_duplicate = tagBoxs[index].querySelector('input[type="checkbox"]').checked;
				var id = idBoxs[index];
				data_send.push(new sort('sort', id, remove_duplicate, sort_arr));
				continue;
			}

			if(nameBoxs[index] == 'union_all'){
				var union = [];

				var id_box_current = editor.getNodesFromName('union_all')[0];
				var box_connects = editor.getNodeFromId(id_box_current).inputs.input_1.connections;
				var id_box_connects = [];
				for(var box of box_connects){
					id_box_connects.push(parseInt(box.node));
				}

				var num_col = tagBoxs[index].querySelector('thead tr').querySelectorAll('th').length;
				var rows = tagBoxs[index].querySelector('tbody').querySelectorAll('tr');

				console.log(id_box_connects);
				for(var row of rows){
					var object = {}; // lưu output_row: tên cột output, id_box_connect: tên cột trong box
					object.output_column = row.querySelector('td:nth-child(1) input').value;

					for(var i = 0; i < id_box_connects.length; i++){
						object[id_box_connects[i]] = row.querySelector(`td:nth-child(${i+2}) select`).value; 
					}

					union.push(object);
				}


				var id = idBoxs[index];
				data_send.push(new unionAll('union_all', id, union));
				continue;
			}

      if(nameBoxs[index] == 'multicast'){
        var id = idBoxs[index];
        data_send.push(new multicast('multicast', id));
        continue;
      }

      if(nameBoxs[index] == 'derived_column'){
        var id = idBoxs[index];
        var derived = []; // mảng lưu trữ các object: output_column, replace, express
        var columns = []; // mảng lưu trữ tên các cột cần ghi ra file của nguồn đầu vào

        var rows = tagBoxs[index].querySelector('div[id="input_header_derived"] tbody').querySelectorAll('tr');
        for(var row of rows){
          var c = row.querySelector('td:nth-child(1) p').innerText;
          columns.push(c);
        }



        var rows = tagBoxs[index].querySelector('table[id="table_derive_column"] tbody').querySelectorAll('tr');
        for(var row of rows){
          var output_column = row.querySelector('td:nth-child(1) input').value;
          var replace = row.querySelector('td:nth-child(2) select').value;
          var express = row.querySelector('td:nth-child(3) input').value;
          
          derived.push({"output_column": output_column, 'replace': replace, 'express': express});
        }


        data_send.push(new derivedColumn('derived_column', id, columns, derived));
        continue;
      }


      if(nameBoxs[index] == 'merge_join'){
        // merge với join key, với mỗi bảng chỉ lấy một số cột lưu trong name_table và input_column
        var id = idBoxs[index];
        var merge = []; // mảng lưu trữ các object: name_table, input_column, output_alias
        var id_box_table_1 = []; // tên id của box chứa file trong bảng 1 và 2
        var id_box_table_2 = [];
        var join_key_table_1 = {}; // join key của bảng 1 và 2. key: thứ tự, value: tên cột
        var join_key_table_2 = {};


        // var join_type = tagBoxs[index].querySelector('select[id="join_type"]').value;

        // các hàng của bảng 1
        var table_1_rows = tagBoxs[index].querySelector('table[id="table_1"] tbody').querySelectorAll('tr');
        id_box_table_1 = tagBoxs[index].querySelector('table[id="table_1"]').getAttribute('id_of_box_connect');

        for(var row of table_1_rows){
          var join_key= row.querySelector('td:nth-child(4) input');
          if(join_key.checked == true){
              var order = row.querySelector('td:nth-child(3) input').value;
              var key = row.querySelector('td:nth-child(2)').innerText
              join_key_table_1[order] = key;
          }

        }


        // các hàng của bảng 2
        var table_2_rows = tagBoxs[index].querySelector('table[id="table_2"] tbody').querySelectorAll('tr');
        id_box_table_2 = tagBoxs[index].querySelector('table[id="table_2"]').getAttribute('id_of_box_connect');

        for(var row of table_2_rows){

          var join_key= row.querySelector('td:nth-child(4) input');
          if(join_key.checked == true){
              var order = row.querySelector('td:nth-child(3) input').value;
              var key = row.querySelector('td:nth-child(2)').innerText
              join_key_table_2[order] = key;
          }

        }

        // các hàng của bảng merge
        var rows = tagBoxs[index].querySelector('table[id="table_merge"] tbody').querySelectorAll('tr');
        for(var row of rows){
          var name_table = row.querySelector('td:nth-child(1)').innerText;
          var input_column = row.querySelector('td:nth-child(2)').innerText;
          var output_alias = row.querySelector('td:nth-child(3) input').value;
          merge.push({"name_table": name_table, "input_column": input_column, 'output_alias': output_alias});
        }


        data_send.push(new mergeJoin('merge_join', id, id_box_table_1, id_box_table_2, join_key_table_1, join_key_table_2, merge));
        continue;
      }


      if(nameBoxs[index] == 'conditional_split'){
        var conditional_split_arr = []; // lưu tên các cột và kiểu sắp xếp
        var rows = tagBoxs[index].querySelector('tbody').querySelectorAll('tr');
        for(var row of rows){
          var input_column = row.querySelector('td:nth-child(2)').innerText;
          var condition = row.querySelector('td:nth-child(3) select').value;
          var value = row.querySelector('td:nth-child(4) input').value;

          conditional_split_arr.push({"input_column": input_column, 'condition': condition, "value": value});
        }

        var id = idBoxs[index];
        data_send.push(new conditionalSplit('conditional_split', id, conditional_split_arr));
        continue;
      }







		}


		console.log(data_send);


		$.post(
			'/', 
			{data: JSON.stringify(data_send)},
			function(err, req, res){
				console.log(res.responseText);
				confirm(res.responseText);
				//window.location.href = '/ex';
			}
		);

		event.preventDefault();

	});



	

});





//-----------------------------------------------------------------------------------------------------------------------
// XỬ LÝ CÁC SỰ KIỆN KÉO THẢ
    
    var id = document.getElementById("drawflow");
    const editor = new Drawflow(id);
    editor.reroute = true;
    
    editor.start();

    var index_box = 1; // Tạo id cho các box được sinh ra để các box cùng chức năng nhưng vẫn khác nhau

    /* DRAG EVENT */

    /* Mouse and Touch Actions */

    

    var mobile_item_selec = '';
    var mobile_last_move = null;

   window.positionMobile = function(ev) {
     mobile_last_move = ev;
   }

   window.allowDrop = function(ev) {
      ev.preventDefault();
    }

    window.drag = function(ev) {
      if (ev.type === "touchstart") {
        mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
      } else {
      ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
      }
    }

    window.drop = function(ev) {
      if (ev.type === "touchend") {
        var parentdrawflow = document.elementFromPoint( mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflow");
        if(parentdrawflow != null) {
          addNodeToDrawFlow(mobile_item_selec, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
        }
        mobile_item_selec = '';
      } else {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("node");
        addNodeToDrawFlow(data, ev.clientX, ev.clientY);
      }

    }

    var elements = document.getElementsByClassName('drag-drawflow');
    for (var i = 0; i < elements.length; i++) {
      elements[i].addEventListener('touchend', drop, false);
      elements[i].addEventListener('touchmove', positionMobile, false);
      elements[i].addEventListener('touchstart', drag, false );
    }



    var transform = '';
  window.showpopup = function(e) {
    e.target.closest(".drawflow-node").style.zIndex = "9999";
    e.target.children[0].style.display = "block";
    //document.getElementById("modalfix").style.display = "block";

    //e.target.children[0].style.transform = 'translate('+translate.x+'px, '+translate.y+'px)';
    transform = editor.precanvas.style.transform;
    editor.precanvas.style.transform = '';
    editor.precanvas.style.left = editor.canvas_x +'px';
    editor.precanvas.style.top = editor.canvas_y +'px';
    console.log(transform);

    //e.target.children[0].style.top  =  -editor.canvas_y - editor.container.offsetTop +'px';
    //e.target.children[0].style.left  =  -editor.canvas_x  - editor.container.offsetLeft +'px';
    editor.editor_mode = "fixed";


// -----------------------------------------------------------------------------------
    // Get the element  with id="defaultOpen" and click on it
    // e.currentTarget là tag gọi đến hàm showpopup()
    //console.log(e.currentTarget);
    var button_tag_default = e.currentTarget.querySelector("#defaultOpen");

    if(button_tag_default){
    	button_tag_default.click();
    }


    // lấy file từ input tag của event hiện tại và hiển thị lên tab Preview của event đó
    var input_element = e.currentTarget.querySelector('input[type="file"]');
    var preview_element = e.currentTarget.querySelector('#Preview');
    console.log(preview_element);


    // $('#button_flat_file_source').click(function(){
    //      $("input[type='file']").trigger('click');
    //      input_element.value = "";
    // })

    // $("input[type='file']").change(function(){
    //      $('#val_flat_file_source').text(this.value.replace(/C:\\fakepath\\/i, ''))
    // })   

    
    // $("input[type='file']").click(function(){
    //     if(input_element){
    //       input_element.value = "";
    //     }
    // }) 

    if(input_element){
      input_element.onclick = function(){
        input_element.value = "";
      }
    }


    // preview với flat file source
    if(input_element && preview_element){

    	input_element.onchange =  function(e){

        console.log('input file source');
        var formData = new FormData();
        var flat_file_source = input_element.files[0];
        formData.append('flat_file_source', flat_file_source);


        $.ajax({
          contentType: false,
          data : formData,
          type : 'POST',
          url : '/get_flat_file_source',
          cache: false,
          processData: false
        })
        .done(function(data) { // dữ liệu ajax nhận được từ '/get_flat_file_source'
            console.log(typeof JSON.parse(data));
            
            var data = JSON.parse(data)
            console.log(data[0])
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


            //$('#Preview').html(table);
            preview_element.innerHTML = table;

          

         });


      };


    }



  }


  // hàm xử lý khi mở tab trong double click
  	window.openTab = function(evt, tabName) {

      // Declare all variables
      var i, tabcontent, tablinks;
      var parent = evt.target.parentElement.parentElement;
      // console.log(parent);

      // Get all elements with class="tabcontent" and hide them
      tabcontent = parent.getElementsByClassName("tabContent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      // Get all elements with class="tablinks" and remove the class "active"
      tablinks = parent.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      // Show the current tab, and add an "active" class to the link that opened the tab
      parent.querySelector(`#${tabName}`).style.display = "block";
      evt.currentTarget.className += " active"; // evt.currentTarget: tag hiện tại gọi đến hàm openTab

    }

    


   window.closemodal = function(e) {
     e.target.closest(".drawflow-node").style.zIndex = "2";
     e.target.parentElement.parentElement.style.display  ="none";
     //document.getElementById("modalfix").style.display = "none";
     editor.precanvas.style.transform = transform;
       editor.precanvas.style.left = '0px';
       editor.precanvas.style.top = '0px';
      editor.editor_mode = "edit";
   }

    window.changeModule = function(event) {
      var all = document.querySelectorAll(".menu ul li");
        for (var i = 0; i < all.length; i++) {
          all[i].classList.remove('selected');
        }
      event.target.classList.add('selected');
    }

    window.changeMode = function(option) {

    //console.log(lock.id);
      if(option == 'lock') {
        lock.style.display = 'none';
        unlock.style.display = 'block';
      } else {
        lock.style.display = 'block';
        unlock.style.display = 'none';
      }

    }




    function addNodeToDrawFlow(name, pos_x, pos_y) {
      if(editor.editor_mode === 'fixed') {
        return false;
      }
      pos_x = pos_x * ( editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * ( editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
      pos_y = pos_y * ( editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * ( editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));


      switch (name) {

        case 'flat_file_source':
          console.log(index_box);
          var flat_file_source = `
            <div>
            <div class="title-box"><i class="fas fa-file-alt"></i> Flat File Source</div>
              <div class="box dbclickbox" ondblclick="showpopup(event)" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">
                    <span class="close" onclick="closemodal(event)">&times;</span>

                    <div class="tabvertical">
                      <button type='button' class="tablinks" onclick="openTab(event, 'Choose')" id="defaultOpen">Choose file</button>
                      <button type='button' class="tablinks" onclick="openTab(event, 'Preview')">Preview data</button>
                    </div>


                    <div id="Choose" class="tabContent">
                      <h3>Choose file source</h3>
                      <input type="file" name="flat_file_source">
                    </div>

                    <div id="Preview" class="tabContent">
                      
                    </div>

                    
                    
                  </div>

                </div>
              </div>
            </div>
            `;
            editor.addNode('flat_file_source', 0, 1, pos_x, pos_y, 'flat_file_source', { name: ''}, flat_file_source);
            index_box++;
            break;

        case 'database_source':
          var database_source = `
            <div>
            <div class="title-box"><i class="fas fa-server"></i> Database Source</div>
              <div class="box dbclickbox" ondblclick="showpopup(event)" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">

                    <span class="close" onclick="closemodal(event)">&times;</span>

                    <div class="tabvertical">
                      <button type='button' class="tablinks" onclick="openTab(event, 'Database')" id="defaultOpen">Database</button>
                      <button type='button' class="tablinks" onclick="openTab(event, 'Preview');displayPreview_database_source(event, ${index_box});">Preview data</button>
                      <button type='button' class="tablinks" onclick="openTab(event, 'Column');createCheckHeader(event, 'database_source');">Column</button>
                    </div>

                    <div id="Database" class="tabContent database_source_info">
                    
                      <p>Chọn cơ sở dữ liệu</p>
                        <select class="form-select">
                          <option selected>Open this select menu</option>
                          <option value="MySQL">MySQL</option>
                          <option value="SQL">SQL</option>
                        </select>


                      <div class="mb-3">
                          <label for="database_username" class="form-label">Database username</label>
                          <input type="text" class="form-control" id="database_username" name="db_username">
                      </div>


                      <div class="mb-3">
                          <label for="database_password" class="form-label">Database password</label>
                          <input type="text" class="form-control" id="database_password" name="db_password">
                      </div>


                      <div class="mb-3">
                          <label for="database_ip" class="form-label">Database ip</label>
                          <input type="text" class="form-control" id="database_ip" name="db_ip">
                      </div>


                      <div class="mb-3">
                          <label for="database_name" class="form-label">Database name</label>
                          <input type="text" class="form-control" id="database_name" name="db_name">
                      </div>


                      <div class="mb-3">
                          <label for="table_name" class="form-label">Table name</label>
                          <input type="text" class="form-control" id="table_name" name="table_name">
                      </div>


                    </div>

                    <div id="Preview" class="tabContent">

                      
                    </div>


                    <div id="Column" class="tabContent">

                      <div class="checkbox" id="database_source">
                  

                      </div>

                      <div class="table_aggerate">

                        <table class='table'>
                            <thead>
                                <tr style="text-align: center;">
                                  <th>External Column</th>
                                  <th>Output Column</th>
                                </tr>
                            </thead>

                            <tbody>
                            </tbody>
                        </table>


                      </div>



                    </div>

                </div>
              </div>
            </div>
              
            `;
            editor.addNode('database_source', 0, 1, pos_x, pos_y, 'database_source', { name: ''}, database_source);
            index_box++;
            break;


        case 'database_destination':
          var database_destination = `
            <div>
            <div class="title-box"><i class="fas fa-database"></i> Database Destination</div>
              <div class="box dbclickbox" ondblclick="showpopup(event)" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">

                    <span class="close" onclick="closemodal(event)">&times;</span>

                    <div class="tabvertical">
                      <button type='button' class="tablinks" onclick="openTab(event, 'Database')" id="defaultOpen">Database</button>
                      <button type='button' class="tablinks" onclick="openTab(event, 'Matching');matchingInDatabaseDestination(event);">Matching</button>
                      
                    </div>

                    <div id="Database" class="tabContent">
                    
                      <p>Chọn cơ sở dữ liệu</p>
                        <select class="form-select">
                          <option selected>Open this select menu</option>
                          <option value="MySQL">MySQL</option>
                          <option value="SQL">SQL</option>
                        </select>


                      <div class="mb-3">
                          <label for="database_username" class="form-label">Database username</label>
                          <input type="text" class="form-control" id="database_username" name="db_username">
                      </div>


                      <div class="mb-3">
                          <label for="database_password" class="form-label">Database password</label>
                          <input type="text" class="form-control" id="database_password" name="db_password">
                      </div>


                      <div class="mb-3">
                          <label for="database_ip" class="form-label">Database ip</label>
                          <input type="text" class="form-control" id="database_ip" name="db_ip">
                      </div>


                      <div class="mb-3">
                          <label for="database_name" class="form-label">Database name</label>
                          <input type="text" class="form-control" id="database_name" name="db_name">
                      </div>


                      <div class="mb-3">
                          <label for="table_name" class="form-label">Table name</label>
                          <input type="text" class="form-control" id="table_name" name="table_name">
                      </div>


                    </div>

                    <div id="Matching" class="tabContent">

                    	<div id="input_output_matching">

                    		<div id="input_matching">
                    			<table id='input_matching' class="table">
		                            <thead>
		                                <tr style="text-align: center;">
		                                  <th>Available Input Column</th>
		                                </tr>
		                            </thead>

		                            <tbody>

		                            </tbody>
	                        	</table>
                    		</div>


                    		<div id='output_matching'>
                    			<table id='input_matching' class="table">
		                            <thead>
		                                <tr style="text-align: center;">
		                                  <th>Available Destination Column</th>
		                                </tr>
		                            </thead>

		                            <tbody>

		                            </tbody>
	                        	</table>
                    		</div>



                    	</div>


                    	<div id="table_matching">
		                    <table id='table_matching' class="table">
	                            <thead>
	                                <tr style="text-align: center;">
	                                  <th>Input Column</th>
	                                  <th>Destination Column</th>
	                                </tr>
	                            </thead>

	                            <tbody>

	                            </tbody>
	                        </table>
	                    </div>
                      
                    </div>

                    <div id="xyz" class="tabContent">
                      
                    </div>

                    </div>

                </div>
              </div>
            </div>
              
            `;
            editor.addNode('database_destination', 1, 0, pos_x, pos_y, 'database_destination', { name: ''}, database_destination);
            index_box++;
            break;

        case 'multicast':
          console.log(index_box);
          var multicast = `
            <div>
            <div class="title-box"><i class="fas fa-share-alt"></i> Multicast</div>
              <div class="box dbclickbox" ondblclick="showpopup(event)" id="${index_box}">
              </div>
            </div>
            </div>
            `;
            editor.addNode('multicast', 1, 1, pos_x, pos_y, 'multicast', { name: ''}, multicast);
            index_box++;
            break;


        case 'derived_column':
          var derived_column = `
            <div>
            <div class="title-box"><i class="fas fa-calculator"></i> Derived Column</div>
              <div class="box dbclickbox" ondblclick="showpopup(event);getHeaderInputAndDisplay_derived_column(event);" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">

                    <span class="close" onclick="closemodal(event)">&times;</span>


                    <div id="input_header_derived">

                          <table class="table">
                                <thead>
                                    <tr style="text-align: center;">
                                      <th>Available Input Column</th>
                                    </tr>
                                </thead>

                                <tbody>

                                </tbody>
                            </table>
                    

                      </div>

                      <button id="add_express" type="button" onclick="addExpression_derived_column(event);">Add Expression</button>


                      <div id="table_derive_column">
                        <table id='table_derive_column' class="table">
                              <thead>
                                  <tr style="text-align: center;">
                                    <th>Derived Column Name</th>
                                    <th>Derived Column</th>
                                    <th>Expression</th>
                                  </tr>
                              </thead>

                              <tbody>


                              </tbody>
                          </table>
                      </div>



                </div>
              </div>
            </div>
              
            `;
            editor.addNode('derived_column', 1, 1, pos_x, pos_y, 'derived_column', { name: ''}, derived_column);
            index_box++;
            break;


        case 'merge_join':
          var merge_join = `
            <div>
            <div class="title-box"><i class="fas fa-angle-double-right"></i> Merge Join</div>
              <div class="box dbclickbox" ondblclick="showpopup(event);createCheckMergeJoin(event);" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">

                    <span class="close" onclick="closemodal(event)">&times;</span>


                          <div id="checkbox_merge_join">

                                
                                <div id="table_1">
                                  <table id='table_1' class="table">
                                        <thead>
                                            <tr style="text-align: center;">
                                              <th>Table 1</th>
                                              <th>Name</th>
                                              <th>Order</th>
                                              <th>Join key</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                        </tbody>
                                    </table>
                                </div>

                          
                                <div id='table_2'>
                                  <table id='table_2' class="table">
                                        <thead>
                                            <tr style="text-align: center;">
                                              <th>Table 2</th>
                                              <th>Name</th>
                                              <th>Order</th>
                                              <th>Join key</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                        </tbody>
                                    </table>
                                </div>



                      </div>

                      

                    <div class="table_aggerate">

                      <table id='table_merge' class='table'>
                          <thead>
                              <tr style="text-align: center;">
                                <th>Input</th>
                                <th>Input Column</th>
                                <th>Output Alias</th>
                              </tr>
                          </thead>

                          <tbody>
                          </tbody>
                      </table>


                    </div>

                </div>
              </div>
            </div>
              
            `;
            editor.addNode('merge_join', 1, 1, pos_x, pos_y, 'merge_join', { name: ''}, merge_join);
            index_box++;
            break;


        case 'aggerate':
          var aggerate = `
            <div>
            <div class="title-box"><i class="fas fa-plus"></i> Aggerate</div>
              <div class="box dbclickbox" ondblclick="showpopup(event);createCheckHeader(event, 'aggerate');" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">

                    <span class="close" onclick="closemodal(event)">&times;</span>

                    <div class="checkbox">
                    	

          					</div>

          					<div class="table_aggerate">

          						<table id='table' class='table'>
                          <thead>
                              <tr style="text-align: center;">
                                <th>Input Column</th>
                                <th>Output Alias</th>
                                <th>Operation</th>
                              </tr>
                          </thead>

                          <tbody>
                          </tbody>
                      </table>


          					</div>

                </div>
              </div>
            </div>
              
            `;
            editor.addNode('aggerate', 1, 1, pos_x, pos_y, 'aggerate', { name: ''}, aggerate);
            index_box++;
            break;


        case 'sort':
          var sort = `
            <div>
            <div class="title-box"><i class="fas fa-sort"></i> Sort</div>
              <div class="box dbclickbox" ondblclick="showpopup(event);createCheckHeader(event, 'sort');" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">

                    <span class="close" onclick="closemodal(event)">&times;</span>

                    <div class="checkbox">
                    	

          					</div>

          					<input type="checkbox" name="remove_duplicate">
          				  	<label name="checkbox" for="remove_duplicate"> Remove rows with duplicate sort values</label>

          					<div class="table_aggerate">

          						<table id='table' class='table'>
                          <thead>
                              <tr style="text-align: center;">
                                <th>Input Column</th>
                                <th>Sort Type</th>
                                <th>Sort Order</th>
                              </tr>
                          </thead>

                          <tbody>
                          </tbody>
                      </table>


          					</div>

                </div>
              </div>
            </div>
              
            `;
            editor.addNode('sort', 1, 1, pos_x, pos_y, 'sort', { name: ''}, sort);
            index_box++;
            break;


        case 'union_all':
          var union_all = `
            <div>
            <div class="title-box"><i class="fas fa-code-branch"></i> Union All</div>
              <div class="box dbclickbox" ondblclick="showpopup(event);getHeaderInputAndDisplay_union_all(event);" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">

                    <span class="close" onclick="closemodal(event)">&times;</span>

                    
          					<div class="table_aggerate">

          						<table id='table' class='table' style="height: 400px !important;">
                          <thead>
                              <tr style="text-align: center;">
                                

                              </tr>
                          </thead>

                          <tbody>

                          </tbody>
                      </table>


          					</div>

                </div>
              </div>
            </div>
              
            `;
            editor.addNode('union_all', 1, 1, pos_x, pos_y, 'union_all', { name: ''}, union_all);
            index_box++;
            break;


        case 'data_conversion':
          var data_conversion = `
            <div>
            <div class="title-box"><i class="fas fa-exchange-alt"></i> Data Conversion</div>
              <div class="box dbclickbox" ondblclick="showpopup(event);createCheckHeader(event, 'data_conversion');" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">

                    <span class="close" onclick="closemodal(event)">&times;</span>

                    <div class="checkbox">
                    	

          					</div>

          					<div class="table_conversion">

          						<table id='table' class='table'>
                          <thead>
                              <tr style="text-align: center;">
                                <th>Input Column</th>
                                <th>Output Alias</th>
                                <th>Data type</th>
                                <th>Length</th>
                              </tr>
                          </thead>

                          <tbody>
                          </tbody>
                      </table>


          					</div>

                </div>
              </div>
            </div>
              
            `;
            editor.addNode('data_conversion', 1, 1, pos_x, pos_y, 'data_conversion', { name: ''}, data_conversion);
            index_box++;
            break;


        case 'flat_file_destination':
          var flat_file_destination = `
            <div>
            <div class="title-box"><i class="fas fa-file-download"></i></i> Flat File Destination</div>
              <div class="box dbclickbox" ondblclick="showpopup(event)" id="${index_box}">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">
                    <span class="close" onclick="closemodal(event)">&times;</span>

                    <div class="tabvertical">
                      <button type='button' class="tablinks" onclick="openTab(event, 'Choose')" id="defaultOpen">Choose file</button>
                      
                    </div>


                    <div id="Choose" class="tabContent">
                    	<h3>Choose flat file destination</h3>
                      	<input type="text" name="flat_file_destination">

          						<h3>Choose delimited</h3>
          						<select id="delimited">
          						    <option value="\t">tab</option>
          						    <option value=",">comma</option>
          						</select>

          						<br>
          						<br>
          						<input type="checkbox" name="overwrite">
          					  	<label name="checkbox" for="overwrite"> Overwrite data in the file</label>
                    </div>

                    <div id="Matching" class="tabContent">
                      
                    </div>
                    
                    
                  </div>

                </div>
              </div>
            </div>
            `;
            editor.addNode('flat_file_destination', 1, 0, pos_x, pos_y, 'flat_file_destination', { name: ''}, flat_file_destination);
            index_box++;
            break;

            
          case 'conditional_split':
          var conditional_split = `
                <div>
                <div class="title-box"><i class="fas fa-retweet"></i> Conditional Split</div>
                  <div class="box dbclickbox" ondblclick="showpopup(event);createCheckHeader(event, 'conditional_split');" id="${index_box}">
                    Double click here
                    <div class="modal" style="display:none">
                      <div class="modal-content">
      
                        <span class="close" onclick="closemodal(event)">&times;</span>
      
                        <div class="checkbox">
                          
      
              </div>
              <div class="table_aggerate">
      
                <table id='table' class='table'>
                                <thead>
                                    <tr style="text-align: center;">
                                      <th>Order</th>
                                      <th>Input Column</th>
                                      <th>Condition</th>
                                      <th>Value</th>
                                      
                                    </tr>
                                </thead>
      
                                <tbody>
                                </tbody>
                            </table>
                      </div>
                    </div>
                  </div>
                </div>
                  
                `;
          editor.addNode('conditional_split', 1, 1, pos_x, pos_y, 'conditional_split', { name: '' }, conditional_split);
          index_box++;
          break;
    
        
    
        
          case 'dbclick':
            var dbclick = `
            <div>
            <div class="title-box"><i class="fas fa-mouse"></i> Db Click</div>
              <div class="box dbclickbox" ondblclick="showpopup(event)">
                Double click here
                <div class="modal" style="display:none">
                  <div class="modal-content">
                    <span class="close" onclick="closemodal(event)">&times;</span>
                    Change your variable {name} !
                    <input type="text" df-name>
                  </div>

                </div>
              </div>
            </div>
            `;
            editor.addNode('dbclick', 1, 1, pos_x, pos_y, 'dbclick', { name: ''}, dbclick );
            break;

        default:
      }
    }


document.querySelector('.btn-clear').addEventListener('click', function(event){
    editor.clearModuleSelected();
});


document.querySelector('.bar-zoom i:nth-child(1)').addEventListener('click', function(event){
    editor.zoom_out()
});


document.querySelector('.bar-zoom i:nth-child(2)').addEventListener('click', function(event){
    editor.zoom_reset()
});


document.querySelector('.bar-zoom i:nth-child(3)').addEventListener('click', function(event){
    editor.zoom_in()
});



export {editor};














// var box_drag = document.querySelectorAll('.drag-drawflow');
// for(var box of box_drag){
//   	box.addEventListener('dragstart', function(event){
//   		drag(event);
//   	});
// }


// document.querySelector('li.selected').addEventListener('click', function(event){
// 	editor.changeModule('Other'); 
// 	changeModule(event);
// });


// document.querySelector('#drawflow').addEventListener('drop', function(event){
// 	drop(event);
// });


// document.querySelector('#drawflow').addEventListener('dragover', function(event){
// 	allowDrop(event);
// })


// document.querySelector('.box.dbclickbox').addEventListener('dblclick', function(event){
// 	showpopup(event);
// })



