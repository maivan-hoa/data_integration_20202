# -*- coding: utf-8 -*-
"""
Created on Fri Apr 16 21:12:15 2021

@author: HoaMV
"""

import flask
from flask import Flask, request, render_template, redirect, url_for, jsonify
import pandas as pd
import sqlalchemy
import os
import json
import utils
import glob

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = 'static'
json_data = []

# Lưu vào MySQL
def import_to_MySQL(inforBox):
    # inforBox[0]: nguồn, inforBox[1]: database destination
    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            file_name = inforBox[i]['fileName']
            df = utils.read_file('static/storage/source/'+file_name)
        else:
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            matching = inforBox[i]['matching']
            print(matching)
            print(type(matching))
            column_match = [key for key in matching]

    df = df[column_match]
    df.rename(columns=matching, inplace=True)

    engine = sqlalchemy.create_engine('mysql+mysqlconnector://{0}:{1}@{2}/{3}'.
                                          format(database_username, database_password, 
                                                database_ip, database_name))

    utils.insert_to_MySQL(df, engine, table_name)
    engine.dispose()

def import_to_flatFile(inforBox):
    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            file_name = inforBox[i]['fileName']
            df = utils.read_file('static/storage/source/'+file_name)
            
        else:
            file_name_destination = inforBox[i]['fileName']
            delimited = inforBox[i]['delimited']
            overwrite = inforBox[i]['overwrite']

    utils.write_file(df, 'static/storage/destination/'+file_name_destination, index=False, sep=delimited, overwrite=overwrite)


# Xuất bảng trong MySQL ra file
def export_to_flatFile(inforBox):
    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_destination':
            file_name_destination = inforBox[i]['fileName']
            delimited = inforBox[i]['delimited']
            overwrite = inforBox[i]['overwrite']
        else:
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            columns = inforBox[i]['columns']

    engine = sqlalchemy.create_engine('mysql+mysqlconnector://{0}:{1}@{2}/{3}'.
                                          format(database_username, database_password, 
                                                database_ip, database_name))

    df = utils.read_table_MySQL(table_name, engine)
    engine.dispose()

    column_get = [key for key in columns]
    df = df[column_get]
    df.rename(columns=columns, inplace=True)
    utils.write_file(df, 'static/storage/destination/'+file_name_destination, index=False, sep=delimited, overwrite=overwrite)

# import từ Flat File tới nhiều đầu ra 
def multicast(inforBox):
    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            file_name = inforBox[i]['fileName']
            df = utils.read_file('static/storage/source/'+file_name)

        elif inforBox[i]['name'] == 'flat_file_destination':
            file_name_destination = inforBox[i]['fileName']
            delimited = inforBox[i]['delimited']
            overwrite = inforBox[i]['overwrite']
            print('adjf')
            utils.write_file(df, 'static/storage/destination/'+file_name_destination, index=False, sep=delimited, overwrite=overwrite)
            
        elif inforBox[i]['name'] == 'database_destination':
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            matching = inforBox[i]['matching']
            print(matching)
            print(type(matching))
            column_match = [key for key in matching]

            df_save = df[column_match]
            df_save.rename(columns=matching, inplace=True)

            engine = sqlalchemy.create_engine('mysql+mysqlconnector://{0}:{1}@{2}/{3}'.
                                                  format(database_username, database_password, 
                                                        database_ip, database_name))

            utils.insert_to_MySQL(df_save, engine, table_name)
            engine.dispose()



