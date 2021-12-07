// import {getColumnCheckedAndDisplay_sort} from './sort.js';
// import {getColumnCheckedAndDisplay_aggerate} from './aggerate.js';
// import {getColumnCheckedAndDisplay_data_conversion} from './data_conversion.js';
import {editor} from './control.js';


	
	// lấy header trong database
	function getOutputHeaderDatabase(idBox){
		
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

		//console.log(infor_DB);
		var name_header;
		$.ajax({
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			data : JSON.stringify({'data': infor_DB}),
			type : 'POST',
			url : '/get_output_header_database',
			async: false, // thực thi đồng bộ, chờ dữ liệu từ flask rồi mới thực hiện tiếp
		})
		.done(function(data) { // dữ liệu ajax nhận được từ '/get_output_header_database'
			name_header = data;
		});

		
		return name_header;

	}

//------------------------------------------------------------------------------------------------
	// Các hàm lấy header output của các box

	function getOutputHeaderFlatFileSource(idBox){
		var box = document.querySelector(`div[class="box dbclickbox"][id="${idBox}"]`);
		var input_element = box.querySelector('input[name="flat_file_source"]');
		console.log(input_element);
		var name_header = [];

		if(input_element){

	        var formData = new FormData();
	        var flat_file_source = input_element.files[0];
	        formData.append('flat_file_source', flat_file_source);


	        $.ajax({
	          contentType: false,
	          data : formData,
	          type : 'POST',
	          url : '/get_flat_file_source?type=getHeader',
	          cache: false,
	          processData: false,
	          async: false,
	        })
	        .done(function(data) { // dữ liệu ajax nhận được từ '/get_flat_file_source'
	            
	            var data = JSON.parse(data);
	   			
	   			for(var key in data[0]){
	   				name_header.push(key);
	   			}

	         });

    	}

    	return name_header;

	}


	function getOutputHeaderSort(idBox){
		var box = document.querySelector(`div[class="box dbclickbox"][id="${idBox}"]`);
		var name_header = [];

		var rows = box.querySelector('tbody').querySelectorAll('tr');
		for(var row of rows){
			name_header.push(row.querySelector('td:nth-child(1)').innerText);
		}
		

    	return name_header;

	}

	function getOutputHeaderUnionAll(idBox){
		var box = document.querySelector(`div[class="box dbclickbox"][id="${idBox}"]`);
		var name_header = [];

		var rows = box.querySelector('tbody').querySelectorAll('tr');
		for(var row of rows){
			name_header.push(row.querySelector('td:nth-child(1) input').value);
		}
		

    	return name_header;

	}

	function getOutputHeaderMulticast(idBox){
		var id_box_current = editor.getNodesFromName('multicast')[0];
		var id_box_connect = parseInt(editor.getNodeFromId(id_box_current).inputs.input_1.connections[0].node);
		
		var name_header = getOutputHeaderFlatFileSource(id_box_connect);
    	return name_header;

	}

	function getOutputHeaderDatabaseSource(idBox){
		var box = document.querySelector(`div[class="box dbclickbox"][id="${idBox}"]`);
		var name_header = [];

		var rows = box.querySelector('div.table_aggerate tbody').querySelectorAll('tr');
		for(var row of rows){
			name_header.push(row.querySelector('td:nth-child(1) input').value);
		}
		

    	return name_header;

	}



// Hàm lấy header và tạo bảng checkbox
    function createCheckHeader(e, nameBox){
		var id_box_current = editor.getNodesFromName(nameBox)[0];
		if(nameBox != 'database_source'){
			// var id_box_flat_file_source = parseInt(editor.getNodeFromId(id_box_current).inputs.input_1.connections[0].node);
			// var name_header = getOutputHeaderFlatFileSource(id_box_flat_file_source);

			var id_box_connect = parseInt(editor.getNodeFromId(id_box_current).inputs.input_1.connections[0].node);
			var name_box_connect =  editor.getNodeFromId(id_box_connect).name;

			if(name_box_connect == 'flat_file_source'){
				var name_header = getOutputHeaderFlatFileSource(id_box_connect);
			}

			if(name_box_connect == 'database_source'){
				var name_header = getOutputHeaderDatabaseSource(id_box_connect);
			}

			
		}else{
			var name_header = getOutputHeaderDatabase(id_box_current);
		}
		

		//setTimeout(handleCreateCheck, 500, e, nameBox, name_header);

		// tạo khung hiển thị để chọn cột cần aggerate
        var createCheck = ``;
        if(nameBox == 'aggerate'){
        	// xóa trống table trước (cần fix bug chỗ này)
        	e.path[8].querySelector('tbody').innerHTML ='';
        	for (var head of name_header){
                createCheck += `
                <input type="checkbox" id="${head}" name="${head}" value="${head}" onchange="getColumnCheckedAndDisplay_aggerate(event)">
			  	<label name="checkbox" for="${head}"> ${head}</label><br>`;
        	}
        }
        else if(nameBox == 'data_conversion'){
        	e.path[8].querySelector('tbody').innerHTML ='';
        	for (var head of name_header){
                createCheck += `
                <input type="checkbox" id="${head}" name="${head}" value="${head}" onchange="getColumnCheckedAndDisplay_data_conversion(event)">
			  	<label name="checkbox" for="${head}"> ${head}</label><br>`;
        	}
        }
        else if(nameBox == 'sort'){
        	e.path[8].querySelector('tbody').innerHTML ='';
        	for (var head of name_header){
                createCheck += `
                <input type="checkbox" id="${head}" name="${head}" value="${head}" onchange="getColumnCheckedAndDisplay_sort(event)">
			  	<label name="checkbox" for="${head}"> ${head}</label><br>`;
        	}
        }
        else if(nameBox == 'database_source'){
        	e.path[8].querySelector('div.table_aggerate tbody').innerHTML ='';
        	for (var head of name_header){
                createCheck += `
                <input type="checkbox" id="${head}" name="${head}" value="${head}" onchange="getColumnCheckedAndDisplay_database_source(event)">
			  	<label name="checkbox" for="${head}"> ${head}</label><br>`;
        	}
        }
        else if(nameBox == 'conditional_split'){
        	e.path[8].querySelector('tbody').innerHTML ='';
        	for (var head of name_header){
                createCheck += `
                <input type="checkbox" id="${head}" name="${head}" value="${head}" onchange="getColumnCheckedAndDisplay_ConditionalSplit(event)">
			  	<label name="checkbox" for="${head}"> ${head}</label><br>`;
        	}
        }

        
        

        e.path[4].querySelector('.checkbox').innerHTML = createCheck;

	}



export {getOutputHeaderDatabase, getOutputHeaderFlatFileSource, getOutputHeaderSort, getOutputHeaderUnionAll, getOutputHeaderMulticast, createCheckHeader, getOutputHeaderDatabaseSource};