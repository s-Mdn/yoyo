import React from 'react';
import { Modal } from 'antd';
import './index.less'


const Children = (children) => {
  return <>{children}</>;
};

const modal = (props) => {
  const { title, visible, closable, footer, children, bodyStyle, width, onCancel, onOk } = props;
  const _bodyStyle = { padding: '10px', height: '200px' };

  return (
    <>
      <Modal
        bodyStyle={bodyStyle || _bodyStyle}
        width={width || '520px'}
        title={title}
        visible={visible}
        closable={closable || false}
        maskClosable={false}
        onCancel={onCancel}
        footer={
          footer || (
            <div>
              <button className='border border_r_3 font_12 py_2 px_10 mr_8'
                onClick={onCancel}>
                取 消
              </button>
              <button
                className='border_r_3 font_12 py_2 px_10 bg-FF8462 text-white'
                onClick={onOk}
              >
                确 认
              </button>
            </div>
          )
        }
      >
        {Children(children)}
      </Modal>
    </>
  );
};

export default modal;