# Thực hiện tính toán và lưu kết quả Aggerate ra flat file
def save_aggerate_to_flat_file(inforBox):
    # inforBox[0]: nguồn, inforBox[1]: aggerate, inforBox[2]: flat file destination
    # lấy các thông tin trong các box
    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            file_name_source = inforBox[i]['fileName']
            df = utils.read_file('static/storage/source/'+file_name_source)

        elif inforBox[i]['name'] == 'database_source':
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            columns = inforBox[i]['columns']

            df = utils.get_data_database(database_username, database_password, database_ip, database_name, table_name)
            df = df[columns]

        elif inforBox[i]['name'] == 'aggerate':
            input_column =[]
            operation = []
            output_alias = []
            agg = inforBox[i]['agg']

            for d in agg:
                input_column.append(d['input_column'])
                operation.append(d['operation'])
                output_alias.append(d['output_alias'])
        else:
            file_name_destination = inforBox[i]['fileName']
            delimited = inforBox[i]['delimited']
            overwrite = inforBox[i]['overwrite']

    # Tính toán khi có groupby
    if 'groupby' in operation:
        groupby_column = []
        another_column = []
        another_operation = []
        for i in range(len(operation)):
            if operation[i] == 'groupby':
                groupby_column.append(input_column[i])
            else:
                another_column.append(input_column[i])
                another_operation.append(operation[i])

        aggfunc= dict()
        for i in range(len(another_operation)):
            if another_operation[i] == 'sum':
                aggfunc[another_column[i]] = 'sum'
            elif another_operation[i] == 'max':
                aggfunc[another_column[i]] = 'max'
            elif another_operation[i] == 'min':
                aggfunc[another_column[i]] = 'min'
            elif another_operation[i] == 'average':
                aggfunc[another_column[i]] = 'mean'
            elif another_operation[i] == 'count':
                aggfunc[another_column[i]] = 'count'
            elif another_operation[i] == 'count distinct':
                aggfunc[another_column[i]] = pd.Series.nunique
            

        df = df.pivot_table(index=groupby_column, values= another_column, aggfunc=aggfunc).reset_index()
    # Tính toán khi không có groupby
    else:
        aggfunc= dict()
        for i in range(len(operation)):
            if operation[i] == 'sum':
                aggfunc[input_column[i]] = 'sum'
            elif operation[i] == 'max':
                aggfunc[input_column[i]] = 'max'
            elif operation[i] == 'min':
                aggfunc[input_column[i]] = 'min'
            elif operation[i] == 'average':
                aggfunc[input_column[i]] = 'mean'
            elif operation[i] == 'count':
                aggfunc[input_column[i]] = 'count'
            elif operation[i] == 'count distinct':
                aggfunc[input_column[i]] = pd.Series.nunique

        df = df.agg(aggfunc).reset_index()

    # Đổi tên cột
    rename_column = dict()
    for i in range(len(input_column)):
        rename_column[input_column[i]] = output_alias[i]
    df.rename(columns=rename_column, inplace=True)
    
    # Ghi kết quả ra file
    utils.write_file(df, 'static/storage/destination/'+file_name_destination, index=False, sep=delimited, overwrite=overwrite)
    # if overwrite == False:
    #     df.to_csv('static/storage/destination/'+file_name_destination, sep=delimited, mode='a', index=False)
    # else:
    #     df.to_csv('static/storage/destination/'+file_name_destination, sep=delimited, index=False)


# Thực hiện sort và lưu kết quả vào database
def save_sort_to_MySQL(inforBox):
    # Lấy thông tin trong các box
    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            file_name_source = inforBox[i]['fileName']
            df = utils.read_file('static/storage/source/'+file_name_source)
        elif inforBox[i]['name'] == 'sort':
            input_column =[]
            sort_type = []
            remove_duplicate = inforBox[i]['remove_duplicate']
            sort = inforBox[i]['sort']

            for d in sort:
                input_column.append(d['input_column'])
                sort_type.append(d['sort_type'])
                
        else:
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            matching = inforBox[i]['matching']
            print(matching)
            print(type(matching))
            
    df = df[input_column]
    column_need_sort = [column for i, column in enumerate(input_column) if sort_type[i] != 'ignore']
    sort_type = [st for st in sort_type if st != 'ignore']

    # Thực hiện sort theo thứ tự
    ascending = ['ascending' == st for st in sort_type]
    df = df.sort_values(column_need_sort, ascending = ascending)

    if remove_duplicate == True:
        df = df.drop_duplicates(subset=input_column, keep='first')

    # Đổi tên theo matching và lưu vào MySQL
    df.rename(columns=matching, inplace=True)

    engine = sqlalchemy.create_engine('mysql+mysqlconnector://{0}:{1}@{2}/{3}'.
                                          format(database_username, database_password, 
                                                database_ip, database_name))

    utils.insert_to_MySQL(df, engine, table_name)
    engine.dispose()


