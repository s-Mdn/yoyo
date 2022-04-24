import React from 'react';
import { Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const _Upload = ( props ) => {
  const { accept, multiple, data, handleUpload } = props
  return (
    <div className='w-full h-full'>
      <Upload
        accept={accept}
        multiple={multiple}
        data={data}
        showUploadList={false}
        onChange={handleUpload}
        action={`${process.env.REACT_APP_API}/api/common/upload`}
        className='flex items-center justify-center w-full h-full '>
        <span className='flex items-center justify-center'><PlusOutlined/></span>
        <span>Upload</span>
      </Upload>
    </div>
  )
}
export default _Upload