
1. Thư viện cần cài đặt:
```bash
$ pip install -r requirements.txt
```
2. Chạy chương trình:
```bash
$ python app.py
```

3. Các file trong project:
- static: chứa các file tĩnh như .css, .js và dùng để lưu file người dùng upload lên hoặc kết quả ghi ra file của chương trình
    + beautiful.css: file css của project
    + control.js: file xử lý sự kiện kéo thả và sự kiện khi người dùng click "Execute" data_flow
    + các file js khác chứa các hàm chức năng cho các box kéo thả
- templates: chứa file giao diện. VD: data_flow.html: trang thực hiện kéo thả
- utils.py: file chứa các hàm tiện ích (vd: đọc ghi file)
- app.py: xử lý phía backend sử dụng thư viện Flask

4. Chú ý:
- Muốn import ra file excel, cần tạo file trước (cả trong trường hợp lựa chọn ghi đè hay không ghi đè)

## Đóng góp các chức năng
1. Mai Văn Hòa - 20173122
- multicast:	Flat File --> Database + Flat File (1 - n)
- sort  : 	Flat File --> Database
- aggerate: 	Flat File / Database --> Flat File
- union all: 	Flat File + Database --> Database 
- derived column: Flat File / Database --> Flat File 
- merge join: Flat File + Database --> Flat File

2. Kiều Minh Hiếu - 20173111
- conditional split: Flat File --> Flat File
- derived column: Flat File --> Flat File
- export: 	Database --> Flat File 

3. Nguyễn Văn Hiểu - 20173120
- import:	Flat File --> Database / Flat File (1 - 1) 
- merge join: 	Flat File + Database --> Flat File
- multicast:	Flat File --> Database + Flat File (1 - n)