def save_union_to_MySQL(inforBox):
    df = {} # key: id của box chứa df cần union, value: data - dataframe
    id_boxs = [] #id của các box chứa df cần union
    output_columns = [] # lưu tên các cột của bảng kết quả
    input_output_column = {} # key: id của box chứa df cần union, value: là một dict khác lưu: key: tên cột ban đầu, value: tên cột đích cần ghi ra

    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            id_box = inforBox[i]['id']
            id_boxs.append(str(id_box))

            file_name_source = inforBox[i]['fileName']
            df[str(id_box)] = utils.read_file('static/storage/source/'+file_name_source)

        elif inforBox[i]['name'] == 'database_source':
            id_box = inforBox[i]['id']
            id_boxs.append(str(id_box))

            database_username_ = inforBox[i]['db_username']
            database_password_ = inforBox[i]['db_password']
            database_ip_ = inforBox[i]['db_ip']
            database_name_ = inforBox[i]['db_name']
            table_name_ = inforBox[i]['table_name']
            columns = inforBox[i]['columns']

            df = utils.get_data_database(database_username_, database_password_, database_ip_, database_name_, table_name_)
            df[str(id_box)] = df[columns]

        elif inforBox[i]['name'] == 'union_all':
            unions = inforBox[i]['union']
            for id_box in id_boxs:
                input_output_column[id_box] = {}

            for union in unions:
                output_columns.append(union['output_column'])
                for id_box in id_boxs:
                    if union[id_box] != 'ignore':
                        input_output_column[id_box][union[id_box]] = union['output_column']

        elif inforBox[i]['name'] == 'database_destination':
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            matching = inforBox[i]['matching']


    df_result = pd.DataFrame(columns = output_columns)
    for id_box in id_boxs:
        col_df = input_output_column[id_box].keys() # lấy tên các cột cần union 
        # print(col_df)
        # print(df[str(id_box)])
        df_temp = df[id_box][col_df]
        df_temp.rename(columns=input_output_column[id_box], inplace=True)
        df_result = pd.concat([df_result, df_temp])

    print(df_result)

    # Đổi tên theo matching và lưu vào MySQL
    df_result.rename(columns=matching, inplace=True)

    engine = sqlalchemy.create_engine('mysql+mysqlconnector://{0}:{1}@{2}/{3}'.
                                          format(database_username, database_password, 
                                                database_ip, database_name))

    utils.insert_to_MySQL(df_result, engine, table_name)
    engine.dispose()


def derived_column(inforBox):
    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            file_name_source = inforBox[i]['fileName']
            df = utils.read_file('static/storage/source/'+file_name_source)

        elif inforBox[i]['name'] == 'database_source':
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            columns = inforBox[i]['columns']

            engine = sqlalchemy.create_engine('mysql+mysqlconnector://{0}:{1}@{2}/{3}'.
                                                  format(database_username, database_password, 
                                                        database_ip, database_name))

            df = utils.read_table_MySQL(table_name, engine)
            df = df[columns]
            engine.dispose()

        elif inforBox[i]['name'] == 'derived_column':
            columns = inforBox[i]['columns']
            df = df[columns]
            
            derived = inforBox[i]['derived']
            derived = [d for d in derived if d['express'] != '']
            for d in derived:
                column = d['output_column']
                replace = d['replace']
                express = d['express'].replace('[', 'df[')
                if replace == 'addnew':
                    df[column] = eval(express)
                else:
                    df[replace] = eval(express)
                    df.rename(columns={replace: column}, inplace=True)

        elif inforBox[i]['name'] == 'flat_file_destination':
            file_name_destination = inforBox[i]['fileName']
            delimited = inforBox[i]['delimited']
            overwrite = inforBox[i]['overwrite']


    utils.write_file(df, 'static/storage/destination/'+file_name_destination, index=False, sep=delimited, overwrite=overwrite)


