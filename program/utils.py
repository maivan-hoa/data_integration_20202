# -*- coding: utf-8 -*-
"""
Created on Wed Apr 14 22:56:46 2021

@author: HoaMV
"""

import pandas as pd
import sqlalchemy
import mysql
import json
import pickle
import xml.etree.ElementTree as et
import os
import pymysql


def read_file_text(filename):
    return pd.read_table(filename)


def read_file_pickle(filename):
    # read multiple object
    data = []
    with open(filename, 'rb') as f:
        while True:
            try:
                data.append(pickle.load(f))
            except:
                break
    return pd.DataFrame(data[0])


def read_file_excel(filename):    
    return pd.read_excel(filename, engine='openpyxl')
        

def read_file_csv(filename):
    return pd.read_csv(filename)


def read_file_json(filename):
    # with open(filename, encoding="utf8") as f:
    #     data = json.load(f)
        
    # df = pd.DataFrame.from_dict(data)
    return pd.read_json(filename)


def read_file_xml(filename):
    # Với file xml, tên tag định nghĩa không được có khoảng trắng
    xtree = et.parse(filename)
    # lấy node gốc
    xroot = xtree.getroot()
    data = []
    for node in xroot:
        d = dict()
        for item in node:
            d[item.tag] = item.text
        data.append(d)
    return pd.DataFrame(data)


def read_file(file_path):
    ext = os.path.splitext(file_path)[-1]
    if ext == '.json':
        return read_file_json(file_path)
    elif ext == '.csv':
        return read_file_csv(file_path)
    elif ext == '.xml':
        return read_file_xml(file_path)
    elif ext == '.pickle':
        return read_file_pickle(file_path)
    elif ext == '.txt':
        return read_file_text(file_path)
    elif ext == '.xlsx':
        return read_file_excel(file_path)



def write_file_csv(df, filename, index=False, sep=',', overwrite=False):
    if overwrite == False:
        df.to_csv(filename, sep=sep, mode='a', index=index)
    else:
        df.to_csv(filename, sep=sep, index=index)


def write_file_pickle(df, filename, index=False, overwrite=False):    
    if overwrite == False:
        df.to_pickle(filename, mode='a')
    else:
        df.to_pickle(filename)



def write_file_excel(df, filename, index=False, overwrite=False): 
    if overwrite == False:
        # ghi vào sheet mới
        with pd.ExcelWriter(filename, mode='a') as writer:  
            df.to_excel(writer, index=index)
        # df.to_excel(filename, mode='a', index=index)
    else:
        df.to_excel(filename, index=index)
        


def write_file_json(df, filename, index=True, overwrite=False):
    if overwrite == False:
        df.to_json(filename, index=index, orient="records")
    else:
        df.to_json(filename, index=index, orient="records")



def write_file(df, file_path, index=False, sep=',', overwrite=False):
    ext = os.path.splitext(file_path)[-1]
    if ext == '.json':
        return write_file_json(df, file_path, True, overwrite)
    elif ext == '.csv' or ext == '.txt':
        return write_file_csv(df, file_path, index, sep, overwrite)
    elif ext == '.xml':
        return write_file_xml(file_path)
    elif ext == '.pickle':
        return write_file_pickle(df, file_path, index, overwrite)
    elif ext == '.xlsx':
        return write_file_excel(df, file_path, index, overwrite)
    
    
def insert_to_MySQL(dataframe, connectDB, name_table):
    dataframe.to_sql(con=connectDB, name=name_table, if_exists='append', index=False)

    '''
        if_exists: {'fail', 'replace', 'append'}
            default: 'fail',
            fail: if table exists, do nothing
            replace: if table exists, drop it, create and insert data
            append: if table exists, insert data. Create if does not exist
    '''

def read_table_MySQL(name_table, connectDB):
    # Đọc vào dataframe
    query = "select * from {}".format(name_table)
    df = pd.read_sql(query, con= connectDB)
    return df



def get_header_database(database_username, database_password, database_ip, database_name, table_name):
    # tạo kết nối
    connection = pymysql.connect(
        host = database_ip,
        user= database_username,
        password= database_password,
        database = database_name
    )

    # Để đưa ra lệnh với cơ sở dữ liệu, ta cần tạo một đối tượng được gọi là Cursor
    mycursor = connection.cursor()
    
    s_query = 'show columns FROM {};'.format(table_name)
    mycursor.execute(s_query)
    result = [res[0] for res in mycursor.fetchall()]
    # đóng connection với pymysql.connect
    connection.close()
    
    return result

def get_data_database(database_username, database_password, database_ip, database_name, table_name):
    # tạo kết nối
    connection = pymysql.connect(
        host = database_ip,
        user= database_username,
        password= database_password,
        database = database_name
    )


    df = pd.read_sql("select * from {}".format(table_name), connection)

    # đóng connection với pymysql.connect
    connection.close()
    
    return df
    
    
# if __name__ == '__main__':
#     df = read_file(r'C:\Users\DELL\Desktop\20202\Data_Integration\Project\Book1.xlsx')
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    