def merge_join(inforBox):
    df = {} # key: id box, value: df
    column_table_1 = {} # key: tên cột, value: tên cột sau khi merge nếu trùng 
    column_table_2 = {}
    save_to_flat_file = False

    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            file_name_source = inforBox[i]['fileName']
            id_box = inforBox[i]['id']
            df_ = utils.read_file('static/storage/source/'+file_name_source)
            df[str(id_box)] = df_

        elif inforBox[i]['name'] == 'database_source':
            id_box = inforBox[i]['id']
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            columns = inforBox[i]['columns']

            engine = sqlalchemy.create_engine('mysql+mysqlconnector://{0}:{1}@{2}/{3}'.
                                                  format(database_username, database_password, 
                                                        database_ip, database_name))

            df_ = utils.read_table_MySQL(table_name, engine)
            df_ = df_[columns]
            df[str(id_box)] = df_
            engine.dispose()

        elif inforBox[i]['name'] == 'merge_join':
            # join_type = inforBox[i]['join_type']
            id_box_table_1 = inforBox[i]['id_box_table_1']
            id_box_table_2 = inforBox[i]['id_box_table_2'] 
            join_key_table_1 = [v for k, v in sorted(inforBox[i]['join_key_table_1'].items(), key= lambda item: item[0])]
            join_key_table_2 = [v for k, v in sorted(inforBox[i]['join_key_table_2'].items(), key= lambda item: item[0])]
            merge = inforBox[i]['merge']

            for m in merge:
                if m['name_table'] == 'Table_1':
                    column_table_1[m['input_column']] = m['output_alias']
                else:
                    column_table_2[m['input_column']] = m['output_alias']

        elif inforBox[i]['name'] == 'flat_file_destination':
            save_to_flat_file = True
            file_name_destination = inforBox[i]['fileName']
            delimited = inforBox[i]['delimited']
            overwrite = inforBox[i]['overwrite']

    # đổi tên key theo đầu ra
    join_key_table_1 = [i if i not in column_table_1 else column_table_1[i] for i in join_key_table_1]
    join_key_table_2 = [i if i not in column_table_2 else column_table_2[i] for i in join_key_table_2]

    # đổi tên df theo đầu ra
    df1 = df[id_box_table_1]
    df1.rename(columns=column_table_1, inplace=True)
    df1 = df1[set(list(column_table_1.values())+join_key_table_1)]
    
    df2 = df[id_box_table_2]
    df2.rename(columns=column_table_2, inplace=True)
    df2 = df2[set(list(column_table_2.values())+join_key_table_2)]
    
    column_result = list(column_table_1.values()) + list(column_table_2.values())

    df_result = pd.merge(df1, df2, left_on= join_key_table_1, right_on= join_key_table_2)
    print(df_result)
    df_result = df_result[column_result]

    if save_to_flat_file == True:
        utils.write_file(df_result, 'static/storage/destination/'+file_name_destination, index=False, sep=delimited, overwrite=overwrite)


# Thực hiện conditional_split và lưu kết quả vào database
def save_conditional_split_to_MySQL(inforBox):
    save_to_flat_file = False

    # Lấy thông tin trong các box
    for i in range(len(inforBox)):
        if inforBox[i]['name'] == 'flat_file_source':
            file_name_source = inforBox[i]['fileName']
            df = utils.read_file('static/storage/source/'+file_name_source)
        elif inforBox[i]['name'] == 'conditional_split':
            input_column =[]
            condition = []
            value_condition = []
            conditional_split = inforBox[i]['conditional_split_arr']

            for d in conditional_split:
                input_column.append(d['input_column'])
                condition.append(d['condition'])
                value_condition.append(int(d["value"]))
                
        elif inforBox[i]['name'] == 'database_destination':
            database_username = inforBox[i]['db_username']
            database_password = inforBox[i]['db_password']
            database_ip = inforBox[i]['db_ip']
            database_name = inforBox[i]['db_name']
            table_name = inforBox[i]['table_name']
            matching = inforBox[i]['matching']
            print(matching)
            print(type(matching))

        elif inforBox[i]['name'] == 'flat_file_destination':
            save_to_flat_file = True
            file_name_destination = inforBox[i]['fileName']
            delimited = inforBox[i]['delimited']
            overwrite = inforBox[i]['overwrite']

        elif inforBox[i]['name'] == 'database_source':
            id_box = inforBox[i]['id']

            database_username_ = inforBox[i]['db_username']
            database_password_ = inforBox[i]['db_password']
            database_ip_ = inforBox[i]['db_ip']
            database_name_ = inforBox[i]['db_name']
            table_name_ = inforBox[i]['table_name']
            columns = inforBox[i]['columns']

            df = utils.get_data_database(database_username_, database_password_, database_ip_, database_name_, table_name_)
            df = df[columns]

        
    for ind, column in enumerate(input_column):
        if (condition[ind] == "=="):
            df = df[df[column] == value_condition[ind]]
        elif (condition[ind] == ">"):
            df = df[df[column] > value_condition[ind]]
        elif (condition[ind] == "<"):
            df = df[df[column] < value_condition[ind]]
        elif (condition[ind] == ">="):
            df = df[df[column] >= value_condition[ind]]
        elif (condition[ind] == "<="):
            df = df[df[column] <= value_condition[ind]]
    print(df)


    # Đổi tên theo matching và lưu vào MySQL
    # df.rename(columns=matching, inplace=True)

    # engine = sqlalchemy.create_engine('mysql+mysqlconnector://{0}:{1}@{2}/{3}'.
    #                                       format(database_username, database_password, 
    #                                             database_ip, database_name))

    # utils.insert(df, engine, table_name)
    # engine.dispose()

    if save_to_flat_file == True:
        utils.write_file(df, 'static/storage/destination/'+file_name_destination, index=False, sep=delimited, overwrite=overwrite)



@app.route('/', methods=['GET', 'POST'])
def main():
    if request.method == 'POST':
        # Lấy các file input và lưu vào static/storage
        # files = request.files.getlist("source_file")
        # for file in files:
        #     file_name = file.filename
        #     path_to_save = os.path.join('static/storage', file_name)
        #     file.save(path_to_save)

        print('-------------------------------------------------------')
        # #print(request.form.getlist('name'))
        #json_data_box = request.json['data']

        # lấy thông tin của các box trong data flow
        json_data_boxs = request.form['data']
        arr_data_boxs = json.loads(json_data_boxs)
        name_boxs = [box['name'] for box in arr_data_boxs]
        print(arr_data_boxs)
        print(name_boxs)
        print('--------------------------------------------------------')

        if (len(name_boxs) == 2) and ('flat_file_source' in name_boxs) and ('database_destination' in name_boxs):
            import_to_MySQL(arr_data_boxs)

        if (len(name_boxs) == 2) and ('flat_file_source' in name_boxs) and ('flat_file_destination' in name_boxs):
            import_to_flatFile(arr_data_boxs)

        if (len(name_boxs) == 2) and ('flat_file_destination' in name_boxs) and ('database_source' in name_boxs):
            export_to_flatFile(arr_data_boxs)

        if ('aggerate' in name_boxs):
            save_aggerate_to_flat_file(arr_data_boxs)

        if (len(name_boxs) == 3) and ('flat_file_source' in name_boxs) and ('sort' in name_boxs) and ('database_destination' in name_boxs):
            save_sort_to_MySQL(arr_data_boxs)

        if ('union_all' in name_boxs):
            save_union_to_MySQL(arr_data_boxs)

        if ('multicast' in name_boxs):
            multicast(arr_data_boxs)

        if ('derived_column' in name_boxs):
            derived_column(arr_data_boxs)

        if ('merge_join' in name_boxs):
            merge_join(arr_data_boxs)

        if('conditional_split' in name_boxs):
            save_conditional_split_to_MySQL(arr_data_boxs)

        
        # Xóa tất cả file tải lên được lưu tạm
        source_file_saved = glob.glob('static/storage/source/*')
        for f in source_file_saved:
            os.remove(f)

        return 'Thực thi thành công'
    else:
        return render_template('data_flow.html')



# lấy tất cả file input và lưu vào static/storage
@app.route('/get_flat_file_source', methods=['GET', 'POST'])
def get_flat_file_source():
    # nếu type là mặc định thì lưu file, nếu không thì k cần lưu, chỉ trả về data (vd trong trường hợp lấy tiêu đề file trong aggerate)
    type = request.args.get('type', default = 'source', type = str)

    flat_file_source = request.files.get('flat_file_source')
    file_name = flat_file_source.filename
    path_to_save = os.path.join('static/storage/source/', file_name)
    if type == 'source':
        flat_file_source.save(path_to_save)
        
    print(file_name)
    df = utils.read_file('static/storage/source/'+file_name)
    return df.to_json(orient='records')


@app.route('/get_output_header_database', methods=['GET', 'POST'])
def get_output_header_database():
    infor_db = request.json['data']
    
    database_username = infor_db['db_username']
    database_password = infor_db['db_password']
    database_ip = infor_db['db_ip']
    database_name = infor_db['db_name']
    table_name = infor_db['table_name']

    h = utils.get_header_database(database_username, database_password, database_ip, database_name, table_name)
    return json.dumps(h)


@app.route('/get_data_database_source', methods=['GET', 'POST'])
def get_data_database_source():
    infor_db = request.json['data']
    
    database_username = infor_db['db_username']
    database_password = infor_db['db_password']
    database_ip = infor_db['db_ip']
    database_name = infor_db['db_name']
    table_name = infor_db['table_name']

    df = utils.get_data_database(database_username, database_password, database_ip, database_name, table_name)
    print(df)
    return df.to_json(orient='records')


    
if __name__ == '__main__':
    app.run(debug=False)